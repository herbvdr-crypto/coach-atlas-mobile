import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAthleteState } from '@/context/AthleteStateContext'

// Key metrics arrive as a mixed bag: scalars worth showing, and bulky
// structures (lap_splits arrays, raw JSON) that must NEVER be dumped on
// screen — scalars render as-is, arrays become a one-line summary, and
// deep objects are omitted (the coach analyses them; the athlete doesn't
// need to read JSON).
function formatMetricLabel(k: string): string {
  return k.replace(/_/g, ' ')
}

function formatMetricValue(k: string, v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') {
    const s = v.trim()
    if (s.startsWith('[') || s.startsWith('{')) {
      try {
        const parsed = JSON.parse(s)
        return formatMetricValue(k, parsed)
      } catch { /* fall through — treat as plain text */ }
    }
    return s.length > 80 ? s.slice(0, 77) + '…' : s
  }
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) {
    if (k === 'lap_splits') return `${v.length} laps recorded`
    return `${v.length} entries`
  }
  return '' // deep objects: omitted by Field's empty-value guard
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
      <Text style={{ fontSize: 13, color: '#6b7280', flexShrink: 0 }}>{label}</Text>
      <Text style={{ fontSize: 13, flex: 1, textAlign: 'right', marginLeft: 12 }}>{value}</Text>
    </View>
  )
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { state } = useAthleteState()
  const router = useRouter()

  // No separate fetch needed — /api/athlete/state already returns the
  // last 50 sessions with keyMetrics/rawFitData, which covers this view.
  const session = state?.sessions.find((s) => s.id === id)

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Session not found</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '500', marginLeft: 12 }}>
          {session.title ?? session.discipline}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
        <Field label="Date" value={new Date(session.date + 'T12:00:00').toDateString()} />
        <Field
          label="Status"
          value={session.skipped ? 'Skipped (deliberately not done)' : session.isPlanned ? 'Planned' : 'Completed'}
        />
        <Field label="Discipline" value={session.discipline} />
        <Field label="Duration" value={session.durationMinutes ? `${session.durationMinutes} min` : ''} />
        <Field label="Distance" value={session.distanceKm ? `${session.distanceKm} km` : ''} />
        <Field label="RPE" value={session.rpe ? String(session.rpe) : ''} />
        <Field label="Sleep" value={session.sleepHours ? `${session.sleepHours} h` : ''} />
        <Field label="HRV (morning)" value={session.hrvMorning ? String(session.hrvMorning) : ''} />
        <Field
          label="Completed as planned"
          value={session.completedAsPlanned === null ? '' : session.completedAsPlanned ? 'Yes' : 'Partial match'}
        />

        {Object.keys(session.keyMetrics ?? {}).length > 0 && (
          <>
            <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 16, marginBottom: 4 }}>Key metrics</Text>
            {Object.entries(session.keyMetrics).map(([k, v]) => (
              <Field key={k} label={formatMetricLabel(k)} value={formatMetricValue(k, v)} />
            ))}
          </>
        )}

        {session.notes && (
          <>
            <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 16, marginBottom: 4 }}>Notes</Text>
            <Text style={{ fontSize: 14, lineHeight: 20 }}>{session.notes}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}