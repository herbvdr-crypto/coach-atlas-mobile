import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAthleteState, useRefreshOnFocus } from '@/context/AthleteStateContext'
import { PERSONAS } from '@/lib/types'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
      <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 15 }}>{value}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { state, loading } = useAthleteState()
  useRefreshOnFocus()

  if (loading || !state) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  const { profile, races } = state
  const persona = PERSONAS.find((p) => p.id === profile?.activePersonaId)
  const nextRace = races.find((r) => r.priority === 'A' && r.status === 'planned')

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '500', marginBottom: 20 }}>Profile</Text>

        <Row label="Name" value={profile?.name ?? '—'} />
        <Row label="Coach" value={persona ? `${persona.label} · ${persona.blurb}` : '—'} />
        <Row label="Training phase" value={profile?.trainingPhase ?? '—'} />
        <Row
          label="Next A race"
          value={nextRace ? `${nextRace.name} · ${new Date(nextRace.date).toDateString()}` : 'None scheduled'}
        />

        <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
          Full profile, equipment and edit options are in More.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}