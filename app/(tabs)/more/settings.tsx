import { useUser } from '@clerk/expo'
import { Stack } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Constants from 'expo-constants'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
      }}
    >
      <Text style={{ fontSize: 14, color: '#6b7280' }}>{label}</Text>
      <Text style={{ fontSize: 14, color: '#111827' }}>{value}</Text>
    </View>
  )
}

export default function SettingsScreen() {
  const { user } = useUser()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase' }}>Account</Text>
        <InfoRow label="Email" value={user?.primaryEmailAddress?.emailAddress ?? '—'} />

        <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 20, marginBottom: 8, textTransform: 'uppercase' }}>
          About
        </Text>
        <InfoRow label="App version" value={Constants.expoConfig?.version ?? '—'} />

        <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 20, lineHeight: 18 }}>
          Subscription management, notification preferences, and unit settings aren't available on
          mobile yet — manage those from the web app for now.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}