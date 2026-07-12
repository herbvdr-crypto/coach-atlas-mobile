import { useAuth } from '@clerk/expo'
import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

// Must wait for Clerk to actually finish loading before deciding where to
// send the user — redirecting to the authenticated area unconditionally
// (regardless of real auth state) was causing a flash of the chat screen
// on every single load, followed by AuthGate correctly bouncing back to
// sign-in a moment later once the real auth state resolved.
export default function Index() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false })

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return <Redirect href={isSignedIn ? '/(tabs)/chat' : '/(auth)/sign-in'} />
}