import { useSignIn } from '@clerk/expo'
import { useSignInWithGoogle } from '@clerk/expo/google'
import { useRouter, type Href } from 'expo-router'
import { useState } from 'react'
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// ── Auth strategy note (Jul 2026) ───────────────────────────────
// Google sign-in here is the NATIVE flow (Android Credential Manager /
// iOS ASAuthorization) via @clerk/expo/google — no browser, no redirect.
// The previous browser-based useSSO flow created sessions whose
// browser→native handoff silently died on the production Clerk instance
// (~30-60s after sign-in; reproduced on 3.7.2 and 3.7.8 store builds).
// Native flow creates the session directly on the app's own client, so
// the failing mechanism doesn't exist. Requires: expo-crypto, Google
// Cloud Android OAuth clients (per signing cert SHA), the Web client id,
// and env vars EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID /
// EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID.
//
// The email-code path exists because SSO-created web accounts have no
// password — without it, those users could never sign in on mobile.

export default function SignInScreen() {
  // Core 3 API: factor methods return { error } instead of throwing,
  // and signIn.finalize() replaces the old setActive() call.
  const { signIn, fetchStatus } = useSignIn()
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle()
  const router = useRouter()

  const [mode, setMode] = useState<'password' | 'code'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const submitting = fetchStatus === 'fetching'

  function clerkMessage(e: unknown, fallback: string): string {
    const err = e as { errors?: { message?: string }[]; message?: string }
    return err?.errors?.[0]?.message ?? err?.message ?? fallback
  }

  async function finalizeSignIn() {
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

  async function onSubmitPassword() {
    setError(null)
    const { error: signInError } = await signIn.password({ emailAddress: email, password })
    if (signInError) {
      setError(clerkMessage(signInError, 'Sign-in failed'))
      return
    }
    await finalizeSignIn()
  }

  async function onSendCode() {
    setError(null)
    if (!email.trim()) {
      setError('Enter your email first')
      return
    }
    const { error: sendError } = await signIn.emailCode.sendCode({ emailAddress: email.trim() })
    if (sendError) {
      setError(clerkMessage(sendError, "Couldn't send the code"))
      return
    }
    setCodeSent(true)
  }

  async function onVerifyCode() {
    setError(null)
    const { error: verifyError } = await signIn.emailCode.verifyCode({ code: code.trim() })
    if (verifyError) {
      setError(clerkMessage(verifyError, 'Invalid code'))
      return
    }
    await finalizeSignIn()
  }

  async function onGoogleSignIn() {
    setError(null)
    setGoogleSubmitting(true)
    try {
      const { createdSessionId, setActive } = await startGoogleAuthenticationFlow()
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
        // Do NOT navigate here — AuthGate reacts to isSignedIn flipping
        // and owns the post-sign-in redirect. Navigating from here races
        // it (see the doctrine comment history in this file's git log).
      }
      // No createdSessionId without an error = user dismissed the sheet.
    } catch (err) {
      const msg = clerkMessage(err, 'Google sign-in failed')
      // User-cancel of the native sheet isn't an error worth showing.
      if (!/cancel/i.test(msg)) setError(msg)
    } finally {
      setGoogleSubmitting(false)
    }
  }

  function switchMode(next: 'password' | 'code') {
    setMode(next)
    setError(null)
    setCode('')
    setCodeSent(false)
  }

  const busy = submitting || googleSubmitting

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 24 }}>Kaidenz</Text>

      <TouchableOpacity
        onPress={onGoogleSignIn}
        disabled={busy}
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

      {mode === 'password' && (
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={inputStyle}
        />
      )}

      {mode === 'code' && codeSent && (
        <TextInput
          placeholder="6-digit code from your email"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          style={inputStyle}
        />
      )}

      {error ? <Text style={{ color: '#c0392b', marginBottom: 12 }}>{error}</Text> : null}

      {mode === 'password' ? (
        <TouchableOpacity onPress={onSubmitPassword} disabled={busy} style={primaryBtn}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={btnText}>Sign in</Text>}
        </TouchableOpacity>
      ) : !codeSent ? (
        <TouchableOpacity onPress={onSendCode} disabled={busy} style={primaryBtn}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={btnText}>Email me a sign-in code</Text>}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onVerifyCode} disabled={busy} style={primaryBtn}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={btnText}>Verify & sign in</Text>}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => switchMode(mode === 'password' ? 'code' : 'password')}
        disabled={busy}
        style={{ marginTop: 16, alignItems: 'center' }}
      >
        <Text style={{ color: '#6b7280', fontSize: 13 }}>
          {mode === 'password' ? 'No password? Email me a sign-in code' : 'Use password instead'}
        </Text>
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

const primaryBtn = {
  backgroundColor: '#111827',
  borderRadius: 8,
  padding: 14,
  alignItems: 'center' as const,
}

const btnText = { color: '#fff', fontWeight: '500' as const }