import { useWindowDimensions } from 'react-native'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ScrollView, Spinner, Text, XStack, YStack } from 'tamagui'

const TEAL      = '#2A8FA0'
const TEAL_BG   = 'rgba(42,143,160,0.06)'
const TEAL_BRD  = 'rgba(42,143,160,0.35)'
const INK       = '#1A1612'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const BORDER    = 'rgba(26,22,18,0.08)'

type Badge = {
  id: string
  emoji: string
  title: string
  desc: string
  unlocked: boolean
}

export default function BadgesScreen() {
  const user   = useQuery(api.wallet.getUser)
  const badges = useQuery(
    api.wallet.getBadges,
    user ? { userId: user._id } : 'skip'
  )

  if (user === undefined || badges === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} backgroundColor={BG} gap="$3">
        <Spinner size="large" color={TEAL} />
        <Text color={INK_LIGHT} fontSize="$4">Loading...</Text>
      </YStack>
    )
  }

  const unlockedCount = badges.filter(b => b.unlocked).length

  return (
    <ScrollView backgroundColor={BG}>
      <YStack padding="$4" paddingTop="$10" paddingBottom="$10" gap="$4">

        <YStack gap="$1" paddingBottom="$1">
          <Text fontSize={32} fontWeight="400" color={INK} style={{ letterSpacing: -0.5, lineHeight: 36 }}>
            My Badges
          </Text>
          <Text color={INK_LIGHT} fontSize="$3">
            {unlockedCount} / {badges.length} unlocked
          </Text>
        </YStack>

        <XStack flexWrap="wrap" gap="$3">
          {badges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </XStack>

      </YStack>
    </ScrollView>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  const { width } = useWindowDimensions()
  const cardWidth = (width - 48) / 2

  return (
    <YStack
      width={cardWidth}
      backgroundColor={badge.unlocked ? TEAL_BG : 'white'}
      borderRadius="$6"
      borderWidth={1}
      borderColor={badge.unlocked ? TEAL_BRD : BORDER}
      overflow="hidden"
      opacity={badge.unlocked ? 1 : 0.5}
      style={{
        shadowColor: '#1A1612',
        shadowOpacity: badge.unlocked ? 0.08 : 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <YStack padding="$3" gap="$2" style={{ alignItems: 'center' }}>

        <Text style={{ fontSize: 48, lineHeight: 58, textAlign: 'center' }}>
          {badge.emoji}
        </Text>

        <YStack gap="$1" style={{ alignItems: 'center' }}>
          <Text
            fontWeight="700"
            fontSize={14}
            color={INK}
            style={{ textAlign: 'center', lineHeight: 18 }}
          >
            {badge.title}
          </Text>
          <Text
            fontSize={12}
            color={INK_LIGHT}
            style={{ textAlign: 'center', lineHeight: 16 }}
          >
            {badge.desc}
          </Text>
        </YStack>

        {/* Status pill */}
        <XStack
          borderRadius={9999}
          paddingHorizontal="$2"
          paddingVertical={4}
          backgroundColor={badge.unlocked ? TEAL : 'rgba(26,22,18,0.07)'}
          gap="$1"
          style={{ alignItems: 'center' }}
        >
          <Text style={{ fontSize: 10, color: badge.unlocked ? 'white' : INK_LIGHT }}>
            {badge.unlocked ? '✓' : '🔒'}
          </Text>
          <Text
            fontSize={10}
            fontWeight="700"
            color={badge.unlocked ? 'white' : INK_LIGHT}
            style={{ letterSpacing: 0.8 }}
          >
            {badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
          </Text>
        </XStack>

      </YStack>
    </YStack>
  )
}
