import { Stack } from 'expo-router'
import { ActivityIndicator, ScrollView, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAthleteState, useRefreshOnFocus } from '@/context/AthleteStateContext'

export default function CoachingNotesScreen() {
  const { state, loading } = useAthleteState()
  useRefreshOnFocus()

  if (loading || !state) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  const notes = state.profile?.coachingNotes

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Coaching notes' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {notes ? (
          <Text style={{ fontSize: 14, color: '#111827', lineHeight: 21 }}>{notes}</Text>
        ) : (
          <Text style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
            No standing coaching notes yet. Your coach builds these up through conversation over time.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}