import { useSignIn, useSSO } from '@clerk/expo'
import { useRouter, type Href } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'

// Required once at module scope so the browser-based OAuth flow can
// correctly complete and hand control back to the app.
WebBrowser.maybeCompleteAuthSession()

// Warms up Android's browser ahead of time so the Google sign-in sheet
// opens faster — no-op on iOS. See Expo's auth guide for why this helps.
function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

export default function SignInScreen() {
  useWarmUpBrowser()

  // Core 3 API: signIn.password() returns { error } instead of throwing,
  // and signIn.finalize() replaces the old setActive() call.
  const { signIn, fetchStatus } = useSignIn()
  const { startSSOFlow } = useSSO()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const submitting = fetchStatus === 'fetching'

  async function onSubmit() {
    setError(null)
    const { error: signInError } = await signIn.password({ emailAddress: email, password })
    if (signInError) {
      const err = signInError as unknown as { errors?: { message?: string }[]; message?: string }
      setError(err.errors?.[0]?.message ?? err.message ?? 'Sign-in failed')
      return
    }
    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return
          router.replace(decorateUrl('/(tabs)/chat') as Href)
        },
      })
    } else {
      setError('Additional verification required — finish this on web for now.')
    }
  }

  async function onGoogleSignIn() {
    setError(null)
    setGoogleSubmitting(true)
    try {
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'coachatlas', path: 'sso-callback' })
      console.log('[GoogleSignIn] redirectUrl:', redirectUrl)
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      })
      // NOT JSON.stringify(result, ...) here — Clerk's returned resource
      // objects can have lazy getters (e.g. verification) that throw when
      // naively serialized. Log only the specific primitive fields we need.
      const { createdSessionId, setActive, signIn, signUp } = result
      console.log('[GoogleSignIn] createdSessionId:', createdSessionId)
      console.log('[GoogleSignIn] signIn status:', signIn?.status)
      console.log('[GoogleSignIn] signUp status:', signUp?.status)
      if (createdSessionId && setActive) {
        console.log('[GoogleSignIn] calling setActive...')
        await setActive({ session: createdSessionId })
        console.log('[GoogleSignIn] setActive resolved — letting AuthGate navigate')
        // Do NOT navigate here. Calling router.replace() immediately after
        // setActive() races AuthGate: segments can update to reflect the
        // new route before Clerk's isSignedIn context has actually flipped
        // to true, so AuthGate sees { isSignedIn: false, inAuthGroup: false }
        // and bounces straight back to sign-in — the exact loop this was
        // causing. AuthGate already reacts to isSignedIn changing; let it
        // be the only thing that ever calls router.replace after sign-in.
      } else {
        console.log('[GoogleSignIn] no createdSessionId — flow did not complete a session')
      }
    } catch (err) {
      console.log('[GoogleSignIn] threw error — name:', (err as Error)?.name)
      console.log('[GoogleSignIn] threw error — message:', (err as Error)?.message)
      console.log('[GoogleSignIn] threw error — stack:', (err as Error)?.stack)
      const e = err as unknown as { errors?: { message?: string; longMessage?: string; code?: string }[]; message?: string }
      console.log('[GoogleSignIn] threw error — clerk errors array:', JSON.stringify(e.errors, null, 2))
      setError(e.errors?.[0]?.message ?? e.message ?? 'Google sign-in failed')
    } finally {
      setGoogleSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 24 }}>Coach Atlas</Text>

      <TouchableOpacity
        onPress={onGoogleSignIn}
        disabled={googleSubmitting || submitting}
        style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 8,
          padding: 14,
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        {googleSubmitting ? (
          <ActivityIndicator color="#111827" />
        ) : (
          <Text style={{ color: '#111827', fontWeight: '500' }}>Continue with Google</Text>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
        <Text style={{ marginHorizontal: 10, color: '#9ca3af', fontSize: 12 }}>OR</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
      </View>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={inputStyle}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={inputStyle}
      />
      {error ? <Text style={{ color: '#c0392b', marginBottom: 12 }}>{error}</Text> : null}
      <TouchableOpacity
        onPress={onSubmit}
        disabled={submitting || googleSubmitting}
        style={{
          backgroundColor: '#111827',
          borderRadius: 8,
          padding: 14,
          alignItems: 'center',
        }}
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '500' }}>Sign in</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
}