import { Stack } from 'expo-router'

// Groups index.tsx (list) and [id].tsx (detail) into one self-contained
// navigator. Without this, Expo Router treats them as two flat, independently
// routable screens that don't match the "sessions" name declared in the tab
// bar — producing two extra ghost tabs instead of one clean "Sessions" tab.
export default function SessionsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}