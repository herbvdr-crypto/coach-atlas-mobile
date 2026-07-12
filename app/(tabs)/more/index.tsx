import { useAuth } from '@clerk/expo'
import { useRouter, Stack } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAthleteState, } from '@/context/AthleteStateContext'

function MenuRow({
  icon,
  label,
  badge,
  danger,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  badge?: number
  danger?: boolean
  onPress?: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name={icon} size={18} color={danger ? '#dc2626' : '#4b5563'} />
        <Text style={{ fontSize: 14, color: danger ? '#dc2626' : '#111827' }}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {badge ? (
          <View style={{ backgroundColor: '#fef3c7', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontSize: 12, color: '#92400e' }}>{badge}</Text>
          </View>
        ) : null}
        {onPress && !danger ? <Ionicons name="chevron-forward" size={16} color="#9ca3af" /> : null}
      </View>
    </TouchableOpacity>
  )
}

export default function MoreScreen() {
  const { state, loading, unresolvedConcernCount } = useAthleteState()
  const { signOut } = useAuth()
  const router = useRouter()

  if (loading || !state) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '500', marginBottom: 12 }}>More</Text>
        <MenuRow
          icon="flag-outline"
          label="Flags and concerns"
          badge={unresolvedConcernCount || undefined}
          onPress={() => router.push('/(tabs)/more/flags')}
        />
        <MenuRow icon="trophy-outline" label="Races" onPress={() => router.push('/(tabs)/more/races')} />
        <MenuRow
          icon="document-text-outline"
          label="Coaching notes"
          onPress={() => router.push('/(tabs)/more/coaching-notes')}
        />
        <MenuRow
          icon="time-outline"
          label="KPI history"
          onPress={() => router.push('/(tabs)/more/kpi-history')}
        />
        <MenuRow icon="settings-outline" label="Settings" onPress={() => router.push('/(tabs)/more/settings')} />
        <MenuRow icon="log-out-outline" label="Sign out" danger onPress={() => signOut()} />
      </ScrollView>
    </SafeAreaView>
  )
}