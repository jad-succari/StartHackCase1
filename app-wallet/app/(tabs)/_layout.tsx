import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Mon Wallet' }} />
      <Tabs.Screen name="tickets" options={{ title: 'Mes Billets' }} />
      <Tabs.Screen name="map" options={{ title: 'Carte Interactive' }} />
    </Tabs>
  )
}
