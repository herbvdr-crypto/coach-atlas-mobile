import { Stack } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAthleteState, useRefreshOnFocus } from '@/context/AthleteStateContext'
import type { AthleteConcern, ConcernLevel } from '@/lib/types'

const LEVEL_STYLE: Record<ConcernLevel, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  critical: { bg: '#fee2e2', fg: '#b91c1c', icon: 'alert-circle' },
  warning: { bg: '#fef3c7', fg: '#92400e', icon: 'warning-outline' },
  info: { bg: '#dbeafe', fg: '#1e40af', icon: 'information-circle-outline' },
}

function ConcernCard({ concern }: { concern: AthleteConcern }) {
  const style = LEVEL_STYLE[concern.level]
  return (
    <View
      style={{
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        opacity: concern.isResolved ? 0.55 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <View
          style={{
            backgroundColor: style.bg,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Ionicons name={style.icon} size={12} color={style.fg} />
          <Text style={{ fontSize: 11, color: style.fg, fontWeight: '600', textTransform: 'uppercase' }}>
            {concern.level}
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: '#9ca3af' }}>{concern.category}</Text>
        {concern.isResolved ? (
          <Text style={{ fontSize: 11, color: '#16a34a', marginLeft: 'auto' }}>Resolved</Text>
        ) : null}
      </View>
      <Text style={{ fontSize: 14, color: '#111827', marginBottom: concern.recommendedAction ? 6 : 0 }}>
        {concern.message}
      </Text>
      {concern.recommendedAction ? (
        <Text style={{ fontSize: 13, color: '#4b5563' }}>Suggested: {concern.recommendedAction}</Text>
      ) : null}
      {concern.seekMedicalAdvice ? (
        <Text style={{ fontSize: 12, color: '#b91c1c', marginTop: 6, fontWeight: '500' }}>
          Consider speaking with a medical professional
        </Text>
      ) : null}
      <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
        {new Date(concern.createdAt).toDateString()}
      </Text>
    </View>
  )
}

export default function FlagsScreen() {
  const { state, loading } = useAthleteState()
  useRefreshOnFocus()

  if (loading || !state) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  const unresolved = state.concerns.filter((c) => !c.isResolved)
  const resolved = state.concerns.filter((c) => c.isResolved)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Flags and concerns' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {state.concerns.length === 0 ? (
          <Text style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
            No flags — nothing for the coach to raise right now.
          </Text>
        ) : (
          <>
            {unresolved.length > 0 && (
              <>
                <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase' }}>
                  Open
                </Text>
                {unresolved.map((c) => (
                  <ConcernCard key={c.id} concern={c} />
                ))}
              </>
            )}
            {resolved.length > 0 && (
              <>
                <Text
                  style={{ fontSize: 12, color: '#9ca3af', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' }}
                >
                  Resolved
                </Text>
                {resolved.map((c) => (
                  <ConcernCard key={c.id} concern={c} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}