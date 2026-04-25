import { router } from 'expo-router'
import { TouchableOpacity, View } from 'react-native'
import { useQuery } from 'convex/react'
import Svg, { Line, Path, Polygon, Rect } from 'react-native-svg'
import { api } from '../../convex/_generated/api'
import { ScrollView, Separator, Spinner, Text, XStack, YStack } from 'tamagui'

const GOLD      = '#C9A84C'
const GOLD_BG   = 'rgba(201,168,76,0.08)'
const GOLD_BRD  = 'rgba(201,168,76,0.22)'
const INK       = '#1A1612'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const TEAL      = '#2A8FA0'
const TEAL_BG   = 'rgba(42,143,160,0.09)'
const TEAL_BRD  = 'rgba(42,143,160,0.22)'
const ERROR     = '#B8362A'
const BORDER    = 'rgba(26,22,18,0.07)'

export default function WalletScreen() {
  const user = useQuery(api.wallet.getUser)
  const transactions = useQuery(
    api.wallet.getUserTransactions,
    user ? { userId: user._id } : 'skip'
  )

  if (user === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} backgroundColor={BG} gap="$3">
        <Spinner size="large" color={TEAL} />
        <Text color={INK_LIGHT} fontSize="$4">Loading...</Text>
      </YStack>
    )
  }

  if (user === null) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} padding="$6" gap="$4" backgroundColor={BG}>
        <Text style={{ fontSize: 52 }}>🍃</Text>
        <Text color={INK_LIGHT} style={{ textAlign: 'center' }} fontSize="$4">
          No wallet found. Load demo data from the Discover tab first.
        </Text>
      </YStack>
    )
  }

  const experiences = transactions?.filter((t) => t.tokensEarnedOrSpent < 0).length ?? 0

  return (
    <ScrollView backgroundColor={BG}>
      <YStack paddingTop="$10" paddingBottom="$10" gap="$0">

        {/* ── Page header ── */}
        <YStack paddingHorizontal="$5" paddingBottom="$4" gap="$1">
          <Text fontSize={32} fontWeight="400" color={INK} style={{ letterSpacing: -0.5, lineHeight: 36 }}>
            My Wallet
          </Text>
          <Text color={INK_LIGHT} fontSize="$3">
            Current balance · Gold Status
          </Text>
        </YStack>

        {/* ── Black card ── */}
        <YStack paddingHorizontal="$4" paddingBottom="$3">
          <YStack
            backgroundColor="#111111"
            borderRadius="$7"
            padding="$5"
            gap="$4"
            overflow="hidden"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(201,168,76,0.18)',
              shadowColor: '#000',
              shadowOpacity: 0.4,
              shadowRadius: 30,
              shadowOffset: { width: 0, height: 12 },
            }}
          >
            {/* Gold shimmer line at top */}
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              backgroundColor: 'rgba(201,168,76,0.45)',
            }} />

            {/* Top row: logo + chip */}
            <XStack justifyContent="space-between" style={{ alignItems: 'center' }}>
              <XStack gap="$2" style={{ alignItems: 'center' }}>
                <Svg width={20} height={20} viewBox="0 0 64 64">
                  <Polygon
                    points="32,6 58,54 6,54"
                    fill="none"
                    stroke={GOLD}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    opacity={0.7}
                  />
                  <Path
                    d="M10 50 C10 36 22 28 32 28 C32 28 32 50 10 50Z"
                    fill={GOLD}
                    opacity={0.5}
                  />
                </Svg>
                <Text
                  style={{ fontFamily: 'Georgia', fontSize: 13, fontWeight: '300' }}
                  color="rgba(201,168,76,0.5)"
                >
                  EtherLaken
                </Text>
              </XStack>

              {/* Chip */}
              <Svg width={32} height={22} viewBox="0 0 32 22">
                <Rect
                  width="32" height="22" rx="4"
                  fill="rgba(201,168,76,0.12)"
                  stroke="rgba(201,168,76,0.28)"
                  strokeWidth="0.6"
                />
                <Rect x="2.5" y="7" width="9" height="8" rx="1.5" fill="rgba(201,168,76,0.28)" />
                <Line x1="11.5" y1="11" x2="29" y2="11" stroke="rgba(201,168,76,0.18)" strokeWidth="0.8" />
                <Line x1="7" y1="7" x2="7" y2="15" stroke="rgba(201,168,76,0.18)" strokeWidth="0.8" />
              </Svg>
            </XStack>

            {/* Balance */}
            <XStack style={{ alignItems: 'baseline' }} gap="$2">
              <Text
                style={{
                  fontFamily: 'Georgia',
                  fontSize: 58,
                  fontWeight: '500',
                  color: GOLD,
                  lineHeight: 62,
                  letterSpacing: -1,
                }}
              >
                {user.greenTokensBalance}
              </Text>
              <Text
                style={{
                  fontFamily: 'Georgia',
                  fontSize: 22,
                  fontWeight: '300',
                  color: 'rgba(201,168,76,0.35)',
                  marginLeft: 4,
                }}
              >
                GT
              </Text>
            </XStack>

            {/* Bottom row */}
            <XStack justifyContent="space-between" style={{ alignItems: 'flex-end' }}>
              <YStack gap="$1">
                <Text style={{ fontFamily: 'Georgia', fontSize: 13, color: 'rgba(201,168,76,0.5)' }}>
                  {user.name}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Georgia',
                    fontSize: 10,
                    color: 'rgba(201,168,76,0.22)',
                    letterSpacing: 2,
                  }}
                >
                  EL · 0847 · 26
                </Text>
              </YStack>

              <TouchableOpacity
                onPress={() => router.push('/buy-tokens')}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.09)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.18)',
                  borderRadius: 9999,
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.88)' }}>
                  Buy Tokens
                </Text>
              </TouchableOpacity>
            </XStack>
          </YStack>
        </YStack>

        {/* ── Stat pills ── */}
        <XStack gap="$2" paddingHorizontal="$4" paddingBottom="$4">
          <StatPill
            icon={<LayersIcon />}
            value={`${experiences}`}
            label="Experiences"
          />
          <TouchableOpacity style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: '#111111',
            borderRadius: 9999,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
          }}>
            <Text style={{ fontSize: 14 }}>💳</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#FFFFFF' }} numberOfLines={1}>
              Open in Wallet
            </Text>
          </TouchableOpacity>
          <StatPill
            icon={<AwardIcon color={GOLD} />}
            value="Gold Status"
            gold
          />
        </XStack>

        {/* ── Divider ── */}
        <Separator borderColor={BORDER} marginHorizontal="$4" />

        {/* ── Transactions ── */}
        <YStack paddingHorizontal="$4" paddingTop="$4" paddingBottom="$6" gap="$3">
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              color: INK_LIGHT,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            Recent Transactions
          </Text>

          {transactions === undefined ? (
            <YStack style={{ alignItems: 'center' }} padding="$4">
              <Spinner color={TEAL} />
            </YStack>
          ) : transactions.length === 0 ? (
            <Text color={INK_LIGHT} fontSize="$4" style={{ textAlign: 'center', paddingVertical: 24 }}>
              No transactions yet
            </Text>
          ) : (
            <YStack
              backgroundColor="white"
              borderRadius="$5"
              borderWidth={1}
              borderColor={BORDER}
              overflow="hidden"
            >
              {transactions.map((tx, i) => {
                const isEarned = tx.tokensEarnedOrSpent > 0
                const date = new Date(tx.timestamp).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })

                return (
                  <View key={tx._id}>
                    {i > 0 && (
                      <View style={{ height: 1, backgroundColor: BORDER, marginLeft: 64 }} />
                    )}
                    <XStack
                      paddingHorizontal="$4"
                      paddingVertical="$3"
                      gap="$3"
                      style={{ alignItems: 'center' }}
                    >
                      {/* Circle icon */}
                      <View style={{
                        width: 36, height: 36,
                        borderRadius: 18,
                        backgroundColor: isEarned ? TEAL_BG : 'rgba(184,54,42,0.07)',
                        borderWidth: 1,
                        borderColor: isEarned ? TEAL_BRD : 'rgba(184,54,42,0.15)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Svg width={14} height={14} viewBox="0 0 24 24">
                          {isEarned ? (
                            <Path
                              d="M17 7L7 17M7 17H17M7 17V7"
                              stroke={TEAL}
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          ) : (
                            <Path
                              d="M7 17L17 7M17 7H7M17 7V17"
                              stroke={ERROR}
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          )}
                        </Svg>
                      </View>

                      {/* Label + date */}
                      <YStack flex={1} gap="$1">
                        <Text
                          fontSize="$3"
                          fontWeight="500"
                          color={INK}
                          numberOfLines={1}
                        >
                          {tx.label}
                        </Text>
                        <Text fontSize="$2" color={INK_LIGHT}>
                          {date}
                        </Text>
                      </YStack>

                      {/* Amount */}
                      <Text
                        style={{ fontSize: 13, fontWeight: '500', fontFamily: 'Courier New' }}
                        color={isEarned ? TEAL : ERROR}
                      >
                        {isEarned ? '+' : ''}{tx.tokensEarnedOrSpent} GT
                      </Text>
                    </XStack>
                  </View>
                )
              })}
            </YStack>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}

function StatPill({ icon, value, label, teal, gold }: {
  icon: React.ReactNode
  value: string
  label?: string
  teal?: boolean
  gold?: boolean
}) {
  return (
    <XStack
      flex={1}
      style={{ alignItems: 'center' }}
      gap="$1"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$10"
      borderWidth={1}
      borderColor={gold ? GOLD_BRD : teal ? TEAL_BRD : BORDER}
      backgroundColor={gold ? GOLD_BG : teal ? TEAL_BG : 'white'}
    >
      {icon}
      <Text
        fontSize={14}
        fontWeight="600"
        color={gold ? GOLD : teal ? TEAL : INK}
        numberOfLines={1}
      >
        {value}
      </Text>
      {label && (
        <Text fontSize={14} color={INK_LIGHT} numberOfLines={1}>
          {label}
        </Text>
      )}
    </XStack>
  )
}

function LayersIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24">
      <Path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke={INK_LIGHT}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  )
}


function AwardIcon({ color }: { color: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24">
      <Path
        d="M12 15a7 7 0 100-14 7 7 0 000 14z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <Path
        d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  )
}
