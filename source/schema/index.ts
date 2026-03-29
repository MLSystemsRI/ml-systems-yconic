import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  decimal,
  timestamp,
  date,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ─────────────────────────────────────────────────────────────
export const neuralNetLayerEnum = pgEnum("neural_net_layer", [
  "ML1", "ML2", "ML3",   // Physical Net
  "LM",  "FA",  "AE",    // Financial Net
  "EV",  "CR",  "GW",    // Dance Net
]);

export const userRoleEnum = pgEnum("user_role", [
  "client", "crew", "manager", "admin", "partner_lender", "sponsor", "state_agency", "architect", "seller",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "lead", "loan_origination", "deconstruction", "construction", "complete", "resold",
]);

export const projectPhaseEnum = pgEnum("project_phase", [
  "loan", "decon", "construction",
]);

export const projectOutcomeEnum = pgEnum("project_outcome", [
  "rebuild", "resell",
]);

export const loanTypeEnum = pgEnum("loan_type", [
  "RCM", "conventional", "bridge",
]);

export const loanStatusEnum = pgEnum("loan_status", [
  "application", "pit_open", "processing", "approved", "funded", "active", "paid_off",
]);

export const pitStatusEnum = pgEnum("pit_status", [
  "open", "awarded", "expired", "cancelled",
]);

export const bidStatusEnum = pgEnum("bid_status", [
  "active", "withdrawn", "awarded", "rejected",
]);

export const materialCategoryEnum = pgEnum("material_category", [
  "structural", "electrical", "plumbing", "finish", "roofing", "other",
]);

export const materialDispositionEnum = pgEnum("material_disposition", [
  "resale", "reuse", "recycle", "landfill",
]);

export const materialStatusEnum = pgEnum("material_status", [
  "identified", "recovered", "graded", "listed", "sold", "reused", "recycled",
]);

export const materialGradeEnum = pgEnum("material_grade", [
  "A", "B", "C", "D", "salvage",
]);

export const contaminationStatusEnum = pgEnum("contamination_status", [
  "clean", "lead", "asbestos", "mold", "untested",
]);

export const provenanceEventTypeEnum = pgEnum("provenance_event_type", [
  "identified", "tested", "recovered", "graded", "photographed", "listed", "sold", "dem_reported",
]);

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "pending", "in_progress", "complete", "blocked",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "permit", "loan_doc", "material_manifest", "photo", "contract", "other",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "WSDC", "local", "sponsor",
]);

export const phaseStatusEnum = pgEnum("phase_status", [
  "pending", "active", "complete",
]);

// ── Token transaction type ─────────────────────────────────────────────
export const tokenTxTypeEnum = pgEnum("token_tx_type", [
  "grant",    // admin or system credit
  "deduct",   // agent conversation consumed
  "purchase", // client bought tokens (Stripe — future)
  "refund",   // returned after failed request
]);

// ── Users ─────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id:               uuid("id").primaryKey().defaultRandom(),
  clerkId:          text("clerk_id").notNull().unique(),
  email:            text("email").notNull().unique(),
  fullName:         text("full_name").notNull(),
  phone:            text("phone"),
  role:             userRoleEnum("role").notNull().default("client"),
  neuralNetLayer:   neuralNetLayerEnum("neural_net_layer"),
  // ── Builders Credits (advisory sessions) ────────────────────────────
  tokenBalance:     integer("token_balance").notNull().default(0),
  tokensUsedTotal:  integer("tokens_used_total").notNull().default(0),
  // ── Compute Credits (file/media AI processing) ───────────────────────
  computeBalance:   integer("compute_balance").notNull().default(0),
  computeUsedTotal: integer("compute_used_total").notNull().default(0),
  // ── Stripe ───────────────────────────────────────────────────────────
  stripeCustomerId: text("stripe_customer_id").unique(),
  createdAt:        timestamp("created_at").notNull().defaultNow(),
  updatedAt:        timestamp("updated_at").notNull().defaultNow(),
  deletedAt:        timestamp("deleted_at"),
}, (t) => ({
  clerkIdx: uniqueIndex("users_clerk_id_idx").on(t.clerkId),
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
}));

// ── Token Transactions (ledger) ────────────────────────────────────────
export const tokenTransactions = pgTable("token_transactions", {
  id:             uuid("id").primaryKey().defaultRandom(),
  userId:         uuid("user_id").notNull().references(() => users.id),
  creditType:     text("credit_type").notNull().default("builders"), // "builders" | "compute"
  type:           tokenTxTypeEnum("type").notNull(),
  amount:         integer("amount").notNull(),         // positive = credit, negative = debit
  balanceBefore:  integer("balance_before").notNull(),
  balanceAfter:   integer("balance_after").notNull(),
  reason:         text("reason"),                      // e.g. "onboarding_bonus", "agent_conversation"
  // ── Anthropic usage (populated on agent deducts only) ──────────────
  inputTokens:    integer("input_tokens"),             // total input tokens sent to API
  outputTokens:   integer("output_tokens"),            // total output tokens received
  costMillicents: integer("cost_millicents"),          // estimated cost (1 cent = 1000 millicents)
  createdAt:      timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  userIdx:      index("token_tx_user_idx").on(t.userId),
  createdAtIdx: index("token_tx_created_at_idx").on(t.createdAt),
}));

// ── Timesheets (crew clock-in/out) ────────────────────────────────────
export const timesheets = pgTable("timesheets", {
  id:              uuid("id").primaryKey().defaultRandom(),
  userId:          uuid("user_id").notNull().references(() => users.id),
  projectId:       uuid("project_id"),                          // optional job site link
  clockIn:         timestamp("clock_in").notNull(),
  clockOut:        timestamp("clock_out"),                      // null while active
  durationMinutes: integer("duration_minutes"),                  // set on clock-out
  notes:           text("notes"),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  userIdx:    index("timesheets_user_idx").on(t.userId),
  activeIdx:  index("timesheets_active_idx").on(t.userId, t.clockOut),
}));

// ── Crew Documents (mobile uploads from job site) ─────────────────────
export const crewDocuments = pgTable("crew_documents", {
  id:          uuid("id").primaryKey().defaultRandom(),
  userId:      uuid("user_id").notNull().references(() => users.id),
  timesheetId: uuid("timesheet_id"),                            // optional link to shift
  projectId:   uuid("project_id"),
  label:       text("label"),                                   // "site photo", "receipt", etc.
  storageKey:  text("storage_key").notNull(),                   // R2 public URL
  mimeType:    text("mime_type"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  userIdx: index("crew_docs_user_idx").on(t.userId),
}));

// ── Properties ────────────────────────────────────────────────────────
export const properties = pgTable("properties", {
  id:                    uuid("id").primaryKey().defaultRandom(),
  ownerId:               uuid("owner_id").notNull().references(() => users.id),
  addressLine1:          text("address_line1").notNull(),
  addressLine2:          text("address_line2"),
  city:                  text("city").notNull(),
  state:                 text("state").notNull().default("RI"),
  zip:                   text("zip").notNull(),
  parcelId:              text("parcel_id"),
  currentAssessedValue:  integer("current_assessed_value"),  // cents
  latitude:              decimal("latitude", { precision: 10, scale: 7 }),
  longitude:             decimal("longitude", { precision: 10, scale: 7 }),
  createdAt:             timestamp("created_at").notNull().defaultNow(),
  updatedAt:             timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  ownerIdx: index("properties_owner_idx").on(t.ownerId),
}));

// ── Projects ──────────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id:                         uuid("id").primaryKey().defaultRandom(),
  propertyId:                 uuid("property_id").notNull().references(() => properties.id),
  clientId:                   uuid("client_id").notNull().references(() => users.id),
  cycleNumber:                integer("cycle_number").notNull().default(1),
  status:                     projectStatusEnum("status").notNull().default("lead"),
  currentPhase:               projectPhaseEnum("current_phase"),
  outcome:                    projectOutcomeEnum("outcome"),
  aiEfficiencyScore:          integer("ai_efficiency_score"),        // 0-100
  aiScoreUpdatedAt:           timestamp("ai_score_updated_at"),
  nextCycleProjectedEquity:   integer("next_cycle_projected_equity"), // cents
  createdAt:                  timestamp("created_at").notNull().defaultNow(),
  updatedAt:                  timestamp("updated_at").notNull().defaultNow(),
  deletedAt:                  timestamp("deleted_at"),
}, (t) => ({
  clientIdx: index("projects_client_id_idx").on(t.clientId),
  statusIdx: index("projects_status_idx").on(t.status),
}));

// ── Loans ─────────────────────────────────────────────────────────────
export const loans = pgTable("loans", {
  id:                    uuid("id").primaryKey().defaultRandom(),
  projectId:             uuid("project_id").notNull().references(() => projects.id),
  partnerLenderId:       uuid("partner_lender_id").references(() => users.id),
  loanType:              loanTypeEnum("loan_type").notNull().default("RCM"),
  principalAmount:       integer("principal_amount").notNull(),          // cents
  interestRate:          decimal("interest_rate", { precision: 5, scale: 4 }).notNull(),
  currentPrincipalBalance: integer("current_principal_balance").notNull(), // cents
  termMonths:            integer("term_months").notNull().default(360),
  status:                loanStatusEnum("status").notNull().default("application"),
  fundedAt:              timestamp("funded_at"),
  externalLoanId:        text("external_loan_id"),
  createdAt:             timestamp("created_at").notNull().defaultNow(),
  updatedAt:             timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  projectIdx: index("loans_project_idx").on(t.projectId),
}));

// ── Loan Pits (reverse auction for construction loans) ──────────────
export const loanPits = pgTable("loan_pits", {
  id:              uuid("id").primaryKey().defaultRandom(),
  loanId:          uuid("loan_id").notNull().references(() => loans.id),
  status:          pitStatusEnum("status").notNull().default("open"),
  openedAt:        timestamp("opened_at").notNull().defaultNow(),
  closesAt:        timestamp("closes_at").notNull(),
  awardedAt:       timestamp("awarded_at"),
  awardedBidId:    uuid("awarded_bid_id"),   // FK added after loanBids defined
  awardedBy:       uuid("awarded_by").references(() => users.id),
  minBidders:      integer("min_bidders").notNull().default(2),
  anonymizedData:  jsonb("anonymized_data").notNull(),  // snapshot of project data for lenders
  successFeeCents: integer("success_fee_cents").notNull().default(0),  // computed at award: principalAmount * 0.0025
  successFeePaid:  boolean("success_fee_paid").notNull().default(false), // flipped when Stripe collects (future)
  createdAt:       timestamp("created_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  loanIdx:   index("loan_pits_loan_idx").on(t.loanId),
  statusIdx: index("loan_pits_status_idx").on(t.status),
}));

// ── Loan Bids (lender offers in a pit) ──────────────────────────────
export const loanBids = pgTable("loan_bids", {
  id:                uuid("id").primaryKey().defaultRandom(),
  pitId:             uuid("pit_id").notNull().references(() => loanPits.id),
  lenderId:          uuid("lender_id").notNull().references(() => users.id),
  interestRate:      decimal("interest_rate", { precision: 5, scale: 4 }).notNull(),
  termMonths:        integer("term_months").notNull(),
  originationFee:    decimal("origination_fee", { precision: 5, scale: 4 }).notNull().default("0"),  // as decimal %
  specialConditions: text("special_conditions"),
  loanType:          loanTypeEnum("loan_type").notNull().default("conventional"),
  bidFeePaid:        integer("bid_fee_paid").notNull().default(0),     // cents — tier-based fee recorded at bid time
  bidSource:         text("bid_source").notNull().default("manual"),  // manual | api | white_label
  partnerLenderId:   uuid("partner_lender_id"),                       // FK to partner_lenders (nullable)
  status:            bidStatusEnum("status").notNull().default("active"),
  submittedAt:       timestamp("submitted_at").notNull().defaultNow(),
  withdrawnAt:       timestamp("withdrawn_at"),
  createdAt:         timestamp("created_at").notNull().defaultNow(),
  updatedAt:         timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  pitIdx:    index("loan_bids_pit_idx").on(t.pitId),
  lenderIdx: index("loan_bids_lender_idx").on(t.lenderId),
}));

// ── Equity Snapshots (append-only) ───────────────────────────────────
export const equitySnapshots = pgTable("equity_snapshots", {
  id:                      uuid("id").primaryKey().defaultRandom(),
  projectId:               uuid("project_id").notNull().references(() => projects.id),
  snapshotDate:            date("snapshot_date").notNull(),
  propertyValueEstimate:   integer("property_value_estimate").notNull(),  // cents
  principalBalance:        integer("principal_balance").notNull(),         // cents
  materialRecoveryValue:   integer("material_recovery_value").notNull().default(0), // cents
  totalEquity:             integer("total_equity").notNull(),              // cents (computed: property - principal + materials)
  cycleNumber:             integer("cycle_number").notNull(),
  createdAt:               timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  projectDateIdx: index("equity_project_date_idx").on(t.projectId, t.snapshotDate),
}));

// ── Phases ────────────────────────────────────────────────────────────
export const phases = pgTable("phases", {
  id:          uuid("id").primaryKey().defaultRandom(),
  projectId:   uuid("project_id").notNull().references(() => projects.id),
  phaseType:   projectPhaseEnum("phase_type").notNull(),
  status:      phaseStatusEnum("status").notNull().default("pending"),
  startedAt:   timestamp("started_at"),
  completedAt: timestamp("completed_at"),
}, (t) => ({
  projectIdx: index("phases_project_idx").on(t.projectId),
}));

// ── Milestones ────────────────────────────────────────────────────────
export const milestones = pgTable("milestones", {
  id:            uuid("id").primaryKey().defaultRandom(),
  phaseId:       uuid("phase_id").notNull().references(() => phases.id),
  name:          text("name").notNull(),
  description:   text("description"),
  plannedDate:   date("planned_date"),
  completedDate: date("completed_date"),
  status:        milestoneStatusEnum("status").notNull().default("pending"),
  blockerNotes:  text("blocker_notes"),
  createdBy:     uuid("created_by").notNull().references(() => users.id),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  phaseIdx: index("milestones_phase_idx").on(t.phaseId),
}));

// ── Materials ─────────────────────────────────────────────────────────
export const materials = pgTable("materials", {
  id:                  uuid("id").primaryKey().defaultRandom(),
  projectId:           uuid("project_id").references(() => projects.id),  // nullable — decon sessions create materials before projects exist
  name:                text("name").notNull(),
  category:            materialCategoryEnum("category").notNull(),
  quantity:            decimal("quantity", { precision: 10, scale: 2 }),
  unit:                text("unit"),
  weightLbs:           decimal("weight_lbs", { precision: 10, scale: 2 }),
  estimatedValueCents: integer("estimated_value_cents").notNull().default(0),
  actualValueCents:    integer("actual_value_cents"),
  disposition:         materialDispositionEnum("disposition").notNull(),
  status:              materialStatusEnum("status").notNull().default("identified"),
  recoveredAt:         timestamp("recovered_at"),
  // ── Provenance fields ───────────────────────────────────────────────
  mlMaterialId:        text("ml_material_id").unique(),                     // ML-2026-001-R042
  grade:               materialGradeEnum("grade"),                          // A/B/C/D/salvage
  contaminationStatus: contaminationStatusEnum("contamination_status").default("untested"),
  photos:              jsonb("photos").default([]),                          // {url, caption, takenAt}[]
  dimensions:          text("dimensions"),                                  // "2x4x92-5/8"
  species:             text("species"),                                     // "Douglas Fir", "Red Oak"
  deconSessionId:      uuid("decon_session_id").references(() => deconSessions.id),
  qrCodeUrl:           text("qr_code_url"),                                // R2-hosted QR image
  createdAt:           timestamp("created_at").notNull().defaultNow(),
  updatedAt:           timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  projectActiveIdx: index("materials_project_active_idx")
    .on(t.projectId, t.status)
    .where(sql`status != 'recycled'`),
  mlMaterialIdIdx: uniqueIndex("materials_ml_material_id_idx").on(t.mlMaterialId),
}));

// ── Material Provenance (audit log) ──────────────────────────────────
export const materialProvenance = pgTable("material_provenance", {
  id:          uuid("id").primaryKey().defaultRandom(),
  materialId:  uuid("material_id").notNull().references(() => materials.id),
  eventType:   provenanceEventTypeEnum("event_type").notNull(),
  eventData:   jsonb("event_data").default({}),
  performedBy: uuid("performed_by").references(() => users.id),
  notes:       text("notes"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  materialIdx:  index("provenance_material_idx").on(t.materialId),
  eventTypeIdx: index("provenance_event_type_idx").on(t.eventType),
  createdAtIdx: index("provenance_created_at_idx").on(t.createdAt),
}));

// ── Efficiency Scores ─────────────────────────────────────────────────
export const efficiencyScores = pgTable("efficiency_scores", {
  id:                      uuid("id").primaryKey().defaultRandom(),
  projectId:               uuid("project_id").notNull().references(() => projects.id),
  score:                   integer("score").notNull(),                // 0-100
  timelineScore:           integer("timeline_score").notNull(),
  materialUtilizationScore: integer("material_utilization_score").notNull(),
  costVarianceScore:       integer("cost_variance_score").notNull(),
  laborEfficiencyScore:    integer("labor_efficiency_score").notNull(),
  modelVersion:            text("model_version").notNull(),
  inputFeatures:           jsonb("input_features").notNull(),
  explanation:             text("explanation"),
  scoredAt:                timestamp("scored_at").notNull().defaultNow(),
}, (t) => ({
  projectIdx: index("efficiency_scores_project_idx").on(t.projectId),
}));

// ── Documents ─────────────────────────────────────────────────────────
export const documents = pgTable("documents", {
  id:           uuid("id").primaryKey().defaultRandom(),
  projectId:    uuid("project_id").notNull().references(() => projects.id),
  uploadedBy:   uuid("uploaded_by").notNull().references(() => users.id),
  type:         documentTypeEnum("type").notNull(),
  storageKey:   text("storage_key").notNull(),   // Cloudflare R2 object key
  fileName:     text("file_name").notNull(),
  mimeType:     text("mime_type").notNull(),
  sizeBytes:    integer("size_bytes").notNull(),
  phase:        projectPhaseEnum("phase"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  deletedAt:    timestamp("deleted_at"),
}, (t) => ({
  projectIdx:  index("documents_project_idx").on(t.projectId),
  uploaderIdx: index("documents_uploader_idx").on(t.uploadedBy),
}));

// ── Events (Dance Net / WCS community) ───────────────────────────────
export const events = pgTable("events", {
  id:              uuid("id").primaryKey().defaultRandom(),
  name:            text("name").notNull(),
  type:            eventTypeEnum("type").notNull(),
  location:        text("location").notNull(),
  eventDate:       date("event_date").notNull(),
  sponsorId:       uuid("sponsor_id").references(() => users.id),
  registrationUrl: text("registration_url"),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
});

// ── Relations ─────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  ownedProperties:   many(properties),
  projects:          many(projects),
  documents:         many(documents),
  tokenTransactions: many(tokenTransactions),
  apiKeys:           many(apiKeys),
}));

export const tokenTransactionsRelations = relations(tokenTransactions, ({ one }) => ({
  user: one(users, { fields: [tokenTransactions.userId], references: [users.id] }),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner:    one(users, { fields: [properties.ownerId], references: [users.id] }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  property:        one(properties, { fields: [projects.propertyId], references: [properties.id] }),
  client:          one(users, { fields: [projects.clientId], references: [users.id] }),
  loans:           many(loans),
  equitySnapshots: many(equitySnapshots),
  phases:          many(phases),
  materials:       many(materials),
  efficiencyScores: many(efficiencyScores),
  documents:       many(documents),
  deconSessions:   many(deconSessions),
}));

export const phasesRelations = relations(phases, ({ one, many }) => ({
  project:    one(projects, { fields: [phases.projectId], references: [projects.id] }),
  milestones: many(milestones),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  phase: one(phases, { fields: [milestones.phaseId], references: [phases.id] }),
}));

// ── Loan Pit Relations ───────────────────────────────────────────────
export const loanPitsRelations = relations(loanPits, ({ one, many }) => ({
  loan:       one(loans, { fields: [loanPits.loanId], references: [loans.id] }),
  awardedByUser: one(users, { fields: [loanPits.awardedBy], references: [users.id] }),
  bids:       many(loanBids),
}));

export const loanBidsRelations = relations(loanBids, ({ one }) => ({
  pit:           one(loanPits, { fields: [loanBids.pitId], references: [loanPits.id] }),
  lender:        one(users, { fields: [loanBids.lenderId], references: [users.id] }),
  partnerLender: one(partnerLenders, { fields: [loanBids.partnerLenderId], references: [partnerLenders.id] }),
}));

// ── Design Sessions (R&D — one row per completed Design Studio run) ───
export const designSessions = pgTable("design_sessions", {
  id:                  uuid("id").primaryKey().defaultRandom(),
  userId:              uuid("user_id").notNull().references(() => users.id),
  sessionKey:          text("session_key"),                           // client-generated UUID, links to designDocuments
  style:               text("style").notNull(),
  sustainabilityScore: integer("sustainability_score").notNull().default(0),
  dfdCovered:          jsonb("dfd_covered").notNull().default([]),   // string[] — DFD task IDs confirmed
  regCovered:          jsonb("reg_covered").notNull().default([]),   // string[] — regulatory task IDs confirmed
  brief:               text("brief").notNull().default(""),
  prefillData:         jsonb("prefill_data"),                        // extracted answers from Idea Builder
  rendersGenerated:    boolean("renders_generated").notNull().default(false),
  inputTokens:         integer("input_tokens").notNull().default(0),
  outputTokens:        integer("output_tokens").notNull().default(0),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  userIdx:      index("design_sessions_user_idx").on(t.userId),
  createdAtIdx: index("design_sessions_created_at_idx").on(t.createdAt),
}));

export const designSessionsRelations = relations(designSessions, ({ one, many }) => ({
  user: one(users, { fields: [designSessions.userId], references: [users.id] }),
  documents: many(designDocuments),
}));

// ── Design Documents (uploads during Design Studio — no projectId required) ──
export const designDocuments = pgTable("design_documents", {
  id:                uuid("id").primaryKey().defaultRandom(),
  sessionKey:        text("session_key").notNull(),              // client-generated UUID, links to designSessions
  userId:            uuid("user_id").notNull().references(() => users.id),
  stepNumber:        integer("step_number"),                      // 1-5, null = Idea Builder upload
  fileName:          text("file_name").notNull(),
  mimeType:          text("mime_type").notNull(),
  sizeBytes:         integer("size_bytes").notNull(),
  storageKey:        text("storage_key").notNull(),               // R2 public URL
  extractedData:     jsonb("extracted_data"),                     // AI Vision output (structured key-value)
  extractionSummary: text("extraction_summary"),                  // AI-generated human-readable summary
  createdAt:         timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  sessionIdx: index("design_docs_session_idx").on(t.sessionKey),
  userIdx:    index("design_docs_user_idx").on(t.userId),
}));

export const designDocumentsRelations = relations(designDocuments, ({ one }) => ({
  user:    one(users, { fields: [designDocuments.userId], references: [users.id] }),
  session: one(designSessions, { fields: [designDocuments.sessionKey], references: [designSessions.sessionKey] }),
}));

// ── Decon Sessions (AI assembly analysis from Decon Lab) ─────────────
export const deconSessionStatusEnum = pgEnum("decon_session_status", [
  "draft", "complete",
]);

export const deconSessions = pgTable("decon_sessions", {
  id:              uuid("id").primaryKey().defaultRandom(),
  userId:          uuid("user_id").notNull().references(() => users.id),
  projectId:       uuid("project_id").references(() => projects.id), // optional link to active project
  buildingType:    text("building_type").notNull(),
  yearBuilt:       integer("year_built").notNull(),
  description:     text("description"),
  materials:       jsonb("materials").notNull().default([]),           // string[] — detected materials
  separationPlan:  jsonb("separation_plan").notNull().default([]),     // string[] — ordered decon steps
  separationNotes: text("separation_notes"),                           // AI analysis of adhesive bonds
  recoveryScore:   integer("recovery_score"),                          // 0-100
  status:          deconSessionStatusEnum("status").notNull().default("draft"),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  userIdx:    index("decon_sessions_user_idx").on(t.userId),
  projectIdx: index("decon_sessions_project_idx").on(t.projectId),
}));

export const deconSessionsRelations = relations(deconSessions, ({ one, many }) => ({
  user:      one(users, { fields: [deconSessions.userId], references: [users.id] }),
  project:   one(projects, { fields: [deconSessions.projectId], references: [projects.id] }),
  materials: many(materials),
}));

export const materialsRelations = relations(materials, ({ one, many }) => ({
  project:      one(projects, { fields: [materials.projectId], references: [projects.id] }),
  deconSession: one(deconSessions, { fields: [materials.deconSessionId], references: [deconSessions.id] }),
  provenance:   many(materialProvenance),
}));

export const materialProvenanceRelations = relations(materialProvenance, ({ one }) => ({
  material:    one(materials, { fields: [materialProvenance.materialId], references: [materials.id] }),
  performedBy: one(users, { fields: [materialProvenance.performedBy], references: [users.id] }),
}));

// ── Helper: sql tag for partial index ────────────────────────────────
import { sql } from "drizzle-orm";

// ── Payroll Enums ───────────────────────────────────────────────────
export const crewRoleEnum = pgEnum("crew_role", [
  "crane_operator", "brokk_operator", "rigger", "ground_lead", "ground_support",
]);

export const employeeStatusEnum = pgEnum("employee_status", [
  "active", "vacation", "review", "conditional", "terminated",
]);

export const payrollDepositStatusEnum = pgEnum("payroll_deposit_status", [
  "pending", "deposited", "failed",
]);

export const taxDepositTypeEnum = pgEnum("tax_deposit_type", [
  "federal_income", "ri_state_income", "fica_employee", "fica_employer",
  "futa", "ri_suta", "ri_tdi", "workers_comp",
]);

export const taxDepositStatusEnum = pgEnum("tax_deposit_status", [
  "accrued", "deposited", "filed",
]);

export const reviewOutcomeEnum = pgEnum("review_outcome", [
  "pass", "conditional", "fail",
]);

// ── Employees (Day N Pay Structure) ─────────────────────────────────
export const employees = pgTable("employees", {
  id:                  uuid("id").primaryKey().defaultRandom(),
  userId:              uuid("user_id").notNull().references(() => users.id),
  crewRole:            crewRoleEnum("crew_role").notNull(),
  hireDate:            date("hire_date").notNull(),
  // ── Day N Sequence ──────────────────────────────────────────────────
  sequenceStartDay:    integer("sequence_start_day").notNull().default(1),  // Day 1 for Year 1, Day 352 for Year 2, etc.
  currentYear:         integer("current_year").notNull().default(1),
  signingBonusCents:   integer("signing_bonus_cents").notNull().default(501900),  // $5,019
  signingBonusPaidAt:  timestamp("signing_bonus_paid_at"),
  // ── Status ──────────────────────────────────────────────────────────
  status:              employeeStatusEnum("status").notNull().default("active"),
  // ── WIP (Work Immersion Program) ────────────────────────────────────
  wipEligible:         boolean("wip_eligible").notNull().default(false),
  wipHoursUsed:        integer("wip_hours_used").notNull().default(0),
  wipMaxHours:         integer("wip_max_hours").notNull().default(400),
  // ── Review Gate ─────────────────────────────────────────────────────
  lastReviewDate:      date("last_review_date"),
  lastReviewScore:     integer("last_review_score"),         // 0–100
  lastReviewOutcome:   reviewOutcomeEnum("last_review_outcome"),
  lastReviewNotes:     text("last_review_notes"),
  nextReviewDate:      date("next_review_date"),
  // ── Meta ────────────────────────────────────────────────────────────
  emergencyContact:    text("emergency_contact"),
  bankRoutingNumber:   text("bank_routing_number"),          // encrypted at rest in production
  bankAccountNumber:   text("bank_account_number"),          // encrypted at rest in production
  w4FilingStatus:      text("w4_filing_status").default("single"),
  w4Allowances:        integer("w4_allowances").notNull().default(0),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
  updatedAt:           timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  userIdx: uniqueIndex("employees_user_idx").on(t.userId),
  statusIdx: index("employees_status_idx").on(t.status),
}));

// ── Payroll Entries (one per employee per day) ──────────────────────
export const payrollEntries = pgTable("payroll_entries", {
  id:                  uuid("id").primaryKey().defaultRandom(),
  employeeId:          uuid("employee_id").notNull().references(() => employees.id),
  sequenceDay:         integer("sequence_day").notNull(),     // Day N in the sequence
  payDate:             date("pay_date").notNull(),
  // ── Amounts (all in cents) ──────────────────────────────────────────
  grossCents:          integer("gross_cents").notNull(),
  federalTaxCents:     integer("federal_tax_cents").notNull().default(0),
  riStateTaxCents:     integer("ri_state_tax_cents").notNull().default(0),
  socialSecurityCents: integer("social_security_cents").notNull().default(0),
  medicareCents:       integer("medicare_cents").notNull().default(0),
  riTdiCents:          integer("ri_tdi_cents").notNull().default(0),
  netCents:            integer("net_cents").notNull(),        // Target: sequenceDay * 100
  // ── Employer costs (cents) ──────────────────────────────────────────
  employerSsCents:     integer("employer_ss_cents").notNull().default(0),
  employerMedicareCents: integer("employer_medicare_cents").notNull().default(0),
  employerFutaCents:   integer("employer_futa_cents").notNull().default(0),
  employerSutaCents:   integer("employer_suta_cents").notNull().default(0),
  employerWcCents:     integer("employer_wc_cents").notNull().default(0),
  totalEmployerCostCents: integer("total_employer_cost_cents").notNull(),
  // ── Flags ───────────────────────────────────────────────────────────
  isSigningBonus:      boolean("is_signing_bonus").notNull().default(false),
  isMinWageAdjusted:   boolean("is_min_wage_adjusted").notNull().default(false),
  hoursWorked:         decimal("hours_worked", { precision: 5, scale: 2 }),
  projectId:           uuid("project_id").references(() => projects.id),
  // ── Deposit tracking ────────────────────────────────────────────────
  depositStatus:       payrollDepositStatusEnum("deposit_status").notNull().default("pending"),
  depositedAt:         timestamp("deposited_at"),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  employeeIdx:    index("payroll_entries_employee_idx").on(t.employeeId),
  payDateIdx:     index("payroll_entries_pay_date_idx").on(t.payDate),
  employeeDateIdx: uniqueIndex("payroll_entries_employee_date_idx").on(t.employeeId, t.payDate),
}));

// ── Tax Deposits (weekly/monthly remittances) ───────────────────────
export const taxDeposits = pgTable("tax_deposits", {
  id:               uuid("id").primaryKey().defaultRandom(),
  periodStart:      date("period_start").notNull(),
  periodEnd:        date("period_end").notNull(),
  depositType:      taxDepositTypeEnum("deposit_type").notNull(),
  amountCents:      integer("amount_cents").notNull(),
  status:           taxDepositStatusEnum("status").notNull().default("accrued"),
  depositedAt:      timestamp("deposited_at"),
  filingReference:  text("filing_reference"),
  notes:            text("notes"),
  createdAt:        timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  periodIdx: index("tax_deposits_period_idx").on(t.periodStart, t.periodEnd),
  typeIdx:   index("tax_deposits_type_idx").on(t.depositType),
}));

// ── Annual Reviews ──────────────────────────────────────────────────
export const annualReviews = pgTable("annual_reviews", {
  id:               uuid("id").primaryKey().defaultRandom(),
  employeeId:       uuid("employee_id").notNull().references(() => employees.id),
  reviewYear:       integer("review_year").notNull(),
  // ── Scores (each 0-100, weighted) ──────────────────────────────────
  safetyScore:      integer("safety_score").notNull(),        // 30% weight
  skillScore:       integer("skill_score").notNull(),         // 25% weight
  the45Score:       integer("the_45_score").notNull(),        // 25% weight
  reliabilityScore: integer("reliability_score").notNull(),   // 20% weight
  compositeScore:   integer("composite_score").notNull(),     // weighted total
  // ── Outcome ─────────────────────────────────────────────────────────
  outcome:          reviewOutcomeEnum("outcome").notNull(),
  notes:            text("notes"),
  conductedBy:      uuid("conducted_by").notNull().references(() => users.id),
  conductedAt:      timestamp("conducted_at").notNull(),
  // ── Sequence decision ───────────────────────────────────────────────
  sequenceContinues:  boolean("sequence_continues").notNull(),
  nextSequenceDay:    integer("next_sequence_day"),           // 352 after Year 1, 703 after Year 2, etc.
  createdAt:          timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  employeeYearIdx: uniqueIndex("annual_reviews_employee_year_idx").on(t.employeeId, t.reviewYear),
}));

// ── Payroll Relations ───────────────────────────────────────────────
export const employeesRelations = relations(employees, ({ one, many }) => ({
  user:           one(users, { fields: [employees.userId], references: [users.id] }),
  payrollEntries: many(payrollEntries),
  reviews:        many(annualReviews),
}));

export const payrollEntriesRelations = relations(payrollEntries, ({ one }) => ({
  employee: one(employees, { fields: [payrollEntries.employeeId], references: [employees.id] }),
  project:  one(projects, { fields: [payrollEntries.projectId], references: [projects.id] }),
}));

export const annualReviewsRelations = relations(annualReviews, ({ one }) => ({
  employee:    one(employees, { fields: [annualReviews.employeeId], references: [employees.id] }),
  conductedBy: one(users, { fields: [annualReviews.conductedBy], references: [users.id] }),
}));

// ── Data API ─────────────────────────────────────────────────────────
export const apiTierEnum = pgEnum("api_tier", [
  "free", "starter", "pro", "enterprise",
]);

export const apiKeys = pgTable("api_keys", {
  id:           uuid("id").primaryKey().defaultRandom(),
  userId:       uuid("user_id").notNull().references(() => users.id),
  keyPrefix:    text("key_prefix").notNull(),           // "ds_live_abc" — first 12 chars for display
  keyHash:      text("key_hash").notNull().unique(),    // SHA-256 of full key
  tier:         apiTierEnum("tier").notNull().default("free"),
  label:        text("label"),                          // user-assigned name
  requestCount: integer("request_count").notNull().default(0), // lifetime counter
  lastUsedAt:   timestamp("last_used_at"),
  revokedAt:    timestamp("revoked_at"),                // null = active
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  keyHashIdx: uniqueIndex("api_keys_key_hash_idx").on(t.keyHash),
  userIdx:    index("api_keys_user_idx").on(t.userId),
}));

export const apiRequestLog = pgTable("api_request_log", {
  id:             uuid("id").primaryKey().defaultRandom(),
  apiKeyId:       uuid("api_key_id").notNull().references(() => apiKeys.id),
  endpoint:       text("endpoint").notNull(),
  statusCode:     integer("status_code").notNull(),
  responseTimeMs: integer("response_time_ms"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  apiKeyIdx:    index("api_request_log_key_idx").on(t.apiKeyId),
  createdAtIdx: index("api_request_log_created_at_idx").on(t.createdAt),
}));

export const apiWebhooks = pgTable("api_webhooks", {
  id:              uuid("id").primaryKey().defaultRandom(),
  apiKeyId:        uuid("api_key_id").notNull().references(() => apiKeys.id),
  url:             text("url").notNull(),
  events:          text("events").array().notNull().default([]),
  secret:          text("secret").notNull(),
  active:          boolean("active").notNull().default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  failureCount:    integer("failure_count").notNull().default(0),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  apiKeyIdx: index("api_webhooks_key_idx").on(t.apiKeyId),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  user:     one(users, { fields: [apiKeys.userId], references: [users.id] }),
  requests: many(apiRequestLog),
  webhooks: many(apiWebhooks),
}));

export const apiRequestLogRelations = relations(apiRequestLog, ({ one }) => ({
  apiKey: one(apiKeys, { fields: [apiRequestLog.apiKeyId], references: [apiKeys.id] }),
}));

export const apiWebhooksRelations = relations(apiWebhooks, ({ one }) => ({
  apiKey: one(apiKeys, { fields: [apiWebhooks.apiKeyId], references: [apiKeys.id] }),
}));

// ── CDA (Creative Design Agent) — Verification Trust Chain ──────────────

export const reviewLayerEnum = pgEnum("review_layer", [
  "architect", "engineer", "fa", "ml_systems",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending", "verified", "flagged", "annotated",
]);

// ── CDA Sessions (one per CDA conversation) ─────────────────────────────
export const cdaSessions = pgTable("cda_sessions", {
  id:           uuid("id").primaryKey().defaultRandom(),
  userId:       uuid("user_id").notNull().references(() => users.id),
  projectId:    uuid("project_id").references(() => projects.id),
  topic:        text("topic"),                                    // user's opening question/dream
  inputTokens:  integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  costMillicents: integer("cost_millicents").notNull().default(0),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  userIdx:    index("cda_sessions_user_idx").on(t.userId),
  projectIdx: index("cda_sessions_project_idx").on(t.projectId),
}));

// ── CDA Outputs (each AI response that can be verified) ──────────────────
export const cdaOutputs = pgTable("cda_outputs", {
  id:              uuid("id").primaryKey().defaultRandom(),
  sessionId:       uuid("session_id").notNull().references(() => cdaSessions.id),
  title:           text("title").notNull(),                        // e.g. "30' Open Span Living Room"
  content:         text("content").notNull(),                      // full AI response markdown
  category:        text("category"),                               // structural, envelope, foundation, etc.
  // ── Per-layer verification status (denormalized for fast reads) ─────
  architectStatus: verificationStatusEnum("architect_status").notNull().default("pending"),
  engineerStatus:  verificationStatusEnum("engineer_status").notNull().default("pending"),
  faStatus:        verificationStatusEnum("fa_status").notNull().default("pending"),
  mlSystemsStatus: verificationStatusEnum("ml_systems_status").notNull().default("pending"),
  fullyVerified:   text("fully_verified").notNull().default("false"), // "true" when all 4 human layers done
  createdAt:       timestamp("created_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  sessionIdx:      index("cda_outputs_session_idx").on(t.sessionId),
  fullyVerifiedIdx: index("cda_outputs_verified_idx").on(t.fullyVerified),
}));

// ── Reviewers (licensed professionals registered for verification) ───────
export const reviewers = pgTable("reviewers", {
  id:            uuid("id").primaryKey().defaultRandom(),
  userId:        uuid("user_id").notNull().references(() => users.id),
  layer:         reviewLayerEnum("layer").notNull(),
  licenseNumber: text("license_number"),                           // RA/PE license
  licenseState:  text("license_state"),                            // e.g. "RI"
  firmName:      text("firm_name"),
  specialty:     text("specialty"),                                 // e.g. "Structural Steel", "Historic Preservation"
  totalReviews:  integer("total_reviews").notNull().default(0),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  userLayerIdx: uniqueIndex("reviewers_user_layer_idx").on(t.userId, t.layer),
}));

// ── Verifications (each review action on an output) ──────────────────────
export const verifications = pgTable("verifications", {
  id:              uuid("id").primaryKey().defaultRandom(),
  outputId:        uuid("output_id").notNull().references(() => cdaOutputs.id),
  reviewerId:      uuid("reviewer_id").notNull().references(() => reviewers.id),
  layer:           reviewLayerEnum("layer").notNull(),
  status:          verificationStatusEnum("status").notNull(),
  annotations:     text("annotations"),
  structuralNotes: text("structural_notes"),
  costImpact:      text("cost_impact"),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  outputIdx:   index("verifications_output_idx").on(t.outputId),
  reviewerIdx: index("verifications_reviewer_idx").on(t.reviewerId),
}));

// ── CDA Relations ────────────────────────────────────────────────────────
export const cdaSessionsRelations = relations(cdaSessions, ({ one, many }) => ({
  user:    one(users, { fields: [cdaSessions.userId], references: [users.id] }),
  project: one(projects, { fields: [cdaSessions.projectId], references: [projects.id] }),
  outputs: many(cdaOutputs),
}));

export const cdaOutputsRelations = relations(cdaOutputs, ({ one, many }) => ({
  session:       one(cdaSessions, { fields: [cdaOutputs.sessionId], references: [cdaSessions.id] }),
  verifications: many(verifications),
}));

export const reviewersRelations = relations(reviewers, ({ one, many }) => ({
  user:          one(users, { fields: [reviewers.userId], references: [users.id] }),
  verifications: many(verifications),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  output:   one(cdaOutputs, { fields: [verifications.outputId], references: [cdaOutputs.id] }),
  reviewer: one(reviewers, { fields: [verifications.reviewerId], references: [reviewers.id] }),
}));

// ── Transparency Trust Protocol (TTP) ─────────────────────────────────

export const ttChangeReasonEnum = pgEnum("tt_change_reason", [
  "recalculation", "tier_upgrade", "material_contributed", "cycle_completed",
  "review_passed", "data_contributed", "manual_adjustment", "account_aged",
]);

export const ttScores = pgTable("tt_scores", {
  id:              uuid("id").primaryKey().defaultRandom(),
  userId:          uuid("user_id").notNull().references(() => users.id),
  apiKeyId:        uuid("api_key_id").references(() => apiKeys.id),
  // ── Computed score & band ──
  score:           integer("score").notNull(),
  band:            text("band").notNull(),                              // access band key
  // ── Factor breakdown (stored for audit) ──
  factorTier:      integer("factor_tier").notNull().default(0),
  factorIdentity:  integer("factor_identity").notNull().default(0),
  factorMaterials: integer("factor_materials").notNull().default(0),
  factorCycles:    integer("factor_cycles").notNull().default(0),
  factorReviews:   integer("factor_reviews").notNull().default(0),
  factorAge:       integer("factor_age").notNull().default(0),
  factorData:      integer("factor_data").notNull().default(0),
  isRegulator:     boolean("is_regulator").notNull().default(false),
  // ── Cache control ──
  calculatedAt:    timestamp("calculated_at").notNull().defaultNow(),
  expiresAt:       timestamp("expires_at").notNull(),
  version:         text("version").notNull().default("1.0.0"),
}, (t) => ({
  userIdx:      index("tt_scores_user_idx").on(t.userId),
  apiKeyIdx:    index("tt_scores_api_key_idx").on(t.apiKeyId),
  userKeyUniq:  uniqueIndex("tt_scores_user_key_uniq").on(t.userId, t.apiKeyId),
}));

export const ttScoreHistory = pgTable("tt_score_history", {
  id:            uuid("id").primaryKey().defaultRandom(),
  ttScoreId:     uuid("tt_score_id").notNull().references(() => ttScores.id),
  userId:        uuid("user_id").notNull().references(() => users.id),
  previousScore: integer("previous_score"),
  newScore:      integer("new_score").notNull(),
  previousBand:  text("previous_band"),
  newBand:       text("new_band").notNull(),
  changeReason:  ttChangeReasonEnum("change_reason").notNull(),
  factorSnapshot: jsonb("factor_snapshot").notNull(),                    // full factor breakdown at time of change
  createdAt:     timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  userIdx:      index("tt_history_user_idx").on(t.userId),
  createdAtIdx: index("tt_history_created_at_idx").on(t.createdAt),
}));

// ── TTP Relations ──
export const ttScoresRelations = relations(ttScores, ({ one, many }) => ({
  user:    one(users, { fields: [ttScores.userId], references: [users.id] }),
  apiKey:  one(apiKeys, { fields: [ttScores.apiKeyId], references: [apiKeys.id] }),
  history: many(ttScoreHistory),
}));

export const ttScoreHistoryRelations = relations(ttScoreHistory, ({ one }) => ({
  ttScore: one(ttScores, { fields: [ttScoreHistory.ttScoreId], references: [ttScores.id] }),
  user:    one(users, { fields: [ttScoreHistory.userId], references: [users.id] }),
}));

// ══════════════════════════════════════════════════════════════════════
// ██ STANDALONE APP TABLES (Phase 0 consolidation)
// ══════════════════════════════════════════════════════════════════════

// ── Partner Lenders (Loan Pit) ──────────────────────────────────────
export const partnerLenders = pgTable("partner_lenders", {
  id:                   uuid("id").primaryKey().defaultRandom(),
  name:                 text("name").notNull(),
  slug:                 text("slug").notNull().unique(),
  type:                 text("type").notNull(),                       // credit_union | bank | cdfi | etc.
  integrationMode:      text("integration_mode").notNull().default("manual"), // manual | api | white_label
  fhlbbMember:          boolean("fhlbb_member").notNull().default(false),
  pciVerified:          boolean("pci_verified").notNull().default(false),
  rihousingParticipant: boolean("rihousing_participant").notNull().default(false),
  apiWebhookUrl:        text("api_webhook_url"),
  webhookSecret:        text("webhook_secret"),
  contactEmail:         text("contact_email"),
  contactName:          text("contact_name"),
  userId:               uuid("user_id").references(() => users.id),   // linked user account (nullable)
  status:               text("status").notNull().default("invited"),   // invited | onboarded | suspended
  onboardedAt:          timestamp("onboarded_at"),
  metadata:             jsonb("metadata").default({}),
  createdAt:            timestamp("created_at").notNull().defaultNow(),
  updatedAt:            timestamp("updated_at").notNull().defaultNow(),
});

// ── Pit Subsidies (Loan Pit) ────────────────────────────────────────
export const pitSubsidies = pgTable("pit_subsidies", {
  id:              uuid("id").primaryKey().defaultRandom(),
  pitId:           uuid("pit_id").notNull().references(() => loanPits.id),
  program:         text("program").notNull(),                          // FHLBB AHP, RIHousing DPA, LISC Bridge, etc.
  amountCents:     integer("amount_cents").notNull(),
  appliedToBidId:  uuid("applied_to_bid_id").references(() => loanBids.id),
  status:          text("status").notNull().default("eligible"),       // eligible | applied | disbursed | expired
  notes:           text("notes"),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
});

// ── Pit Integrations (Loan Pit) ─────────────────────────────────────
export const pitIntegrations = pgTable("pit_integrations", {
  id:            uuid("id").primaryKey().defaultRandom(),
  lenderId:      uuid("lender_id").notNull().references(() => partnerLenders.id),
  provider:      text("provider").notNull(),
  credentials:   jsonb("credentials").default({}),
  capabilities:  jsonb("capabilities").default([]),
  webhookSecret: text("webhook_secret"),
  active:        boolean("active").notNull().default(true),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
});

// ── Loan Pit Relations ──────────────────────────────────────────────
export const partnerLendersRelations = relations(partnerLenders, ({ one, many }) => ({
  user:         one(users, { fields: [partnerLenders.userId], references: [users.id] }),
  integrations: many(pitIntegrations),
}));

export const pitSubsidiesRelations = relations(pitSubsidies, ({ one }) => ({
  pit: one(loanPits, { fields: [pitSubsidies.pitId], references: [loanPits.id] }),
  bid: one(loanBids, { fields: [pitSubsidies.appliedToBidId], references: [loanBids.id] }),
}));

export const pitIntegrationsRelations = relations(pitIntegrations, ({ one }) => ({
  lender: one(partnerLenders, { fields: [pitIntegrations.lenderId], references: [partnerLenders.id] }),
}));

// ── Seller Profiles (Builder's Open House) ──────────────────────────
export const sellerProfiles = pgTable("seller_profiles", {
  id:                uuid("id").primaryKey().defaultRandom(),
  userId:            uuid("user_id").notNull().references(() => users.id).unique(),
  onboardingPhase:   integer("onboarding_phase").notNull().default(1), // 1=probation, 2=verified, 3=trusted, 4=logistics_partner
  txFeeRate:         integer("tx_fee_rate_bps").notNull().default(1000), // basis points: 1000 = 10%
  the27Member:       boolean("the_27_member").notNull().default(false),
  totalSalesCents:   integer("total_sales_cents").notNull().default(0),
  totalFeesCents:    integer("total_fees_cents").notNull().default(0),
  salesCount:        integer("sales_count").notNull().default(0),
  monthlyFeeCents:   integer("monthly_fee_cents").notNull().default(0), // $0 for phases 1-3, $10K for phase 4
  businessName:      text("business_name"),
  gcRegistration:    text("gc_registration"),                           // RI GC registration number
  insuranceVerified: boolean("insurance_verified").notNull().default(false),
  joinedAt:          timestamp("joined_at").notNull().defaultNow(),
  phaseUpdatedAt:    timestamp("phase_updated_at").notNull().defaultNow(),
}, (t) => ({
  userIdx: uniqueIndex("seller_profiles_user_idx").on(t.userId),
}));

// ── Store Listings (Builder's Open House) ───────────────────────────
export const storeListings = pgTable("store_listings", {
  id:               uuid("id").primaryKey().defaultRandom(),
  title:            text("title").notNull(),
  slug:             text("slug").notNull().unique(),
  description:      text("description").notNull().default(""),
  category:         text("category").notNull(),                        // zone-based category key
  condition:        text("condition").notNull().default("good"),       // excellent | good | fair | salvage
  priceCents:       integer("price_cents").notNull(),
  compareAtCents:   integer("compare_at_cents"),                       // new retail price for savings display
  quantity:         integer("quantity").notNull().default(1),
  unit:             text("unit").notNull().default("each"),            // each | bundle | lot | LF | SF
  images:           jsonb("images").notNull().default([]),              // string[] of R2 URLs
  sourceMaterialId: text("source_material_id"),                        // FK → materials.ml_material_id (provenance)
  sourceProjectId:  text("source_project_id"),
  mlMaterialId:     text("ml_material_id"),                            // ML-2026-001-W001 format
  dimensions:       text("dimensions"),
  weightLbs:        integer("weight_lbs"),
  specs:            jsonb("specs").default({}),                        // flexible JSONB for material-specific data
  fulfillment:      text("fulfillment").notNull().default("pickup"),   // pickup | delivery | shipping
  pickupLocation:   text("pickup_location"),
  sellerId:         uuid("seller_id").references(() => users.id),      // null = admin-created
  status:           text("status").notNull().default("active"),        // active | pending | sold | draft | reserved | rejected
  featured:         boolean("featured").notNull().default(false),
  createdAt:        timestamp("created_at").notNull().defaultNow(),
  updatedAt:        timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  slugIdx:     uniqueIndex("store_listings_slug_idx").on(t.slug),
  categoryIdx: index("store_listings_category_idx").on(t.category),
  statusIdx:   index("store_listings_status_idx").on(t.status),
  sellerIdx:   index("store_listings_seller_idx").on(t.sellerId),
}));

// ── Store Orders (Builder's Open House) ─────────────────────────────
export const storeOrders = pgTable("store_orders", {
  id:                    uuid("id").primaryKey().defaultRandom(),
  orderNumber:           text("order_number").notNull().unique(),       // BOH-0001
  buyerId:               uuid("buyer_id").notNull().references(() => users.id),
  status:                text("status").notNull().default("pending"),   // pending | paid | fulfilled | cancelled
  subtotalCents:         integer("subtotal_cents").notNull(),
  taxCents:              integer("tax_cents").notNull().default(0),
  shippingCents:         integer("shipping_cents").notNull().default(0),
  totalCents:            integer("total_cents").notNull(),
  fulfillmentMethod:     text("fulfillment_method").notNull().default("pickup"),
  shippingAddress:       jsonb("shipping_address"),
  platformFeeCents:      integer("platform_fee_cents").notNull().default(0),
  sellerPayoutCents:     integer("seller_payout_cents").notNull().default(0),
  sellerFeeRateBps:      integer("seller_fee_rate_bps"),               // snapshot at time of sale
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAt:                timestamp("paid_at"),
  createdAt:             timestamp("created_at").notNull().defaultNow(),
  updatedAt:             timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  buyerIdx:    index("store_orders_buyer_idx").on(t.buyerId),
  orderNumIdx: uniqueIndex("store_orders_number_idx").on(t.orderNumber),
}));

// ── Store Order Items (Builder's Open House) ────────────────────────
export const storeOrderItems = pgTable("store_order_items", {
  id:          uuid("id").primaryKey().defaultRandom(),
  orderId:     uuid("order_id").notNull().references(() => storeOrders.id),
  listingId:   uuid("listing_id").references(() => storeListings.id),
  sellerId:    uuid("seller_id").references(() => users.id),           // seller at time of sale
  title:       text("title").notNull(),                                 // snapshot at purchase time
  priceCents:  integer("price_cents").notNull(),                        // snapshot at purchase time
  quantity:    integer("quantity").notNull().default(1),
  feeCents:    integer("fee_cents").notNull().default(0),               // platform fee for this line item
  feeRateBps:  integer("fee_rate_bps"),                                 // seller's fee rate snapshot
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  orderIdx: index("store_order_items_order_idx").on(t.orderId),
}));

// ── BOH Relations ───────────────────────────────────────────────────
export const sellerProfilesRelations = relations(sellerProfiles, ({ one }) => ({
  user: one(users, { fields: [sellerProfiles.userId], references: [users.id] }),
}));

export const storeListingsRelations = relations(storeListings, ({ one, many }) => ({
  seller: one(users, { fields: [storeListings.sellerId], references: [users.id] }),
  orderItems: many(storeOrderItems),
}));

export const storeOrdersRelations = relations(storeOrders, ({ one, many }) => ({
  buyer: one(users, { fields: [storeOrders.buyerId], references: [users.id] }),
  items: many(storeOrderItems),
}));

export const storeOrderItemsRelations = relations(storeOrderItems, ({ one }) => ({
  order:   one(storeOrders, { fields: [storeOrderItems.orderId], references: [storeOrders.id] }),
  listing: one(storeListings, { fields: [storeOrderItems.listingId], references: [storeListings.id] }),
  seller:  one(users, { fields: [storeOrderItems.sellerId], references: [users.id] }),
}));

// ── BC Members (Builders Collective) ────────────────────────────────
export const bcMembers = pgTable("bc_members", {
  id:                uuid("id").primaryKey().defaultRandom(),
  userId:            uuid("user_id").notNull().references(() => users.id).unique(),
  firm:              text("firm").notNull().default("Independent"),
  location:          text("location").notNull(),
  rank:              text("rank").notNull().default("apprentice"),      // apprentice | journeyman | master
  specialties:       jsonb("specialties").notNull().default([]),        // string[]
  reviewsCompleted:  integer("reviews_completed").notNull().default(0),
  avgScore:          integer("avg_score").notNull().default(0),         // 0-100
  totalPayoutCents:  integer("total_payout_cents").notNull().default(0),
  activeReview:      boolean("active_review").notNull().default(false),
  stripeAccountId:   text("stripe_account_id"),                        // Stripe Connect (future)
  joinedAt:          timestamp("joined_at").notNull().defaultNow(),
}, (t) => ({
  userIdx: uniqueIndex("bc_members_user_idx").on(t.userId),
  rankIdx: index("bc_members_rank_idx").on(t.rank),
}));

// ── Verification Plans (Builders Collective) ────────────────────────
export const verificationPlans = pgTable("verification_plans", {
  id:                    uuid("id").primaryKey().defaultRandom(),
  submittedBy:           uuid("submitted_by").notNull().references(() => users.id),
  projectCity:           text("project_city").notNull(),
  projectState:          text("project_state").notNull().default("RI"),
  planPages:             integer("plan_pages").notNull(),
  planFileUrl:           text("plan_file_url"),                         // R2/S3 URL for plan stack PDF
  fingerprint:           text("plan_fingerprint"),                      // SHA-256 — links to planFingerprints
  redundancyStatus:      text("redundancy_status").notNull().default("clean"), // clean | flagged | cleared | reonboarded
  tier:                  text("tier").notNull().default("standard"),    // standard | enhanced | custodian
  feeCents:              integer("fee_cents").notNull().default(500000),          // $5,000
  architectShareCents:   integer("architect_share_cents").notNull().default(300000), // $3,000
  platformShareCents:    integer("platform_share_cents").notNull().default(200000), // $2,000
  reviewsCompleted:      integer("reviews_completed").notNull().default(0),
  reviewsRequired:       integer("reviews_required").notNull().default(10),
  reviewsToday:          integer("reviews_today").notNull().default(0),
  maxPerDay:             integer("max_per_day").notNull().default(0),   // 0 = unlimited
  planCompletion:        integer("plan_completion").notNull().default(0), // 0-100
  designScore:           integer("design_score"),
  status:                text("status").notNull().default("queue"),     // queue | in_review | verified | rejected | redundancy_hold
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAt:                timestamp("paid_at"),
  verifiedAt:            timestamp("verified_at"),
  submittedAt:           timestamp("submitted_at").notNull().defaultNow(),
  updatedAt:             timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  submitterIdx:   index("verification_plans_submitter_idx").on(t.submittedBy),
  statusIdx:      index("verification_plans_status_idx").on(t.status),
  fingerprintIdx: index("verification_plans_fingerprint_idx").on(t.fingerprint),
}));

// ── Plan Fingerprints (Builders Collective — cross-app redundancy) ──
export const planFingerprints = pgTable("plan_fingerprints", {
  id:              uuid("id").primaryKey().defaultRandom(),
  fingerprint:     text("fingerprint").notNull(),                      // SHA-256 of normalized plan signature
  signatureData:   jsonb("signature_data").notNull(),                  // raw inputs used to compute fingerprint
  sourceApp:       text("source_app").notNull(),                       // decon_lab | design_studio | builders_collective
  sourceTier:      text("source_tier").notNull(),                      // scout | analysis | standard | enhanced | custodian
  sourceSessionId: text("source_session_id"),
  userId:          text("user_id"),                                     // who generated it (null = anonymous free tier)
  planId:          uuid("plan_id").references(() => verificationPlans.id),
  hitCount:        integer("hit_count").notNull().default(1),
  firstSeenAt:     timestamp("first_seen_at").notNull().defaultNow(),
  lastSeenAt:      timestamp("last_seen_at").notNull().defaultNow(),
}, (t) => ({
  fingerprintIdx: index("plan_fingerprints_hash_idx").on(t.fingerprint),
  sourceIdx:      index("plan_fingerprints_source_idx").on(t.sourceApp),
}));

// ── Redundancy Events (Builders Collective — audit trail) ───────────
export const redundancyEvents = pgTable("redundancy_events", {
  id:                uuid("id").primaryKey().defaultRandom(),
  planId:            uuid("plan_id").notNull().references(() => verificationPlans.id),
  fingerprintId:     uuid("fingerprint_id").notNull().references(() => planFingerprints.id),
  matchType:         text("match_type").notNull(),                     // exact | near | structural
  matchConfidence:   integer("match_confidence").notNull(),            // 0-100
  originalSourceApp: text("original_source_app").notNull(),
  originalTier:      text("original_tier").notNull(),
  reonboardFeeCents: integer("reonboard_fee_cents").notNull(),
  reonboardStatus:   text("reonboard_status").notNull().default("pending"), // pending | paid | waived | escalated
  resolvedBy:        uuid("resolved_by").references(() => users.id),
  resolution:        text("resolution"),                                // approved | rejected | waived
  resolutionNotes:   text("resolution_notes"),
  flaggedAt:         timestamp("flagged_at").notNull().defaultNow(),
  resolvedAt:        timestamp("resolved_at"),
}, (t) => ({
  planIdx:   index("redundancy_events_plan_idx").on(t.planId),
  statusIdx: index("redundancy_events_status_idx").on(t.reonboardStatus),
}));

// ── Peer Reviews (Builders Collective) ──────────────────────────────
export const peerReviews = pgTable("peer_reviews", {
  id:          uuid("id").primaryKey().defaultRandom(),
  planId:      uuid("plan_id").notNull().references(() => verificationPlans.id),
  architectId: uuid("architect_id").notNull().references(() => bcMembers.id),
  userId:      uuid("user_id").notNull().references(() => users.id),   // denormalized for quick lookup
  score:       integer("score").notNull(),                              // 0-100
  focus:       text("focus").notNull(),
  notes:       text("notes"),
  payoutCents: integer("payout_cents").notNull(),                      // $300 or $350 (master)
  payoutStatus: text("payout_status").notNull().default("pending"),    // pending | paid | failed
  completedAt: timestamp("completed_at").notNull().defaultNow(),
}, (t) => ({
  planIdx:      index("peer_reviews_plan_idx").on(t.planId),
  architectIdx: index("peer_reviews_architect_idx").on(t.architectId),
}));

// ── Payouts (Builders Collective) ───────────────────────────────────
export const payouts = pgTable("payouts", {
  id:               uuid("id").primaryKey().defaultRandom(),
  memberId:         uuid("member_id").notNull().references(() => bcMembers.id),
  userId:           uuid("user_id").notNull().references(() => users.id),
  amountCents:      integer("amount_cents").notNull(),
  reviewIds:        jsonb("review_ids").notNull().default([]),          // uuid[] of peer_reviews included
  stripeTransferId: text("stripe_transfer_id"),
  status:           text("status").notNull().default("pending"),       // pending | processing | completed | failed
  createdAt:        timestamp("created_at").notNull().defaultNow(),
  completedAt:      timestamp("completed_at"),
}, (t) => ({
  memberIdx: index("payouts_member_idx").on(t.memberId),
  statusIdx: index("payouts_status_idx").on(t.status),
}));

// ── BC Relations ────────────────────────────────────────────────────
export const bcMembersRelations = relations(bcMembers, ({ one, many }) => ({
  user:    one(users, { fields: [bcMembers.userId], references: [users.id] }),
  reviews: many(peerReviews),
  payouts: many(payouts),
}));

export const verificationPlansRelations = relations(verificationPlans, ({ one, many }) => ({
  submitter:        one(users, { fields: [verificationPlans.submittedBy], references: [users.id] }),
  reviews:          many(peerReviews),
  fingerprints:     many(planFingerprints),
  redundancyEvents: many(redundancyEvents),
}));

export const planFingerprintsRelations = relations(planFingerprints, ({ one }) => ({
  plan: one(verificationPlans, { fields: [planFingerprints.planId], references: [verificationPlans.id] }),
}));

export const redundancyEventsRelations = relations(redundancyEvents, ({ one }) => ({
  plan:        one(verificationPlans, { fields: [redundancyEvents.planId], references: [verificationPlans.id] }),
  fingerprint: one(planFingerprints, { fields: [redundancyEvents.fingerprintId], references: [planFingerprints.id] }),
  resolver:    one(users, { fields: [redundancyEvents.resolvedBy], references: [users.id] }),
}));

export const peerReviewsRelations = relations(peerReviews, ({ one }) => ({
  plan:      one(verificationPlans, { fields: [peerReviews.planId], references: [verificationPlans.id] }),
  architect: one(bcMembers, { fields: [peerReviews.architectId], references: [bcMembers.id] }),
  user:      one(users, { fields: [peerReviews.userId], references: [users.id] }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  member: one(bcMembers, { fields: [payouts.memberId], references: [bcMembers.id] }),
  user:   one(users, { fields: [payouts.userId], references: [users.id] }),
}));

// ── PI Observations (Design Studio — Project Intelligence) ──────────
export const piObservationTypeEnum = pgEnum("pi_observation_type", [
  // Tier 1 — Homeowner Value
  "curriculum_turn", "brief_generated", "render_generated",
  "field_verified", "sheet_readiness_changed",
  // Tier 2 — Collective Value
  "bc_correction", "pe_review_completed", "cda_training_emit", "agency_export_ready",
  // Tier 3 — Engine Value
  "token_spent", "session_depth", "conversion_signal", "cross_app_signal",
]);

export const piObservations = pgTable("pi_observations", {
  id:          uuid("id").primaryKey().defaultRandom(),
  sessionId:   text("session_id").notNull(),
  type:        piObservationTypeEnum("type").notNull(),
  data:        jsonb("data").notNull().default({}),
  lucentScore: integer("lucent_score"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  sessionIdx: index("pi_obs_session_idx").on(t.sessionId),
  typeIdx:    index("pi_obs_type_idx").on(t.type),
  createdIdx: index("pi_obs_created_at_idx").on(t.createdAt),
}));

