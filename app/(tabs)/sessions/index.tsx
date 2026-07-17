import { useRouter } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAthleteState, useRefreshOnFocus } from '@/context/AthleteStateContext'
import type { TrainingSession } from '@/lib/types'

function SessionRow({ session, onPress }: { session: TrainingSession; onPress: () => void }) {
  const skipped = session.skipped === true
  const done = !skipped && (!session.isPlanned || session.completedAsPlanned !== null)
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#f9fafb',
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        opacity: skipped ? 0.65 : 1,
      }}
    >
      <View>
        <Text style={{ fontSize: 14 }}>{session.title ?? session.discipline}</Text>
        <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          {new Date(session.date + 'T12:00:00').toDateString()}
        </Text>
      </View>
      {skipped ? (
        <Text style={{ fontSize: 11, color: '#6b7280', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
          Skipped
        </Text>
      ) : done ? (
        <Ionicons name="checkmark" size={18} color="#16a34a" />
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      )}
    </TouchableOpacity>
  )
}

export default function SessionsScreen() {
  const { state, loading } = useAthleteState()
  useRefreshOnFocus()
  const router = useRouter()

  if (loading || !state) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  // Device-LOCAL calendar day (en-CA = YYYY-MM-DD) — the UTC version put
  // early-morning sessions on the wrong side of Upcoming/Past for any
  // athlete east of UTC (F10.4 family).
  const today = new Date().toLocaleDateString('en-CA')
  const completed = state.sessions
    // Past = completions AND skips — a skip is resolved history, never upcoming
    .filter((s) => (!s.isPlanned && s.date <= today) || s.skipped === true)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)
  const upcoming = state.sessions
    .filter((s) => s.isPlanned && s.skipped !== true && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '500', marginBottom: 20 }}>Sessions</Text>

        <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase' }}>
          Upcoming
        </Text>
        {upcoming.map((s) => (
          <SessionRow key={s.id} session={s} onPress={() => router.push(`/(tabs)/sessions/${s.id}`)} />
        ))}

        <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' }}>
          Past
        </Text>
        {completed.map((s) => (
          <SessionRow key={s.id} session={s} onPress={() => router.push(`/(tabs)/sessions/${s.id}`)} />
        ))}

        <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
          Full calendar and manual edits are in More.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}