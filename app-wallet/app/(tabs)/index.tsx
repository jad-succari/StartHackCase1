import { Image, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { useMutation, useQuery } from 'convex/react'
import { Redirect, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../../convex/_generated/api'
import { getRole } from '../../lib/roleStore'
import {
  Button,
  H2,
  Paragraph,
  ScrollView,
  Spinner,
  Text,
  XStack,
  YStack,
} from 'tamagui'

// EtherLaken palette
const TEAL      = '#2A8FA0'
const TEAL_BG   = 'rgba(42,143,160,0.09)'
const TEAL_BRD  = 'rgba(42,143,160,0.22)'
const INK       = '#1A1612'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'

const HERO_URI    = 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80'
const FALLBACK_URI = 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80'

export default function WalletScreen() {
  const { top } = useSafeAreaInsets()
  const user = useQuery(api.wallet.getUser)
  const offers = useQuery(api.wallet.getOffers)
  const populateData = useMutation(api.seed.populateData)
  const resetOffers = useMutation(api.seed.resetOffers)

  if (getRole() === 'partner') return <Redirect href="/(tabs)/scanner" />

  if (user === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} backgroundColor={BG} gap="$3">
        <Spinner size="large" color={TEAL} />
        <Text color={INK_LIGHT}>Loading...</Text>
      </YStack>
    )
  }

  if (user === null) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} padding="$6" gap="$5" backgroundColor={BG}>
        <Text style={{ fontSize: 64 }}>🏔️</Text>
        <YStack gap="$2" style={{ alignItems: 'center' }}>
          <H2 style={{ textAlign: 'center' }} color={INK}>JungfrauWallet</H2>
          <Paragraph style={{ textAlign: 'center' }} color={INK_LIGHT}>
            Start by loading the demo data to explore the sustainable tourism experience.
          </Paragraph>
        </YStack>
        <Button size="$5" backgroundColor={TEAL} borderRadius="$4" width="100%" onPress={() => void populateData({})}>
          <Text color="white" fontWeight="bold" fontSize="$4">Load test data</Text>
        </Button>
      </YStack>
    )
  }

  return (
    <YStack style={{ flex: 1 }} backgroundColor={BG}>

      {/* ── Hero ── */}
      <View style={{ height: 300, position: 'relative', overflow: 'hidden' }}>
        <Image
          source={{ uri: HERO_URI }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        {/* Dark scrim at top for pill readability */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 110,
          backgroundColor: 'rgba(0,0,0,0.32)',
        }} />

        {/* Glass pills row */}
        <View style={{
          position: 'absolute', top: top + 8, left: 16, right: 16,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {/* "Hi, [Name]" pill */}
          <BlurView
            intensity={55}
            tint="dark"
            style={{
              borderRadius: 999, overflow: 'hidden',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
            }}
          >
            <XStack paddingHorizontal={18} paddingVertical={10} style={{ alignItems: 'center' }} gap={8}>
              <Text color="white" fontSize="$4">🏔️</Text>
              <Text color="white" fontSize="$3" fontWeight="500">
                Hi, {user.name.split(' ')[0]}
              </Text>
            </XStack>
          </BlurView>

          {/* GT balance pill */}
          <BlurView
            intensity={60}
            tint="dark"
            style={{
              borderRadius: 999, overflow: 'hidden',
              backgroundColor: 'rgba(42,143,160,0.75)',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
            }}
          >
            <XStack paddingHorizontal={14} paddingVertical={9} style={{ alignItems: 'center' }} gap={6}>
              <Text color="white" fontSize="$2">🍃</Text>
              <Text color="white" fontSize="$3" fontWeight="700">
                {user.greenTokensBalance} GT
              </Text>
            </XStack>
          </BlurView>
        </View>

        {/* Region label */}
        <View style={{ position: 'absolute', bottom: 20, left: 18 }}>
          <Text color={INK_LIGHT} fontSize="$1" fontWeight="600" style={{ letterSpacing: 1 }}>
            JUNGFRAU REGION · SWITZERLAND
          </Text>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView>
        <YStack padding="$4" gap="$4" paddingBottom="$8">

          {/* Section header */}
          <XStack justifyContent="space-between" style={{ alignItems: 'baseline' }}>
            <H2 fontSize="$6" color={INK}>Available Offers</H2>
            {offers !== undefined && (
              <Text fontSize="$2" color={TEAL} fontWeight="600">
                {offers.length} offer{offers.length !== 1 ? 's' : ''}
              </Text>
            )}
          </XStack>

          {/* Offer list */}
          {offers === undefined ? (
            <YStack style={{ alignItems: 'center' }} padding="$4">
              <Spinner color={TEAL} />
            </YStack>
          ) : offers.length === 0 ? (
            <YStack gap="$3" style={{ alignItems: 'center' }} paddingVertical="$4">
              <Text color={INK_LIGHT}>No offers available at the moment.</Text>
              <Button size="$3" backgroundColor={TEAL} borderRadius="$4" onPress={() => void resetOffers({})}>
                <Text color="white" fontWeight="600" fontSize="$2">Load offers</Text>
              </Button>
            </YStack>
          ) : (
            <YStack gap="$3">
              {offers.map((offer) => (
                <OfferRow
                  key={offer._id}
                  offer={offer}
                  onBook={() =>
                    router.push({ pathname: '/book-offer', params: { offerId: offer._id } })
                  }
                />
              ))}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}

type OfferRowProps = {
  offer: {
    title: string
    description: string
    tokenCost: number
    imageUrl?: string | null
    originalPriceCHF?: number | null
    discountPercentage?: number | null
  }
  onBook: () => void
}

function OfferRow({ offer, onBook }: OfferRowProps) {
  const imgUri = offer.imageUrl || FALLBACK_URI

  return (
    <View style={{
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(26,22,18,0.07)',
      backgroundColor: 'white',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    }}>
      <View style={{ flexDirection: 'row' }}>
        {/* Square thumbnail */}
        <Image
          source={{ uri: imgUri }}
          style={{ width: 90, height: 110 }}
          resizeMode="cover"
        />

        {/* Content */}
        <YStack flex={1} padding="$3" gap="$2" justifyContent="space-between">
          <YStack gap="$1">
            <Text fontWeight="700" fontSize="$4" color={INK} numberOfLines={1}>
              {offer.title}
            </Text>
            <Text fontSize="$2" color={INK_LIGHT} numberOfLines={2}>
              {offer.description}
            </Text>
            {offer.originalPriceCHF != null && (
              <Text fontSize="$1" color={INK_LIGHT}>
                Original: {offer.originalPriceCHF} CHF
              </Text>
            )}
            {offer.discountPercentage != null && offer.discountPercentage > 0 && (
              <Text fontSize="$1" color={TEAL} fontWeight="600">
                −{offer.discountPercentage}% discount
              </Text>
            )}
          </YStack>

          <XStack justifyContent="space-between" style={{ alignItems: 'center' }}>
            {/* Token cost badge */}
            <YStack
              backgroundColor={TEAL_BG}
              borderRadius="$2"
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderWidth={1}
              borderColor={TEAL_BRD}
              style={{ alignItems: 'center' }}
            >
              <Text fontSize="$2" fontWeight="700" color={TEAL}>
                {offer.tokenCost} GT
              </Text>
              <Text fontSize="$1" color={INK_LIGHT}>
                {(offer.tokenCost - 0.01).toFixed(2)} CHF
              </Text>
            </YStack>

            {/* Book button */}
            <Button
              size="$2"
              backgroundColor={TEAL}
              borderRadius="$3"
              onPress={onBook}
            >
              <Text color="white" fontWeight="600" fontSize="$2">Book</Text>
            </Button>
          </XStack>
        </YStack>
      </View>
    </View>
  )
}
