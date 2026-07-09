import { useRouter } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAthleteState } from '@/context/AthleteStateContext'
import type { TrainingSession } from '@/lib/types'

function SessionRow({ session, onPress }: { session: TrainingSession; onPress: () => void }) {
  const done = !session.isPlanned || session.completedAsPlanned !== null
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
      }}
    >
      <View>
        <Text style={{ fontSize: 14 }}>{session.title ?? session.discipline}</Text>
        <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          {new Date(session.date).toDateString()}
        </Text>
      </View>
      {done ? (
        <Ionicons name="checkmark" size={18} color="#16a34a" />
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      )}
    </TouchableOpacity>
  )
}

export default function SessionsScreen() {
  const { state, loading } = useAthleteState()
  const router = useRouter()

  if (loading || !state) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const completed = state.sessions.filter((s) => !s.isPlanned && s.date <= today).slice(0, 8)
  const upcoming = state.sessions.filter((s) => s.isPlanned && s.date >= today).slice(0, 8)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '500', marginBottom: 20 }}>Sessions</Text>

        <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase' }}>Recent</Text>
        {completed.map((s) => (
          <SessionRow key={s.id} session={s} onPress={() => router.push(`/(tabs)/sessions/${s.id}`)} />
        ))}

        <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' }}>
          Upcoming
        </Text>
        {upcoming.map((s) => (
          <SessionRow key={s.id} session={s} onPress={() => router.push(`/(tabs)/sessions/${s.id}`)} />
        ))}

        <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
          Full calendar and manual edits are in More.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}