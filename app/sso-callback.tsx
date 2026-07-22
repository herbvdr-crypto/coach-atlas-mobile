import { Redirect } from 'expo-router'

// The OAuth redirect URI (kaidenz://sso-callback) is also, structurally,
// a valid in-app route path — Expo Router intercepts every incoming link
// matching the app's scheme and tries to match it against a route file.
// Without this file it shows "Unmatched Route" right after a successful
// sign-in, even though the session was already created correctly.
// index.tsx already knows how to branch on real auth state, so just hand
// off to it rather than duplicating that logic here.
export default function SSOCallback() {
  return <Redirect href="/" />
}