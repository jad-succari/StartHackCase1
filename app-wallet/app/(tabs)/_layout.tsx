import { useState } from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getRole } from '../../lib/roleStore'

const TEAL     = '#2A8FA0'
const INACTIVE = '#D4CDC5'

export default function TabsLayout() {
  const [role] = useState(() => getRole())
  const isPartner = role === 'partner'

  return (
    <Tabs
      initialRouteName={isPartner ? 'scanner' : 'index'}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TEAL,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#FAF8F5',
          borderTopColor: 'rgba(26,22,18,0.08)',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          href: isPartner ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          href: isPartner ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          href: isPartner ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: 'Famille',
          href: isPartner ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="badges"
        options={{
          title: 'Badges',
          tabBarLabel: '🏅 Badges',
          href: isPartner ? null : undefined,
        }}
      />
      {/* map hidden for everyone */}
      <Tabs.Screen
        name="map"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          href: isPartner ? undefined : null,
        }}
      />
    </Tabs>
  )
}
