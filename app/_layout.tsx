import { ClerkProvider, useAuth } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { Slot, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { AthleteStateProvider } from '@/context/AthleteStateContext'

// @clerk/expo (Core 3) ships its own SecureStore-backed token cache —
// no need to hand-roll one against expo-secure-store directly anymore.

function getPublishableKey(): string {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!key) {
    throw new Error('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing — check your .env')
  }
  return key
}

const publishableKey = getPublishableKey()

function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    const inAuthGroup = segments[0] === '(auth)'

    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in')
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)/chat')
    }
  }, [isLoaded, isSignedIn, segments])

  return <Slot />
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AthleteStateProvider>
        <AuthGate />
      </AthleteStateProvider>
    </ClerkProvider>
  )
}