import { router } from 'expo-router'
import {
  TouchableOpacity,
  View,
} from 'react-native'
import { useQuery } from 'convex/react'
import Svg, { Line, Path, Polygon, Rect } from 'react-native-svg'
import { api } from '../../convex/_generated/api'
import { ScrollView, Separator, Spinner, Text, XStack, YStack } from 'tamagui'

const GOLD      = '#C9A84C'
const GOLD_BRD  = 'rgba(201,168,76,0.22)'
const INK       = '#1A1612'
const INK_MID   = '#6B5E52'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const RAISED    = '#F2EEE9'
const TEAL      = '#2A8FA0'
const TEAL_BG   = 'rgba(42,143,160,0.09)'
const TEAL_BRD  = 'rgba(42,143,160,0.22)'
const ERROR     = '#B8362A'
const BORDER    = 'rgba(26,22,18,0.07)'

type Tier = {
  label: string
  symbol: string
  color: string
  glowColor: string
  glowOpacity: number
  bg: string
  border: string
}

function getTier(unlockedCount: number): Tier {
  if (unlockedCount >= 10) return {
    label: 'PLATINUM', symbol: '◈',
    color: '#8899AA', glowColor: '#8899AA', glowOpacity: 0.55,
    bg: 'rgba(136,153,170,0.09)', border: 'rgba(136,153,170,0.22)',
  }
  if (unlockedCount >= 6) return {
    label: 'GOLD', symbol: '✦',
    color: GOLD, glowColor: GOLD, glowOpacity: 0.72,
    bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.22)',
  }
  if (unlockedCount >= 3) return {
    label: 'SILVER', symbol: '◆',
    color: '#7A8A96', glowColor: '#7A8A96', glowOpacity: 0.50,
    bg: 'rgba(122,138,150,0.08)', border: 'rgba(122,138,150,0.22)',
  }
  if (unlockedCount >= 1) return {
    label: 'BRONZE', symbol: '▲',
    color: '#B06830', glowColor: '#B06830', glowOpacity: 0.52,
    bg: 'rgba(176,104,48,0.08)', border: 'rgba(176,104,48,0.22)',
  }
  return {
    label: 'EXPLORER', symbol: '◉',
    color: TEAL, glowColor: TEAL, glowOpacity: 0.45,
    bg: TEAL_BG, border: TEAL_BRD,
  }
}

export default function WalletScreen() {
  const user         = useQuery(api.wallet.getUser)
  const transactions = useQuery(
    api.wallet.getUserTransactions,
    user ? { userId: user._id } : 'skip'
  )
  const badges = useQuery(
    api.wallet.getBadges,
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

  const experiences   = transactions?.filter((t) => t.tokensEarnedOrSpent < 0).length ?? 0
  const unlockedCount = badges?.filter((b) => b.unlocked).length ?? 0
  const tier          = getTier(unlockedCount)

  return (
    <ScrollView backgroundColor={BG}>
      <YStack paddingTop="$10" paddingBottom="$10" gap="$0">

        {/* ── Subtle tier-tinted top wash (barely perceptible) ── */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 280,
          backgroundColor: tier.glowColor, opacity: 0.05,
          pointerEvents: 'none',
        }} />

        {/* ── Page header ── */}
        <YStack paddingHorizontal="$5" paddingBottom="$5" gap="$1">
          <Text fontSize={32} fontWeight="400" color={INK} style={{ letterSpacing: -0.5, lineHeight: 36 }}>
            My Wallet
          </Text>
          <Text color={INK_LIGHT} fontSize="$3">
            LAKE Balance · {tier.label.charAt(0) + tier.label.slice(1).toLowerCase()} Member
          </Text>
        </YStack>

        {/* ── Luxury card — dark on cream background ── */}
        <YStack paddingHorizontal="$4" paddingBottom="$5">
          {/* Outer halo — tier-colored shadow, very visible on light bg */}
          <View style={{
            borderRadius: 28,
            shadowColor: tier.glowColor,
            shadowOpacity: tier.glowOpacity,
            shadowRadius: 72,
            shadowOffset: { width: 0, height: 18 },
            elevation: 32,
            backgroundColor: '#111010',
          }}>
            {/* Inner card */}
            <View style={{
              borderRadius: 26,
              borderWidth: 1,
              borderColor: tier.border,
              overflow: 'hidden',
              backgroundColor: '#111010',
              padding: 22,
            }}>

              {/* Diagonal shimmer */}
              <View style={{
                position: 'absolute', top: -80, right: -40,
                width: 200, height: 260,
                backgroundColor: 'rgba(201,168,76,0.035)',
                transform: [{ rotate: '35deg' }],
              }} />

              {/* Radial glow top-right */}
              <View style={{
                position: 'absolute', top: -50, right: -50,
                width: 200, height: 200, borderRadius: 100,
                backgroundColor: 'rgba(201,168,76,0.06)',
              }} />

              {/* Hairline top */}
              <View style={{
                position: 'absolute', top: 0, left: 32, right: 32, height: 1,
                backgroundColor: GOLD, opacity: 0.50,
              }} />

              {/* Top row: logo + chip */}
              <XStack justifyContent="space-between" style={{ alignItems: 'center', marginBottom: 18 }}>
                <XStack gap="$2" style={{ alignItems: 'center' }}>
                  <Svg width={20} height={20} viewBox="0 0 64 64">
                    <Polygon
                      points="32,6 58,54 6,54"
                      fill="none"
                      stroke={GOLD}
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      opacity={0.85}
                    />
                    <Path
                      d="M10 50 C10 36 22 28 32 28 C32 28 32 50 10 50Z"
                      fill={GOLD}
                      opacity={0.55}
                    />
                  </Svg>
                  <Text style={{ fontFamily: 'Georgia', fontSize: 14, fontWeight: '300', letterSpacing: 1 }}
                    color={GOLD}>
                    EtherLaken
                  </Text>
                </XStack>

                <Svg width={36} height={26} viewBox="0 0 36 26">
                  <Rect width="36" height="26" rx="5"
                    fill="rgba(201,168,76,0.10)"
                    stroke="rgba(201,168,76,0.38)"
                    strokeWidth="0.8"
                  />
                  <Rect x="3" y="8" width="11" height="10" rx="2" fill="rgba(201,168,76,0.28)" />
                  <Line x1="14" y1="13" x2="33" y2="13" stroke="rgba(201,168,76,0.20)" strokeWidth="0.9" />
                  <Line x1="8.5" y1="8" x2="8.5" y2="18" stroke="rgba(201,168,76,0.20)" strokeWidth="0.9" />
                </Svg>
              </XStack>

              {/* Balance */}
              <XStack style={{ alignItems: 'baseline', marginBottom: 4 }} gap={6}>
                <Text style={{
                  fontFamily: 'Georgia', fontSize: 62, fontWeight: '500',
                  color: GOLD, lineHeight: 66, letterSpacing: -2,
                }}>
                  {user.greenTokensBalance}
                </Text>
                <Text style={{
                  fontFamily: 'Georgia', fontSize: 20, fontWeight: '300',
                  color: 'rgba(201,168,76,0.38)', marginLeft: 2, letterSpacing: 1,
                }}>
                  LAKE
                </Text>
              </XStack>

              {/* Separator */}
              <View style={{ height: 1, backgroundColor: 'rgba(201,168,76,0.10)', marginBottom: 16 }} />

              {/* Bottom row */}
              <XStack justifyContent="space-between" style={{ alignItems: 'flex-end' }}>
                <YStack gap={3}>
                  <Text style={{ fontFamily: 'Georgia', fontSize: 14, color: 'rgba(201,168,76,0.62)', letterSpacing: 0.3 }}>
                    {user.name}
                  </Text>
                  <Text style={{ fontSize: 9, color: 'rgba(201,168,76,0.26)', letterSpacing: 3, fontWeight: '500' }}>
                    EL · 0847 · 26
                  </Text>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4,
                    backgroundColor: tier.bg,
                    borderWidth: 1, borderColor: tier.border,
                    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
                    alignSelf: 'flex-start',
                  }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: tier.color, letterSpacing: 1.5 }}>
                      {tier.symbol} {tier.label} MEMBER
                    </Text>
                  </View>
                </YStack>

                <TouchableOpacity
                  onPress={() => router.push('/buy-tokens')}
                  style={{
                    backgroundColor: tier.color,
                    borderRadius: 9999,
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    shadowColor: tier.glowColor,
                    shadowOpacity: 0.42,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 3 },
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#111010', letterSpacing: 0.5 }}>
                    Buy LAKE
                  </Text>
                </TouchableOpacity>
              </XStack>

              {/* Hairline bottom */}
              <View style={{
                position: 'absolute', bottom: 0, left: 32, right: 32, height: 1,
                backgroundColor: GOLD, opacity: 0.18,
              }} />
            </View>
          </View>
        </YStack>

        {/* ── Stat pills — matches app light theme ── */}
        <XStack gap="$2" paddingHorizontal="$4" paddingBottom="$4">
          <StatPill
            icon={<LayersIcon />}
            value={`${experiences}`}
            label="Exp."
          />
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: INK,
              borderRadius: 9999,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}>
            <Text style={{ fontSize: 14 }}>💳</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#FFFFFF' }} numberOfLines={1}>
              Open Wallet
            </Text>
          </TouchableOpacity>
          <StatPill
            icon={<AwardIcon color={tier.color} />}
            value={`${tier.label.charAt(0) + tier.label.slice(1).toLowerCase()} · ${unlockedCount}/${badges?.length ?? 12}`}
            tierColor={tier.color}
            tierBg={tier.bg}
            tierBorder={tier.border}
          />
        </XStack>

        {/* ── Divider ── */}
        <Separator borderColor={BORDER} marginHorizontal="$4" />

        {/* ── Transactions ── */}
        <YStack paddingHorizontal="$4" paddingTop="$4" paddingBottom="$6" gap="$3">
          <Text style={{
            fontSize: 10, fontWeight: '600',
            color: INK_LIGHT, letterSpacing: 2, textTransform: 'uppercase',
          }}>
            Recent transactions
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
                  day: 'numeric', month: 'short',
                })
                return (
                  <View key={tx._id}>
                    {i > 0 && (
                      <View style={{ height: 1, backgroundColor: BORDER, marginLeft: 64 }} />
                    )}
                    <XStack paddingHorizontal="$4" paddingVertical="$3" gap="$3" style={{ alignItems: 'center' }}>
                      {/* Icon */}
                      <View style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: isEarned ? TEAL_BG : 'rgba(184,54,42,0.07)',
                        borderWidth: 1,
                        borderColor: isEarned ? TEAL_BRD : 'rgba(184,54,42,0.15)',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Svg width={14} height={14} viewBox="0 0 24 24">
                          {isEarned ? (
                            <Path d="M17 7L7 17M7 17H17M7 17V7" stroke={TEAL} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          ) : (
                            <Path d="M7 17L17 7M17 7H7M17 7V17" stroke={ERROR} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          )}
                        </Svg>
                      </View>

                      {/* Label + date */}
                      <YStack flex={1} gap="$1">
                        <Text fontSize="$3" fontWeight="500" color={INK} numberOfLines={1}>
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
                        {isEarned ? '+' : ''}{tx.tokensEarnedOrSpent} LAKE
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

function StatPill({ icon, value, label, tierColor, tierBg, tierBorder }: {
  icon: React.ReactNode
  value: string
  label?: string
  tierColor?: string
  tierBg?: string
  tierBorder?: string
}) {
  const isTier = !!tierColor
  return (
    <XStack
      flex={1}
      style={{ alignItems: 'center' }}
      gap="$1"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$10"
      borderWidth={1}
      borderColor={isTier ? (tierBorder ?? GOLD_BRD) : BORDER}
      backgroundColor={isTier ? (tierBg ?? 'rgba(201,168,76,0.08)') : 'white'}
    >
      {icon}
      <Text
        fontSize={11}
        fontWeight="600"
        color={isTier ? (tierColor ?? GOLD) : INK}
        numberOfLines={1}
      >
        {value}
      </Text>
      {label && (
        <Text fontSize={11} color={INK_LIGHT} numberOfLines={1}>
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

