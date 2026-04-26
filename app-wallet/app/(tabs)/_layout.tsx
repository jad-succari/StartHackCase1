import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getRole } from '../../lib/roleStore'

const PRIMARY  = '#2A8FA0'
const INACTIVE = '#A89E92'

export default function TabsLayout() {
  const isPartner = getRole() === 'partner'

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: isPartner
          ? { display: 'none' }
          : {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#F0ECE8',
              height: 84,
              paddingBottom: 24,
              paddingTop: 8,
            },
      }}
    >
      {/* ── Tourist tabs ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          href: isPartner ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          href: isPartner ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          href: isPartner ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          href: isPartner ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="ticket-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: isPartner ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />

      {/* ── Hidden routes ── */}
      <Tabs.Screen name="family"  options={{ href: null }} />
      <Tabs.Screen name="badges"  options={{ href: null }} />
      {/* Scanner: in tab bar only for partners (but bar is hidden), hidden for tourists */}
      <Tabs.Screen name="scanner" options={{ href: null }} />
    </Tabs>
  )
}
