// Mirrors the relevant slice of the web app's lib/types.ts.
// Kept in sync by hand — mobile has no server code of its own,
// it only calls the existing Next.js API routes.

export type Discipline =
  | 'swim'
  | 'bike'
  | 'run'
  | 'brick'
  | 'strength'
  | 'rest'
  | 'other'

export type ConcernLevel = 'info' | 'warning' | 'critical'

export type PersonaId = 'rex' | 'sophia' | 'marcus' | 'kai'

export const PERSONAS: { id: PersonaId; label: string; blurb: string }[] = [
  { id: 'rex', label: 'Rex', blurb: 'Verdict-first, punchy, numbers as evidence' },
  { id: 'sophia', label: 'Sophia', blurb: 'Empathy-first, translates data into experience' },
  { id: 'marcus', label: 'Marcus', blurb: 'Data-first, mechanism, precise terminology' },
  { id: 'kai', label: 'Kai', blurb: 'Story-first, plain English, big-picture journey' },
]

export type SessionIntent =
  | 'recovery'
  | 'aerobic_endurance'
  | 'tempo_sweetspot'
  | 'threshold'
  | 'vo2max_anaerobic'
  | 'strength_endurance'
  | 'skill'
  | 'race_simulation'
  | 'brick'

export interface GeoLocation {
  name: string
  lat: number
  lng: number
  timezone: string
  elevationM: number | null
}

export interface TravelWindow extends GeoLocation {
  startDate: string
  endDate: string
}

export interface AthleteProfile {
  id: string
  userId: string
  name: string | null
  age: number | null
  weightKg: number | null
  experienceLevel: string | null
  primaryGoal: string | null
  weeklyHoursAvailable: number | null
  trainingPhase: string | null
  constraints: string | null
  injuryHistory: string | null
  currentNiggles: string | null
  disciplinesToFocus: string[]
  activePersonaId: PersonaId
  coachingNotes: string | null
  equipment: Record<string, unknown>
  baseLocation: GeoLocation | null
  travelWindows: TravelWindow[]
  createdAt: string
  updatedAt: string
}

export interface Race {
  id: string
  name: string
  date: string
  distance: string
  priority: 'A' | 'B' | 'C'
  location: string | null
  status: string
  result: Record<string, unknown> | null
}

export interface AthleteKPIs {
  id: string
  userId: string
  swimCssPer100m: string | null
  bikeFtpWatts: number | null
  bikeFtpWkg: number | null
  runThresholdPace: string | null
  runLthr?: number | null
  bikeLthr?: number | null
  vo2maxEstimate: number | null
  hrvBaseline: number | null
  rhrBpm: number | null
  updatedAt: string
}

export interface TrainingSession {
  id: string
  userId: string
  date: string
  title: string | null
  discipline: Discipline
  isPlanned: boolean
  // Set 6 lifecycle: deliberately-not-done state (stays planned, never completed)
  skipped?: boolean
  wasPlanned: boolean | null
  completedAsPlanned: boolean | null
  durationMinutes: number | null
  distanceKm: number | null
  rpe: number | null
  hrvMorning: number | null
  sleepHours: number | null
  notes: string | null
  keyMetrics: Record<string, string | number>
  source: string
  rawFitData: Record<string, unknown> | null
  sessionType?: SessionIntent | null
  createdAt: string
  updatedAt: string
}

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

export interface DailyReadiness {
  id: string
  userId: string
  date: string
  hrv: number | null
  rhr: number | null
  sleepHours: number | null
  bodyBattery: number | null
  subjectiveScore: number | null
  notes: string | null
  createdAt: string
}

export interface ConversationTurn {
  id: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  // Null for turns saved before persona_id was added, or for turns this
  // client doesn't have a persona context for. Fall back to the currently
  // active persona when rendering rather than assuming a value.
  personaId: PersonaId | null
  turnIndex: number
  createdAt: string
}

// Anthropic message format — passed through to /api/chat as-is
export interface AnthropicContentBlock {
  type: string
  id?: string
  name?: string
  input?: unknown
  tool_use_id?: string
  content?: string
  text?: string
}

export interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string | AnthropicContentBlock[]
}

export interface ChatRequest {
  messages: AnthropicMessage[]
  personaId: PersonaId
  timezone?: string // IANA zone, e.g. 'Europe/Paris' — captured client-side per request
}

// Response shape from GET /api/athlete/state
export interface AthleteState {
  profile: AthleteProfile | null
  kpis: AthleteKPIs | null
  races: Race[]
  sessions: TrainingSession[]
  targets: Record<string, unknown> | null
  concerns: AthleteConcern[]
  history: ConversationTurn[]
  summaries: unknown[]
  recentReadiness: DailyReadiness[]
}