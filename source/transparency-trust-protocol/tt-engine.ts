/**
 * TT Engine — DB-backed Transparency Trust Protocol scoring
 *
 * Replaces quickScoreFromTier with full factor calculation.
 * Caches scores for 24 hours per userId+apiKeyId pair.
 * Falls back to quickScoreFromTier if DB is unavailable.
 */

import { db } from "@ml-systems/db";
import {
  ttScores,
  ttScoreHistory,
  users,
  apiKeys,
  materials,
  projects,
  deconSessions,
  designSessions,
  employees,
  annualReviews,
} from "@ml-systems/db/schema";
import { eq, and, count, isNull, isNotNull, sql, gte, desc } from "drizzle-orm";
import {
  calculateTransparencyScore,
  getAccessBand,
  quickScoreFromTier,
  type TransparencyFactors,
  type AccessBand,
} from "./transparency";
import type { ApiTier } from "./api-auth";

/* ─── Types ─── */

export interface TTScoreResult {
  score: number;
  band: AccessBand;
  factors: {
    tier: number;
    identity: number;
    materials: number;
    cycles: number;
    reviews: number;
    age: number;
    data: number;
    compliance: number;
  };
  isRegulator: boolean;
  calculatedAt: Date;
  expiresAt: Date;
  cached: boolean;
}

export type TTChangeReason =
  | "recalculation"
  | "tier_upgrade"
  | "material_contributed"
  | "cycle_completed"
  | "review_passed"
  | "data_contributed"
  | "manual_adjustment"
  | "account_aged";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const TT_VERSION = "1.0.0";

/* ─── Core: Get or Calculate ─── */

export async function getOrCalculateTTScore(
  userId: string,
  apiKeyId?: string,
): Promise<TTScoreResult> {
  try {
    // Check cache
    const cached = await db.query.ttScores.findFirst({
      where: and(
        eq(ttScores.userId, userId),
        apiKeyId ? eq(ttScores.apiKeyId, apiKeyId) : isNull(ttScores.apiKeyId),
        gte(ttScores.expiresAt, new Date()),
      ),
    });

    if (cached) {
      return {
        score: cached.score,
        band: cached.band as AccessBand,
        factors: {
          tier: cached.factorTier,
          identity: cached.factorIdentity,
          materials: cached.factorMaterials,
          cycles: cached.factorCycles,
          reviews: cached.factorReviews,
          age: cached.factorAge,
          data: cached.factorData,
          compliance: cached.isRegulator ? 5 : 0,
        },
        isRegulator: cached.isRegulator,
        calculatedAt: cached.calculatedAt,
        expiresAt: cached.expiresAt,
        cached: true,
      };
    }

    // Cache miss — calculate fresh
    return await calculateAndPersist(userId, apiKeyId, "recalculation");
  } catch (err) {
    console.error("[tt-engine] getOrCalculateTTScore error, falling back:", err);
    // Fallback: try to determine tier from apiKeyId
    return fallbackScore(userId, apiKeyId);
  }
}

/* ─── Force Recalculate ─── */

export async function forceRecalculateTTScore(
  userId: string,
  apiKeyId?: string,
  reason: TTChangeReason = "recalculation",
): Promise<TTScoreResult> {
  return calculateAndPersist(userId, apiKeyId, reason);
}

/* ─── Invalidate (cache bust) ─── */

export async function invalidateTTScore(userId: string): Promise<void> {
  try {
    // Set all cached scores for this user to expired
    await db
      .update(ttScores)
      .set({ expiresAt: new Date(0) })
      .where(eq(ttScores.userId, userId));
  } catch (err) {
    console.error("[tt-engine] invalidateTTScore error:", err);
  }
}

/* ─── Internal: Calculate & Persist ─── */

async function calculateAndPersist(
  userId: string,
  apiKeyId: string | undefined,
  reason: TTChangeReason,
): Promise<TTScoreResult> {
  const factors = await gatherFactors(userId, apiKeyId);
  const score = calculateTransparencyScore(factors);
  const band = getAccessBand(score);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

  const factorBreakdown = {
    tier: factors.tier === "enterprise" ? 50 : factors.tier === "pro" ? 30 : factors.tier === "starter" ? 15 : 5,
    identity: factors.identityVerified ? 20 : 0,
    materials: Math.min(factors.materialsContributed, 15),
    cycles: Math.min(factors.cyclesCompleted * 10, 30),
    reviews: Math.min(factors.reviewsPassed * 5, 15),
    age: Math.round(Math.min(factors.accountAgeDays / 365, 1) * 10),
    data: Math.min(Math.round(factors.dataContributions * 0.5), 10),
    compliance: factors.isRegulator ? 5 : 0,
  };

  // Check for existing score (for history tracking)
  const existing = await db.query.ttScores.findFirst({
    where: and(
      eq(ttScores.userId, userId),
      apiKeyId ? eq(ttScores.apiKeyId, apiKeyId) : isNull(ttScores.apiKeyId),
    ),
  });

  let ttScoreId: string;

  if (existing) {
    // Update existing row
    const [updated] = await db
      .update(ttScores)
      .set({
        score,
        band,
        factorTier: factorBreakdown.tier,
        factorIdentity: factorBreakdown.identity,
        factorMaterials: factorBreakdown.materials,
        factorCycles: factorBreakdown.cycles,
        factorReviews: factorBreakdown.reviews,
        factorAge: factorBreakdown.age,
        factorData: factorBreakdown.data,
        isRegulator: factors.isRegulator,
        calculatedAt: now,
        expiresAt,
        version: TT_VERSION,
      })
      .where(eq(ttScores.id, existing.id))
      .returning();
    ttScoreId = updated!.id;

    // Log history if score changed
    if (existing.score !== score) {
      await db.insert(ttScoreHistory).values({
        ttScoreId,
        userId,
        previousScore: existing.score,
        newScore: score,
        previousBand: existing.band,
        newBand: band,
        changeReason: reason,
        factorSnapshot: factorBreakdown,
      });
    }
  } else {
    // Insert new row
    const [created] = await db
      .insert(ttScores)
      .values({
        userId,
        apiKeyId: apiKeyId ?? null,
        score,
        band,
        factorTier: factorBreakdown.tier,
        factorIdentity: factorBreakdown.identity,
        factorMaterials: factorBreakdown.materials,
        factorCycles: factorBreakdown.cycles,
        factorReviews: factorBreakdown.reviews,
        factorAge: factorBreakdown.age,
        factorData: factorBreakdown.data,
        isRegulator: factors.isRegulator,
        calculatedAt: now,
        expiresAt,
        version: TT_VERSION,
      })
      .returning();
    ttScoreId = created!.id;

    // Log initial score
    await db.insert(ttScoreHistory).values({
      ttScoreId,
      userId,
      previousScore: null,
      newScore: score,
      previousBand: null,
      newBand: band,
      changeReason: reason,
      factorSnapshot: factorBreakdown,
    });
  }

  return {
    score,
    band,
    factors: factorBreakdown,
    isRegulator: factors.isRegulator,
    calculatedAt: now,
    expiresAt,
    cached: false,
  };
}

/* ─── Internal: Gather All Factors from DB ─── */

async function gatherFactors(
  userId: string,
  apiKeyId?: string,
): Promise<TransparencyFactors> {
  // Run all queries in parallel
  const [
    userRow,
    tierResult,
    materialCount,
    cycleCount,
    reviewCount,
    deconCount,
    designCount,
  ] = await Promise.all([
    // 1. User info (identity, age, regulator)
    db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { clerkId: true, role: true, createdAt: true },
    }),

    // 2. Highest tier among active API keys for this user
    apiKeyId
      ? db.query.apiKeys.findFirst({
          where: and(eq(apiKeys.id, apiKeyId), isNull(apiKeys.revokedAt)),
          columns: { tier: true },
        })
      : db.query.apiKeys.findFirst({
          where: and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)),
          columns: { tier: true },
          orderBy: [desc(apiKeys.createdAt)],
        }),

    // 3. Materials with ML Material IDs (contributed to provenance system)
    db
      .select({ value: count() })
      .from(materials)
      .innerJoin(projects, eq(materials.projectId, projects.id))
      .where(
        and(
          eq(projects.clientId, userId),
          isNotNull(materials.mlMaterialId),
        )
      ),

    // 4. Completed project cycles
    db
      .select({ value: count() })
      .from(projects)
      .where(and(eq(projects.clientId, userId), eq(projects.status, "complete"))),

    // 5. Passed annual reviews (via employee link)
    db
      .select({ value: count() })
      .from(annualReviews)
      .innerJoin(employees, eq(annualReviews.employeeId, employees.id))
      .where(and(eq(employees.userId, userId), eq(annualReviews.outcome, "pass"))),

    // 6. Completed decon sessions
    db
      .select({ value: count() })
      .from(deconSessions)
      .where(and(eq(deconSessions.userId, userId), eq(deconSessions.status, "complete"))),

    // 7. Design sessions
    db
      .select({ value: count() })
      .from(designSessions)
      .where(eq(designSessions.userId, userId)),
  ]);

  const tier = (tierResult?.tier as ApiTier) ?? "free";
  const isRegulator = userRow?.role === "state_agency";
  const identityVerified = !!userRow?.clerkId; // has Clerk identity = basic verification
  const accountAgeDays = userRow?.createdAt
    ? Math.floor((Date.now() - new Date(userRow.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const materialsContributed = materialCount[0]?.value ?? 0;
  const cyclesCompleted = cycleCount[0]?.value ?? 0;
  const reviewsPassed = reviewCount[0]?.value ?? 0;
  const dataContributions = (deconCount[0]?.value ?? 0) + (designCount[0]?.value ?? 0);

  return {
    tier,
    identityVerified,
    materialsContributed,
    cyclesCompleted,
    reviewsPassed,
    accountAgeDays,
    isRegulator,
    dataContributions,
  };
}

/* ─── Fallback (when DB is unavailable) ─── */

async function fallbackScore(
  userId: string,
  apiKeyId?: string,
): Promise<TTScoreResult> {
  let tier: ApiTier = "free";
  let isRegulator = false;

  try {
    if (apiKeyId) {
      const key = await db.query.apiKeys.findFirst({
        where: eq(apiKeys.id, apiKeyId),
        columns: { tier: true, userId: true },
      });
      if (key) tier = key.tier as ApiTier;
    }
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });
    if (user?.role === "state_agency") isRegulator = true;
  } catch {
    // If even this fails, use defaults
  }

  const score = quickScoreFromTier(tier, isRegulator);
  const band = getAccessBand(score);
  const now = new Date();

  return {
    score,
    band,
    factors: {
      tier: tier === "enterprise" ? 50 : tier === "pro" ? 30 : tier === "starter" ? 15 : 5,
      identity: 0,
      materials: 0,
      cycles: 0,
      reviews: 0,
      age: 0,
      data: 0,
      compliance: isRegulator ? 5 : 0,
    },
    isRegulator,
    calculatedAt: now,
    expiresAt: new Date(now.getTime() + 60000), // short TTL for fallback
    cached: false,
  };
}
