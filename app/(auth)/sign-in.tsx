import { useSignIn } from '@clerk/expo'
import { useRouter, type Href } from 'expo-router'
import { useState } from 'react'
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignInScreen() {
  // Core 3 API: signIn.password() returns { error } instead of throwing,
  // and signIn.finalize() replaces the old setActive() call.
  const { signIn, fetchStatus } = useSignIn()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
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

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 24 }}>Coach Atlas</Text>

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
        disabled={submitting}
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