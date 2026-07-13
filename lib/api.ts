import Constants from 'expo-constants'
import type { AnthropicMessage, AthleteState, ChatRequest, PersonaId } from './types'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? ''

if (!API_URL) {
  console.warn('EXPO_PUBLIC_API_URL is not set — check your .env')
}

// Every call needs a fresh Clerk session token. Pass the getToken
// function from useAuth() rather than a stored token, since tokens
// are short-lived and Clerk handles refresh internally.
type TokenGetter = () => Promise<string | null>

async function authedFetch(
  path: string,
  getToken: TokenGetter,
  init: RequestInit = {}
) {
  const token = await getToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${path} failed: ${res.status} ${text}`)
  }

  return res.json()
}

// GET /api/athlete/state — profile, kpis, races, sessions, concerns,
// and the last 40 turns of conversation history. This one call hydrates
// every tab, and is what makes cross-device chat continuity free —
// mobile and web read/write the same conversation_history rows.
export function fetchAthleteState(getToken: TokenGetter): Promise<AthleteState> {
  return authedFetch('/api/athlete/state', getToken)
}

// POST /api/chat — non-streaming. Waits for the full turn (including
// any server-side tool round-trips) and returns the raw Anthropic
// response shape, same as the web client consumes.
export function sendChatMessage(
  getToken: TokenGetter,
  messages: AnthropicMessage[],
  personaId: PersonaId
) {
  const body: ChatRequest = {
    messages,
    personaId,
    // RN's Hermes engine has full Intl support as of Expo SDK 53 — this
    // reflects the phone's actual current timezone, which matters for an
    // athlete training across timezones, not just their home one.
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
  return authedFetch('/api/chat', getToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/athlete — generic tool-persistence endpoint. Used here only
// for the manual persona switch (update_athlete_profile). Confirm
// activePersonaId is accepted by the updates schema server-side before
// relying on this — it wasn't visible in the TOOLS input_schema excerpt
// reviewed, only the more common profile fields were.
export function updateActivePersona(getToken: TokenGetter, personaId: PersonaId) {
  return authedFetch('/api/athlete', getToken, {
    method: 'POST',
    body: JSON.stringify({
      toolName: 'update_athlete_profile',
      toolInput: { updates: { active_persona_id: personaId } },
    }),
  })
}
// GET /api/athlete/usage — returns only percentage-used and warning state,
// never raw dollar figures (deliberately, matching the web app's approach).
export function fetchUsageStatus(getToken: TokenGetter) {
  return authedFetch('/api/athlete/usage', getToken)
}