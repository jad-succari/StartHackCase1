import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'My Wallet' }} />
      <Tabs.Screen name="tickets" options={{ title: 'My Tickets' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="scanner" options={{ title: 'Scanner' }} />
    </Tabs>
  )
}
