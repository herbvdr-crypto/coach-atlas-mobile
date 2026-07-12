import { Stack } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAthleteState, useRefreshOnFocus } from '@/context/AthleteStateContext'
import type { Race } from '@/lib/types'

const PRIORITY_STYLE: Record<'A' | 'B' | 'C', { bg: string; fg: string }> = {
  A: { bg: '#fee2e2', fg: '#b91c1c' },
  B: { bg: '#fef3c7', fg: '#92400e' },
  C: { bg: '#e5e7eb', fg: '#4b5563' },
}

function RaceCard({ race }: { race: Race }) {
  const style = PRIORITY_STYLE[race.priority]
  const past = new Date(race.date) < new Date()
  return (
    <View
      style={{
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        opacity: past ? 0.6 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <View style={{ backgroundColor: style.bg, borderRadius: 6, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 12, color: style.fg, fontWeight: '700' }}>{race.priority}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '500', flex: 1 }}>{race.name}</Text>
      </View>
      <Text style={{ fontSize: 13, color: '#6b7280' }}>
        {new Date(race.date).toDateString()} · {race.distance}
      </Text>
      {race.location ? <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{race.location}</Text> : null}
      <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, textTransform: 'capitalize' }}>{race.status}</Text>
    </View>
  )
}

export default function RacesScreen() {
  const { state, loading } = useAthleteState()
  useRefreshOnFocus()

  if (loading || !state) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  const races = [...state.races].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Races' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {races.length === 0 ? (
          <Text style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
            No races scheduled yet.
          </Text>
        ) : (
          races.map((r) => <RaceCard key={r.id} race={r} />)
        )}
      </ScrollView>
    </SafeAreaView>
  )
}