import { TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from 'convex/react'
import Svg, { Path, Polygon } from 'react-native-svg'
import { api } from '../convex/_generated/api'
import { ScrollView, Spinner, Text, XStack, YStack } from 'tamagui'

const INK       = '#1A1612'
const INK_MID   = '#6B5E52'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const TEAL      = '#2A8FA0'
const TEAL_BG   = 'rgba(42,143,160,0.09)'
const TEAL_BRD  = 'rgba(42,143,160,0.22)'
const GOLD      = '#C9A84C'
const GOLD_BG   = 'rgba(201,168,76,0.08)'
const GOLD_BRD  = 'rgba(201,168,76,0.22)'
const BORDER    = 'rgba(26,22,18,0.08)'

export default function AdminScreen() {
  const stats = useQuery(api.wallet.getAdminStats)

  if (stats === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} backgroundColor={BG} gap="$3">
        <Spinner size="large" color={TEAL} />
        <Text color={INK_LIGHT} fontSize="$4">Loading dashboard...</Text>
      </YStack>
    )
  }

  const totalLAKECirculated = stats.partners.reduce((sum, p) => sum + p.pendingTokens, 0)
  const activePartners      = stats.partners.filter((p) => p.pendingTokens > 0)
  const inactivePartners    = stats.partners.filter((p) => p.pendingTokens === 0)

  return (
    <YStack style={{ flex: 1, backgroundColor: BG }}>

      {/* ── Header ── */}
      <YStack backgroundColor="#111111" paddingTop="$12" paddingBottom="$5" paddingHorizontal="$5" gap="$1">
        <XStack justifyContent="space-between" style={{ alignItems: 'flex-end' }}>
          <YStack gap="$1">
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase' }}>
              Tourism Office
            </Text>
            <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '400', color: 'white', letterSpacing: -0.5 }}>
              LAKE Overview
            </Text>
          </YStack>
          <Svg width={32} height={32} viewBox="0 0 64 64">
            <Polygon points="32,6 58,54 6,54" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinejoin="round" opacity={0.7} />
            <Path d="M10 50 C10 36 22 28 32 28 C32 28 32 50 10 50Z" fill={GOLD} opacity={0.5} />
          </Svg>
        </XStack>
      </YStack>

      <ScrollView>
        <YStack padding="$4" gap="$4" paddingBottom="$10">

          {/* ── KPI cards ── */}
          <XStack gap="$3">
            <YStack
              flex={1}
              backgroundColor="#111111"
              borderRadius="$5"
              padding="$4"
              gap="$2"
              style={{ borderWidth: 1, borderColor: TEAL_BRD }}
            >
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                In circulation
              </Text>
              <Text style={{ fontFamily: 'Georgia', fontSize: 40, fontWeight: '500', color: TEAL, lineHeight: 44 }}>
                {stats.totalTokensInCirculation}
              </Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                LAKE held by tourists
              </Text>
            </YStack>

            <YStack
              flex={1}
              backgroundColor="#111111"
              borderRadius="$5"
              padding="$4"
              gap="$2"
              style={{ borderWidth: 1, borderColor: GOLD_BRD }}
            >
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Spent at partners
              </Text>
              <Text style={{ fontFamily: 'Georgia', fontSize: 40, fontWeight: '500', color: GOLD, lineHeight: 44 }}>
                {totalLAKECirculated}
              </Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                LAKE through network
              </Text>
            </YStack>
          </XStack>

          {/* ── Active partners ── */}
          {activePartners.length > 0 && (
            <YStack gap="$3">
              <Text style={{ fontSize: 10, fontWeight: '600', color: INK_LIGHT, letterSpacing: 2, textTransform: 'uppercase' }}>
                Partners · LAKE received
              </Text>

              {activePartners.map((partner) => (
                <XStack
                  key={partner._id}
                  backgroundColor="white"
                  borderRadius="$5"
                  borderWidth={1}
                  borderColor={BORDER}
                  padding="$4"
                  style={{
                    alignItems: 'center',
                    shadowColor: INK,
                    shadowOpacity: 0.07,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 4 },
                  }}
                  gap="$3"
                >
                  <YStack flex={1} gap="$1">
                    <Text style={{ fontSize: 16, fontWeight: '700', color: INK }}>{partner.name}</Text>
                    <Text style={{ fontSize: 12, color: INK_LIGHT }}>
                      {partner.type.charAt(0).toUpperCase() + partner.type.slice(1)}
                    </Text>
                  </YStack>
                  <YStack style={{ alignItems: 'flex-end' }} gap="$1">
                    <XStack style={{ alignItems: 'baseline' }} gap="$1">
                      <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '500', color: INK }}>
                        {partner.pendingTokens}
                      </Text>
                      <Text style={{ fontSize: 13, color: INK_LIGHT }}> LAKE</Text>
                    </XStack>
                    <YStack
                      style={{
                        backgroundColor: TEAL_BG,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: TEAL_BRD,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '700', color: TEAL }}>● ACTIVE</Text>
                    </YStack>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          )}

          {/* ── Inactive partners ── */}
          {inactivePartners.length > 0 && (
            <YStack gap="$3">
              <Text style={{ fontSize: 10, fontWeight: '600', color: INK_LIGHT, letterSpacing: 2, textTransform: 'uppercase' }}>
                No activity yet
              </Text>

              {inactivePartners.map((partner) => (
                <XStack
                  key={partner._id}
                  backgroundColor="white"
                  borderRadius="$5"
                  borderWidth={1}
                  borderColor={BORDER}
                  padding="$4"
                  style={{ alignItems: 'center', opacity: 0.5 }}
                  gap="$3"
                >
                  <YStack flex={1} gap="$1">
                    <Text style={{ fontSize: 15, fontWeight: '600', color: INK_MID }}>{partner.name}</Text>
                    <Text style={{ fontSize: 12, color: INK_LIGHT }}>
                      {partner.type.charAt(0).toUpperCase() + partner.type.slice(1)}
                    </Text>
                  </YStack>
                  <Text style={{ fontSize: 13, color: INK_LIGHT, fontWeight: '500' }}>0 LAKE</Text>
                </XStack>
              ))}
            </YStack>
          )}

          {stats.partners.length === 0 && (
            <YStack style={{ alignItems: 'center' }} padding="$8" gap="$3">
              <Text style={{ fontSize: 44 }}>📊</Text>
              <Text style={{ fontSize: 14, color: INK_LIGHT, textAlign: 'center', lineHeight: 20 }}>
                No partner data yet. Tourists need to book offers first.
              </Text>
            </YStack>
          )}

          {/* Gold stat pill */}
          {stats.partners.length > 0 && (
            <XStack
              backgroundColor="white"
              borderRadius="$4"
              borderWidth={1}
              borderColor={GOLD_BRD}
              padding="$4"
              style={{ alignItems: 'center' }}
              gap="$3"
            >
              <YStack flex={1} gap="$1">
                <Text style={{ fontSize: 10, fontWeight: '700', color: INK_LIGHT, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Network coverage
                </Text>
                <Text style={{ fontSize: 14, color: INK_MID }}>
                  {activePartners.length} of {stats.partners.length} partners active
                </Text>
              </YStack>
              <Text style={{ fontFamily: 'Georgia', fontSize: 28, color: GOLD }}>
                {stats.partners.length > 0
                  ? `${Math.round((activePartners.length / stats.partners.length) * 100)}%`
                  : '—'}
              </Text>
            </XStack>
          )}

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={{
              backgroundColor: 'white',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: BORDER,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: INK_LIGHT }}>← Back to home</Text>
          </TouchableOpacity>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
