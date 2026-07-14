import { useAuth } from '@clerk/expo'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ApiError, sendChatMessage, updateActivePersona, fetchUsageStatus } from '@/lib/api'
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

  const [personaId, setPersonaId] = useState<PersonaId>('rex')
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
    setPersonaId(state.profile?.activePersonaId ?? 'rex')
    const hydrated = state.history
      .filter((t) => typeof t.content === 'string')
      .map((t) => ({ id: t.id, role: t.role, text: t.content }))
    setMessages(hydrated)
  }, [state])

  const currentPersona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return

    const userMsg: DisplayMessage = { id: `local-${Date.now()}`, role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      // Build the Anthropic-format message list from display history.
      const anthropicMessages: AnthropicMessage[] = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }))

      const data = await sendChatMessage(() => getToken(), anthropicMessages, personaId)

      // The server now runs the full agent turn — tools are executed
      // server-side with real, awaited results (F10.1 fix) — so what
      // arrives here is always the FINAL text of the turn.
      const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
      const replyText: string =
        data.text ?? textBlock?.text ?? 'I processed your request. Let me know if you need anything else.'

      setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', text: replyText }])

      // Tools ran and changed profile/KPIs/sessions — refresh the shared
      // state so other tabs reflect what the DB now actually holds.
      if (data.toolsExecuted?.length || data.stop_reason === 'tool_use') {
        refresh()
      }
    } catch (e) {
      // Deliberate blocks (usage limit, rate limit, subscription gate)
      // carry a server-crafted message — show that, not a misleading
      // connectivity error (F10.5 / F9.2 parity).
      const isBlock = e instanceof ApiError && (e.status === 429 || e.status === 402)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: isBlock && e.message
            ? e.message
            : "Couldn't reach the coach. Check your connection and try again.",
        },
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
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