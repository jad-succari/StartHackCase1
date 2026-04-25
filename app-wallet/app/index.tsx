import { TouchableOpacity, View } from 'react-native'
import { useQuery } from 'convex/react'
import { Redirect, router } from 'expo-router'
import Svg, { Path, Polygon } from 'react-native-svg'
import { Spinner, Text, YStack } from 'tamagui'
import { api } from '../convex/_generated/api'
import { setRole } from '../lib/roleStore'

const INK       = '#1A1612'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const TEAL      = '#2A8FA0'
const GOLD      = '#C9A84C'
const BORDER    = 'rgba(26,22,18,0.10)'

export default function RoleSelector() {
  const user = useQuery(api.wallet.getUser)

  if (user === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} backgroundColor={BG}>
        <Spinner size="large" color={TEAL} />
      </YStack>
    )
  }

  if (user === null) {
    return <Redirect href="/onboarding" />
  }

  return (
    <YStack style={{ flex: 1, backgroundColor: BG }}>

      {/* ── Hero header ── */}
      <YStack
        backgroundColor="#111111"
        paddingTop="$14"
        paddingBottom="$8"
        paddingHorizontal="$6"
        gap="$3"
        style={{ alignItems: 'center' }}
      >
        {/* EtherLaken logo */}
        <Svg width={48} height={48} viewBox="0 0 64 64">
          <Polygon
            points="32,6 58,54 6,54"
            fill="none"
            stroke={GOLD}
            strokeWidth="2.5"
            strokeLinejoin="round"
            opacity={0.8}
          />
          <Path
            d="M10 50 C10 36 22 28 32 28 C32 28 32 50 10 50Z"
            fill={GOLD}
            opacity={0.55}
          />
        </Svg>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '400', color: GOLD, letterSpacing: 1 }}>
            EtherLaken
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Sustainable Tourism · Jungfrau
          </Text>
        </View>
      </YStack>

      {/* ── Role buttons ── */}
      <YStack style={{ flex: 1, justifyContent: 'center' }} padding="$5" gap="$3">
        <Text style={{
          fontSize: 10, fontWeight: '600', color: INK_LIGHT,
          letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', marginBottom: 4,
        }}>
          Select your profile
        </Text>

        {/* Tourist */}
        <TouchableOpacity
          onPress={() => { setRole('tourist'); router.replace('/(tabs)') }}
          style={{
            backgroundColor: TEAL,
            borderRadius: 16,
            paddingVertical: 20,
            paddingHorizontal: 24,
            gap: 4,
            alignItems: 'center',
            shadowColor: TEAL,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <Text style={{ fontSize: 22 }}>🧳</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>
            Continue as Tourist
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
            Browse offers · Book tickets · Earn tokens
          </Text>
        </TouchableOpacity>

        {/* Partner */}
        <TouchableOpacity
          onPress={() => { setRole('partner'); router.replace('/(tabs)') }}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: INK,
            paddingVertical: 20,
            paddingHorizontal: 24,
            gap: 4,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>🤝</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: INK }}>
            Continue as Partner
          </Text>
          <Text style={{ fontSize: 12, color: INK_LIGHT }}>
            Validate tickets · Scanner mode
          </Text>
        </TouchableOpacity>

        {/* Admin / Tourism Office */}
        <TouchableOpacity
          onPress={() => router.push('/admin')}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: BORDER,
            paddingVertical: 20,
            paddingHorizontal: 24,
            gap: 4,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>🏛️</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: INK }}>
            Tourism Office
          </Text>
          <Text style={{ fontSize: 12, color: INK_LIGHT }}>
            Dashboard · Partner settlements · KPIs
          </Text>
        </TouchableOpacity>
      </YStack>

      <Text style={{ textAlign: 'center', fontSize: 11, color: INK_LIGHT, paddingBottom: 24 }}>
        Demo mode · StartHack Interlaken 2026
      </Text>
    </YStack>
  )
}
