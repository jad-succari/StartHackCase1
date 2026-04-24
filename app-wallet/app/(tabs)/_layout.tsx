import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Wallet' }} />
      <Tabs.Screen name="map" options={{ title: 'Carte' }} />
    </Tabs>
  )
}
