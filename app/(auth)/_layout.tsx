import { Stack } from 'expo-router'

// This group only holds the sign-in/sign-up screens. Auth state, the
// ClerkProvider, and the redirect logic all live once, in the root
// app/_layout.tsx — this file must not duplicate any of that.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}