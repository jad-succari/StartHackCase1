import { useState } from 'react'
import { Alert, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useMutation, useQuery } from 'convex/react'
import Svg, { Path, Polygon } from 'react-native-svg'
import { api } from '../convex/_generated/api'
import type { Id } from '../convex/_generated/dataModel'
import { ScrollView, Separator, Spinner, Text, XStack, YStack } from 'tamagui'

const INK       = '#1A1612'
const INK_MID   = '#6B5E52'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const TEAL      = '#2A8FA0'
const TEAL_BG   = 'rgba(42,143,160,0.09)'
const TEAL_BRD  = 'rgba(42,143,160,0.22)'
const GOLD      = '#C9A84C'
const GOLD_BRD  = 'rgba(201,168,76,0.22)'
const BORDER    = 'rgba(26,22,18,0.08)'

export default function AdminScreen() {
  const stats = useQuery(api.wallet.getAdminStats)
  const settlePartnerAccount = useMutation(api.wallet.settlePartnerAccount)
  const [confirmingId, setConfirmingId] = useState<Id<'partners'> | null>(null)
  const [settlingId, setSettlingId] = useState<Id<'partners'> | null>(null)

  const doSettle = async (partnerId: Id<'partners'>) => {
    setConfirmingId(null)
    setSettlingId(partnerId)
    try {
      await settlePartnerAccount({ partnerId })
    } catch (err) {
      console.error('Settle error:', err)
      Alert.alert('Error', (err as Error).message)
    } finally {
      setSettlingId(null)
    }
  }

  if (stats === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} backgroundColor={BG} gap="$3">
        <Spinner size="large" color={TEAL} />
        <Text color={INK_LIGHT} fontSize="$4">Loading dashboard...</Text>
      </YStack>
    )
  }

  const partnersWithBalance = stats.partners.filter((p) => p.pendingTokens > 0)
  const partnersSettled     = stats.partners.filter((p) => p.pendingTokens === 0)
  const totalPendingCHF     = stats.partners.reduce((sum, p) => sum + p.pendingTokens, 0)

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
              Admin Dashboard
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
            {/* Tokens in circulation */}
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
                GT across all tourists
              </Text>
            </YStack>

            {/* Pending payouts */}
            <YStack
              flex={1}
              backgroundColor="#111111"
              borderRadius="$5"
              padding="$4"
              gap="$2"
              style={{ borderWidth: 1, borderColor: GOLD_BRD }}
            >
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Pending payouts
              </Text>
              <Text style={{ fontFamily: 'Georgia', fontSize: 40, fontWeight: '500', color: GOLD, lineHeight: 44 }}>
                {totalPendingCHF.toFixed(0)}
              </Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                CHF to transfer
              </Text>
            </YStack>
          </XStack>

          {/* ── Partners to pay ── */}
          {partnersWithBalance.length > 0 && (
            <YStack gap="$3">
              <XStack style={{ alignItems: 'center' }} gap="$2">
                <Text style={{ fontSize: 10, fontWeight: '600', color: INK_LIGHT, letterSpacing: 2, textTransform: 'uppercase' }}>
                  Partners to pay
                </Text>
                <View style={{
                  backgroundColor: GOLD,
                  borderRadius: 9999,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: 'white' }}>
                    {partnersWithBalance.length}
                  </Text>
                </View>
              </XStack>

              {partnersWithBalance.map((partner) => {
                const isConfirming = confirmingId === partner._id
                const isSettling   = settlingId   === partner._id

                return (
                  <YStack
                    key={partner._id}
                    backgroundColor="white"
                    borderRadius="$5"
                    borderWidth={1}
                    borderColor={BORDER}
                    overflow="hidden"
                    style={{
                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 2 },
                    }}
                  >
                    <XStack padding="$4" gap="$3" style={{ alignItems: 'center' }}>
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
                          <Text style={{ fontSize: 13, color: INK_LIGHT }}> GT</Text>
                        </XStack>
                        <Text style={{ fontSize: 12, color: GOLD, fontWeight: '600' }}>
                          {partner.pendingTokens.toFixed(2)} CHF owed
                        </Text>
                      </YStack>
                    </XStack>

                    <View style={{ height: 1, backgroundColor: BORDER, marginHorizontal: 16 }} />

                    <YStack padding="$4" paddingTop="$3" gap="$2">
                      {!isConfirming && !isSettling && (
                        <TouchableOpacity
                          onPress={() => setConfirmingId(partner._id)}
                          style={{
                            backgroundColor: TEAL,
                            borderRadius: 12,
                            paddingVertical: 13,
                            alignItems: 'center',
                            shadowColor: TEAL,
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 3 },
                          }}
                        >
                          <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                            💸  Pay {partner.pendingTokens.toFixed(2)} CHF
                          </Text>
                        </TouchableOpacity>
                      )}

                      {isConfirming && (
                        <YStack gap="$2">
                          <Text style={{ fontSize: 13, color: INK_LIGHT, textAlign: 'center' }}>
                            Transfer {partner.pendingTokens.toFixed(2)} CHF to {partner.name}?
                          </Text>
                          <XStack gap="$2">
                            <TouchableOpacity
                              onPress={() => setConfirmingId(null)}
                              style={{
                                flex: 1,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: BORDER,
                                backgroundColor: 'white',
                                paddingVertical: 12,
                                alignItems: 'center',
                              }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: '600', color: INK_LIGHT }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => void doSettle(partner._id)}
                              style={{
                                flex: 1,
                                borderRadius: 10,
                                backgroundColor: TEAL,
                                paddingVertical: 12,
                                alignItems: 'center',
                              }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>Confirm</Text>
                            </TouchableOpacity>
                          </XStack>
                        </YStack>
                      )}

                      {isSettling && (
                        <YStack style={{ alignItems: 'center' }} padding="$2" gap="$2">
                          <Spinner size="small" color={TEAL} />
                          <Text style={{ fontSize: 12, color: INK_LIGHT }}>Processing transfer...</Text>
                        </YStack>
                      )}
                    </YStack>
                  </YStack>
                )
              })}
            </YStack>
          )}

          {/* ── Settled partners ── */}
          {partnersSettled.length > 0 && (
            <YStack gap="$3">
              <Separator borderColor={BORDER} />
              <Text style={{ fontSize: 10, fontWeight: '600', color: INK_LIGHT, letterSpacing: 2, textTransform: 'uppercase' }}>
                Settled partners
              </Text>

              {partnersSettled.map((partner) => (
                <XStack
                  key={partner._id}
                  backgroundColor="white"
                  borderRadius="$5"
                  borderWidth={1}
                  borderColor={BORDER}
                  padding="$4"
                  style={{ alignItems: 'center', opacity: 0.6 }}
                  gap="$3"
                >
                  <YStack flex={1} gap="$1">
                    <Text style={{ fontSize: 15, fontWeight: '600', color: INK_MID }}>{partner.name}</Text>
                    <Text style={{ fontSize: 12, color: INK_LIGHT }}>
                      {partner.type.charAt(0).toUpperCase() + partner.type.slice(1)}
                    </Text>
                  </YStack>
                  <View style={{
                    backgroundColor: TEAL_BG,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: TEAL_BRD,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: TEAL }}>✓ SETTLED</Text>
                  </View>
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
