import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { Stack } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../tamagui.config'

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL ?? '')

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <Stack screenOptions={{ headerShown: false }} />
      </TamaguiProvider>
    </ConvexProvider>
  )
}
