import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { PERSONAS, type PersonaId } from '@/lib/types'

interface Props {
  visible: boolean
  activePersonaId: PersonaId
  onSelect: (id: PersonaId) => void
  onClose: () => void
}

export function PersonaSheet({ visible, activePersonaId, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 20,
            paddingBottom: 36,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 12 }}>Switch coach</Text>
          {PERSONAS.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => onSelect(p.id)}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={{ fontSize: 15, fontWeight: p.id === activePersonaId ? '500' : '400' }}>{p.label}</Text>
                <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{p.blurb}</Text>
              </View>
              {p.id === activePersonaId && <Text style={{ color: '#111827' }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  )
}