import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'
import { useAthleteState } from '@/context/AthleteStateContext'

function MoreIcon({ color, size }: { color: string; size: number }) {
  const { unresolvedConcernCount } = useAthleteState()
  return (
    <View>
      <Ionicons name="menu" color={color} size={size} />
      {unresolvedConcernCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#e11d48',
          }}
        />
      )}
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="chat"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9ca3af',
        // Without this the tab bar wedges between the chat input and the
        // keyboard on Android. Hiding it while typing gives the standard
        // messaging-app layout: input directly above the keyboard.
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="kpis"
        options={{
          title: 'KPIs',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: MoreIcon,
        }}
      />
    </Tabs>
  )
}