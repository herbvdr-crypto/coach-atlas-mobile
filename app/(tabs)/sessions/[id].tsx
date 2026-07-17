import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAthleteState } from '@/context/AthleteStateContext'

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
      <Text style={{ fontSize: 13, color: '#6b7280' }}>{label}</Text>
      <Text style={{ fontSize: 13 }}>{value}</Text>
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
              <Field key={k} label={k} value={String(v)} />
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