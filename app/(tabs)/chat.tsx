import { useAuth } from '@clerk/expo'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
// RN's built-in KeyboardAvoidingView is broken on Android under SDK 54's
// mandatory edge-to-edge (adjustResize no longer applies). This drop-in
// replacement tracks the keyboard natively on both platforms.
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { sendChatMessage, updateActivePersona, fetchUsageStatus } from '@/lib/api'
import { useAthleteState, useRefreshOnFocus } from '@/context/AthleteStateContext'
import { PersonaSheet } from '@/components/PersonaSheet'
import { PERSONAS, type AnthropicMessage, type PersonaId } from '@/lib/types'

interface DisplayMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export default function ChatScreen() {
  const { getToken } = useAuth()
  const { state, refresh } = useAthleteState()
  useRefreshOnFocus()

  const [personaId, setPersonaId] = useState<PersonaId>('kai')
  const [personaSheetOpen, setPersonaSheetOpen] = useState(false)
  const [usageStatus, setUsageStatus] = useState<{ pctUsed: number; isWarning: boolean; isBlocked: boolean } | null>(null)
  const [showUsagePct, setShowUsagePct] = useState(false)

  useEffect(() => {
    fetchUsageStatus(getToken)
      .then(setUsageStatus)
      .catch(() => {})
  }, [])
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<FlatList>(null)

  // Hydrate from conversation_history on mount — this is what makes
  // chat continuous with whatever was last said on web.
  useEffect(() => {
    if (!state) return
    setPersonaId(state.profile?.activePersonaId ?? 'kai')
    const hydrated = state.history
      .filter((t) => typeof t.content === 'string')
      // Legacy system-marker rows ("[Updating your profile: ...]" etc.) are
      // bookkeeping, not conversation — the web client hides them too.
      .filter((t) => !/^\[(Updating your profile|Uploading|System)/i.test((t.content as string).trim()))
      .map((t) => ({ id: t.id, role: t.role, text: t.content }))
    setMessages(hydrated)
  }, [state])

  const currentPersona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]

  // The FlatList is `inverted` (standard chat-app pattern): index 0 renders
  // at the visual bottom, so the list opens pinned to the newest message
  // with no scroll-on-mount hacks. Data must therefore be newest-first.
  const invertedMessages = useMemo(() => [...messages].reverse(), [messages])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return

    const userMsg: DisplayMessage = { id: `local-${Date.now()}`, role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)
    // Snap back to the newest message even if the user had scrolled up.
    listRef.current?.scrollToOffset({ offset: 0, animated: true })

    try {
      // Build the Anthropic-format message list from display history.
      const anthropicMessages: AnthropicMessage[] = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }))

      const data = await sendChatMessage(() => getToken(), anthropicMessages, personaId)

      const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
      const replyText = textBlock?.text ?? '✓ Done'

      setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', text: replyText }])

      // A tool call may have changed profile/KPIs/sessions — refresh
      // the shared state so other tabs stay current.
      if (data.stop_reason === 'tool_use') {
        refresh()
      }
    } catch (e) {
      // Deliberate server blocks carry their status — surface the real
      // reason instead of a generic connection error. NOTE (Play/App Store
      // policy): the subscription message must inform, never steer to an
      // external purchase — no links, no buttons, no checkout mention.
      const status = (e as { status?: number })?.status
      const text =
        status === 402
          ? 'Your trial has ended. Manage your subscription from the Kaidenz website, then come back here — all your training data is safe.'
          : status === 429
          ? 'Easy — a few too many messages at once. Give it a moment and try again.'
          : "Couldn't reach the coach. Check your connection and try again."
      setMessages((prev) => [
        ...prev,
        { id: `error-${Date.now()}`, role: 'assistant', text },
      ])
    } finally {
      setSending(false)
    }
  }, [input, messages, personaId, sending, getToken, refresh])

  async function handlePersonaSelect(id: PersonaId) {
    setPersonaId(id)
    setPersonaSheetOpen(false)
    try {
      await updateActivePersona(() => getToken(), id)
    } catch {
      // Non-fatal — local persona switch still works for this session
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '500' }}>{currentPersona.label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {usageStatus && (
            <TouchableOpacity
              onPress={() => setShowUsagePct((v) => !v)}
              hitSlop={10}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              {(showUsagePct || usageStatus.isBlocked) && (
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '500',
                    color: usageStatus.isBlocked ? '#dc2626' : usageStatus.isWarning ? '#b45309' : '#6b7280',
                  }}
                >
                  {usageStatus.isBlocked ? 'Limit reached' : `${usageStatus.pctUsed}%`}
                </Text>
              )}
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: usageStatus.isBlocked ? '#dc2626' : usageStatus.isWarning ? '#f59e0b' : '#22c55e',
                }}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setPersonaSheetOpen(true)} hitSlop={12}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={invertedMessages}
          inverted
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <View
              style={{
                alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: item.role === 'user' ? '#111827' : '#f3f4f6',
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 10,
                maxWidth: '82%',
              }}
            >
              <Text style={{ color: item.role === 'user' ? '#fff' : '#111827', fontSize: 14 }}>{item.text}</Text>
            </View>
          )}
        />

        {sending && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
            <ActivityIndicator size="small" />
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={`Message ${currentPersona.label}`}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={sending || !input.trim()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#111827',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sending || !input.trim() ? 0.4 : 1,
            }}
          >
            <Ionicons name="arrow-up" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <PersonaSheet
        visible={personaSheetOpen}
        activePersonaId={personaId}
        onSelect={handlePersonaSelect}
        onClose={() => setPersonaSheetOpen(false)}
      />
    </SafeAreaView>
  )
}