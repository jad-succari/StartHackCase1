import { Image, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { useMutation, useQuery } from 'convex/react'
import { Redirect, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'
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

const TEAL      = '#2A8FA0'
const TEAL_BG   = 'rgba(42,143,160,0.09)'
const TEAL_BRD  = 'rgba(42,143,160,0.22)'
const INK       = '#1A1612'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'

const HERO_URI = 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80'

const CATEGORY_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Ski', value: 'ski' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Transport', value: 'transport' },
  { label: 'Activity', value: 'activity' },
]

export default function DiscoverScreen() {
  const { top } = useSafeAreaInsets()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const user = useQuery(api.wallet.getUser)
  const offers = useQuery(api.wallet.getOffers)
  const populateData = useMutation(api.seed.populateData)

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

  // Filter offers by category
  const filteredOffers = offers === undefined
    ? undefined
    : selectedCategory === 'all'
    ? offers
    : offers.filter(o => (o as any).partnerType === selectedCategory)

  return (
    <YStack style={{ flex: 1 }} backgroundColor={BG}>

      {/* ── Hero ── */}
      <View style={{ height: 300, position: 'relative', overflow: 'hidden' }}>
        <Image
          source={{ uri: HERO_URI }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 110,
          backgroundColor: 'rgba(0,0,0,0.32)',
        }} />

        <View style={{
          position: 'absolute', top: top + 8, left: 16, right: 16,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        }}>
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

        <View style={{ position: 'absolute', bottom: 20, left: 18 }}>
          <Text color={INK_LIGHT} fontSize={16} fontWeight="600" style={{ letterSpacing: 1 }}>
            JUNGFRAU REGION · SWITZERLAND
          </Text>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$4" paddingBottom="$8">

          {/* Category Filter Pills */}
          {offers !== undefined && offers.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
              <XStack paddingHorizontal="$4" gap="$2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <CategoryPill
                    key={cat.value}
                    label={cat.label}
                    isActive={selectedCategory === cat.value}
                    onPress={() => setSelectedCategory(cat.value)}
                  />
                ))}
              </XStack>
            </ScrollView>
          )}

          {/* Section header */}
          <XStack justifyContent="space-between" style={{ alignItems: 'baseline' }}>
            <H2 fontSize="$6" color={INK}>Available Offers</H2>
            {filteredOffers !== undefined && (
              <Text fontSize={16} color={TEAL} fontWeight="600">
                {filteredOffers.length} offer{filteredOffers.length !== 1 ? 's' : ''}
              </Text>
            )}
          </XStack>

          {/* Offer list */}
          {filteredOffers === undefined ? (
            <YStack style={{ alignItems: 'center' }} padding="$4">
              <Spinner color={TEAL} />
            </YStack>
          ) : filteredOffers.length === 0 ? (
            <YStack gap="$3" style={{ alignItems: 'center' }} paddingVertical="$4">
              <Text color={INK_LIGHT}>No offers available in this category.</Text>
            </YStack>
          ) : (
            <YStack gap="$3">
              {filteredOffers.map((offer) => (
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

type CategoryPillProps = {
  label: string
  isActive: boolean
  onPress: () => void
}

function CategoryPill({ label, isActive, onPress }: CategoryPillProps) {
  return (
    <Button
      size="$3"
      backgroundColor={isActive ? TEAL : 'white'}
      borderRadius="$4"
      borderWidth={1}
      borderColor={isActive ? TEAL : TEAL_BRD}
      onPress={onPress}
      paddingHorizontal="$4"
    >
      <Text color={isActive ? 'white' : INK} fontWeight="600" fontSize={13}>
        {label}
      </Text>
    </Button>
  )
}

type OfferRowProps = {
  offer: {
    _id: string
    title: string
    description: string
    tokenCost: number
    originalPriceCHF?: number | null
    discountPercentage?: number | null
    partnerName?: string
    partnerVillage?: string
  }
  onBook: () => void
}

function OfferRow({ offer, onBook }: OfferRowProps) {
  return (
    <View style={{
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(26,22,18,0.07)',
      backgroundColor: 'white',
      overflow: 'hidden',
      padding: 14,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    }}>
      <YStack gap="$2">
        {/* Partner name */}
        <Text fontSize={12} color={INK_LIGHT} fontWeight="600" style={{ textTransform: 'uppercase' }}>
          {offer.partnerName || 'Partner'}
        </Text>

        {/* Title */}
        <Text fontWeight="700" fontSize={17} color={INK} numberOfLines={2}>
          {offer.title}
        </Text>

        {/* Description */}
        <Text fontSize={14} color={INK_LIGHT} numberOfLines={2}>
          {offer.description}
        </Text>

        {/* Location */}
        {offer.partnerVillage && (
          <Text fontSize={13} color={TEAL} fontWeight="500">
            📍 {offer.partnerVillage}
          </Text>
        )}

        {/* Pricing row */}
        <XStack gap="$2" alignItems="center" marginTop="$2">
          {offer.originalPriceCHF != null && (
            <Text fontSize={13} color={INK_LIGHT} style={{ textDecorationLine: 'line-through' }}>
              {offer.originalPriceCHF} CHF
            </Text>
          )}
          <Text fontSize={14} fontWeight="700" color={TEAL}>
            {offer.tokenCost} GT
          </Text>
        </XStack>

        {/* Discount + Book button row */}
        <XStack justifyContent="space-between" alignItems="center" marginTop="$2" gap="$2">
          {offer.discountPercentage != null && offer.discountPercentage > 0 && (
            <Text fontSize={14} fontWeight="700" color={TEAL}>
              −{offer.discountPercentage}%
            </Text>
          )}
          <Button
            size="$4"
            backgroundColor={TEAL}
            borderRadius="$4"
            onPress={onBook}
            flex={1}
            paddingHorizontal="$5"
          >
            <Text color="white" fontWeight="700" fontSize={14}>Book now</Text>
          </Button>
        </XStack>
      </YStack>
    </View>
  )
}
