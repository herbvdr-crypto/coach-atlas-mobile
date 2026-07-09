// ============================================================
// COACH ATLAS --- TYPE DEFINITIONS
// These mirror the database schema. All snake_case DB columns
// are camelCased here; the DB layer handles the conversion.
// ============================================================
// ── Enums & Literals ─────────────────────────────────────────
export type ExperienceLevel = 'beginner' | 'intermediate' |
'advanced' | 'competitive'
export type Discipline = 'swim' | 'bike' | 'run' | 'brick' |
'strength' | 'rest' | 'other'
export type RacePriority = 'A' | 'B' | 'C'
export type RaceStatus = 'planned' | 'completed' | 'dns' |
'dnf'
export type KPISource = 'athlete_stated' | 'device_sync' |
'coach_estimated'
export type ConcernLevel = 'info' | 'warning' | 'critical'
export type PersonaId = 'rex' | 'sophia' | 'marcus' | 'kai'
export type SessionSource = 'manual' | 'fit_upload' |
'garmin_sync' | 'agent_logged' | 'agent_planned' |
'plan_template' | 'plan_upload'
export type TrendDirection = 'improving' | 'declining' |
'stable' | 'new' | 'watch'
export type TargetPriority = 'primary_focus' | 'build' |
'maintain' | 'protect'
export type ConversationRole = 'user' | 'assistant'
// ── Core Entities ─────────────────────────────────────────────
export interface User {
id: string
clerkUserId: string
email: string | null
createdAt: string
updatedAt: string
}
export interface Equipment {
hasPowerMeter?: boolean
hasHrvMonitor?: boolean
watchBrand?: string
bikeType?: string
}
export interface AthleteProfile {
id: string
userId: string
name: string | null
age: number | null
weightKg: number | null
experienceLevel: ExperienceLevel | null
primaryGoal: string | null
weeklyHoursAvailable: number | null
trainingPhase: string | null
constraints: string | null
injuryHistory: string | null
currentNiggles: string | null
disciplinesToFocus: string[]
activePersonaId: PersonaId
coachingNotes: string | null
equipment: Equipment
createdAt: string
updatedAt: string
}
export interface Race {
id: string
userId: string
name: string
date: string | null // ISO date 'YYYY-MM-DD'
distance: string | null
priority: RacePriority | null
location: string | null
status: RaceStatus
result: Record<string, unknown> | null
createdAt: string
updatedAt: string
}
export interface AthleteKPIs {
id: string
userId: string
swimCssPer100m: string | null
bikeFtpWatts: number | null
bikeFtpWkg: number | null
runThresholdPace: string | null
vo2maxEstimate: number | null
hrvBaseline: number | null
rhrBpm: number | null
source: KPISource
updatedAt: string
}
export interface KPIHistoryEntry {
id: string
userId: string
metricName: string
metricValue: string
source: KPISource
recordedAt: string
}
export interface TrainingSession {
id: string
userId: string
date: string // ISO date 'YYYY-MM-DD'
title: string | null
discipline: Discipline
isPlanned: boolean
wasPlanned: boolean | null
completedAsPlanned: boolean | null
dateConfirmedByAthlete: boolean
durationMinutes: number | null
distanceKm: number | null
rpe: number | null
hrvMorning: number | null
sleepHours: number | null
notes: string | null
keyMetrics: Record<string, string | number>
source: SessionSource
rawFitData: Record<string, unknown> | null
// Plan / agent fields
planId?: string | null
sessionType?: string | null
phase?: string | null
structure?: string | null
coachingNote?: string | null
targets?: Record<string, unknown>
createdAt: string
updatedAt: string
}
// ── KPI Targets (nested structure) ────────────────────────────
export interface KPITargetMetric {
name: string
current: string | null
target: string | null
unit: string | null
trend: TrendDirection | null
isMasterMetric: boolean
note: string | null
}
export interface KPITargetCategory {
id: string
label: string
priority: TargetPriority
summary: string | null
metrics: KPITargetMetric[]
}
export interface Guardrail {
area: string
description: string
}
export interface DecisionGate {
name: string
targetDate: string | null
description: string
}
export interface KPITargets {
id: string
userId: string
categories: KPITargetCategory[]
guardrails: Guardrail[]
decisionGates: DecisionGate[]
updatedAt: string
}
// ── Concerns ──────────────────────────────────────────────────
export interface AthleteConcern {
id: string
userId: string
level: ConcernLevel
category: string
message: string
dataPointsCited: string[]
recommendedAction: string | null
seekMedicalAdvice: boolean
isResolved: boolean
resolvedAt: string | null
createdAt: string
}
// ── Conversation ──────────────────────────────────────────────
export interface ConversationTurn {
id: string
userId: string
role: ConversationRole
content: string
rawApiContent: unknown[] | null // full Anthropic content block array
turnIndex: number
createdAt: string
}
export interface ConversationSummary {
id: string
userId: string
summary: string
turnsSummarised: number
turnRangeStart: number
turnRangeEnd: number
createdAt: string
}
// ── Admin ─────────────────────────────────────────────────────
export interface AdminPromptEdit {
id: string
section: string
content: string
editedBy: string | null
isActive: boolean
createdAt: string
updatedAt: string
}
// ── API Request/Response shapes ───────────────────────────────
// What the client sends to /api/chat
export interface ChatRequest {
messages: AnthropicMessage[]
personaId: PersonaId
timezone?: string // IANA zone, e.g. 'Europe/Paris' — captured client-side per request
}
// Anthropic message format
export interface AnthropicMessage {
role: 'user' | 'assistant'
content: string | AnthropicContentBlock[]
}
export interface AnthropicContentBlock {
type: string
id?: string
name?: string
input?: unknown
tool_use_id?: string
content?: string
text?: string
}
// Unified athlete state (loaded on app boot)
export interface AthleteState {
profile: AthleteProfile | null
kpis: AthleteKPIs | null
races: Race[]
sessions: TrainingSession[] // last 50, sorted desc
targets: KPITargets | null
concerns: AthleteConcern[]
history: ConversationTurn[] // last 40 turns
summaries: ConversationSummary[]
}
// ── Input types (omit server-generated fields) ────────────────
export type ProfileUpdate = Partial<Omit<AthleteProfile, 'id' |
'userId' | 'createdAt' | 'updatedAt'>>
export type KPIUpdate = Partial<Omit<AthleteKPIs, 'id' | 'userId'
| 'updatedAt'>>
export type NewRace = Omit<Race, 'id' | 'userId' | 'createdAt'
| 'updatedAt'>
export type NewSession = Omit<TrainingSession,'id' | 'userId' |
'createdAt' | 'updatedAt'>
export type NewConcern = Omit<AthleteConcern, 'id' | 'userId' |
'isResolved' | 'resolvedAt' | 'createdAt'>
export type NewKPITargets = Omit<KPITargets, 'id' | 'userId' |
'updatedAt'>