import { useRef, useState } from 'react'
import { Animated, Image, View, Pressable, ScrollView as RNScrollView, TouchableOpacity } from 'react-native'
import { BlurView } from 'expo-blur'
import { useMutation, useQuery } from 'convex/react'
import { Redirect, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../../convex/_generated/api'
import { getRole } from '../../lib/roleStore'
import {
  Button,
  H2,
  Spinner,
  Text,
  XStack,
  YStack,
} from 'tamagui'

const TEAL      = '#2A8FA0'
const INK       = '#1A1612'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'

const HERO_URI = 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80'

const CAT_COLOR: Record<string, string> = {
  Transport: '#2A8FA0',
  Ski:       '#3B82F6',
  Restaurant:'#D97706',
  Activity:  '#3DAA72',
}

const CAT_IMAGE: Record<string, string> = {
  Transport: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&q=80',
  Ski:       'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=700&q=80',
  Restaurant:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80',
  Activity:  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&q=80',
}

const CAT_EMOJI: Record<string, string> = {
  Transport: '🚡',
  Ski:       '🎿',
  Restaurant:'🍽️',
  Activity:  '🏔️',
}

const CATEGORIES = [
  { key: 'All',        emoji: '' },
  { key: 'Ski',        emoji: '🎿 ' },
  { key: 'Restaurant', emoji: '🍽️ ' },
  { key: 'Transport',  emoji: '🚡 ' },
  { key: 'Activity',   emoji: '🏔️ ' },
]

export default function DiscoverScreen() {
  const { top }      = useSafeAreaInsets()
  const user         = useQuery(api.wallet.getUser)
  const offers       = useQuery(api.wallet.getOffers)
  const activities   = useQuery(api.activities.getActiveActivities)
  const populateData = useMutation(api.seed.populateData)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const scrollY = useRef(new Animated.Value(0)).current

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
          <H2 style={{ textAlign: 'center' }} color={INK}>EtherLaken</H2>
          <Text style={{ textAlign: 'center', fontSize: 14 }} color={INK_LIGHT}>
            Load demo data to explore the tourist experience.
          </Text>
        </YStack>
        <Button size="$5" backgroundColor={TEAL} borderRadius="$4" width="100%" onPress={() => void populateData({})}>
          <Text color="white" fontWeight="bold" fontSize="$4">Initialize data</Text>
        </Button>
      </YStack>
    )
  }

  const filteredOffers = offers === undefined
    ? undefined
    : selectedCategory === 'All'
      ? offers
      : offers.filter((o) => o.category === selectedCategory)

  // Hero occupies ~55% of screen height so the card "peek" is visible
  const heroH = Math.max(280, top + 230)

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0F18' }}>

      {/* ── Hero image — fixed, never moves ── */}
      <Image
        source={{ uri: HERO_URI }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: heroH }}
        resizeMode="cover"
      />
      {/* Subtle top scrim for pill legibility */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: heroH * 0.62,
        backgroundColor: 'rgba(0,0,0,0.28)',
      }} />

      {/* Location label — fades out as content card slides up */}
      <Animated.View style={{
        position: 'absolute', top: heroH - 52, left: 18, zIndex: 15,
        opacity: scrollY.interpolate({
          inputRange: [0, heroH * 0.3],
          outputRange: [1, 0],
          extrapolate: 'clamp',
        }),
      }}>
        <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
          JUNGFRAU REGION · SWITZERLAND
        </Text>
      </Animated.View>

      {/* Pills — always float above everything */}
      <View style={{
        position: 'absolute', top: top + 10, left: 16, right: 16, zIndex: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <BlurView
          intensity={55} tint="dark"
          style={{ borderRadius: 999, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' }}
        >
          <XStack paddingHorizontal={16} paddingVertical={9} style={{ alignItems: 'center' }} gap={7}>
            <Text color="white" fontSize={16}>🏔️</Text>
            <Text color="white" fontSize={13} fontWeight="500">
              Hello, {user.name.split(' ')[0]}
            </Text>
          </XStack>
        </BlurView>
        <BlurView
          intensity={60} tint="dark"
          style={{
            borderRadius: 999, overflow: 'hidden',
            backgroundColor: 'rgba(42,143,160,0.78)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
          }}
        >
          <XStack paddingHorizontal={14} paddingVertical={9} style={{ alignItems: 'center' }} gap={6}>
            <Text color="white" fontSize={12}>🌿</Text>
            <Text color="white" fontSize={13} fontWeight="700">
              {user.greenTokensBalance} LAKE
            </Text>
          </XStack>
        </BlurView>
      </View>

      {/* ── Scrollable foreground — content card slides over the fixed photo ── */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: heroH - 22 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={{
          backgroundColor: BG,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 16,
          paddingTop: 22,
          paddingBottom: 80,
          minHeight: 600,
          shadowColor: '#000',
          shadowOpacity: 0.20,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -5 },
          elevation: 12,
        }}>

          {/* Section header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 10 }}>
            <H2 fontSize="$6" color={INK}>Available offers</H2>
            {offers !== undefined && (
              <Text fontSize="$2" color={TEAL} fontWeight="600">
                {offers.length} offer{offers.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {/* Sustainability challenges */}
          <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 4, paddingBottom: 4 }}>
              {[
                { icon: '🚂', action: 'Take the train',         reward: '+10 LAKE', color: '#2A8FA0', bg: 'rgba(42,143,160,0.08)' },
                { icon: '🌿', action: 'Eco-certified activity', reward: '+15 LAKE', color: '#059669', bg: 'rgba(5,150,105,0.08)'  },
                { icon: '🚶', action: 'Local hike',             reward: '+5 LAKE',  color: '#2A8FA0', bg: 'rgba(42,143,160,0.08)' },
                { icon: '♻️', action: 'Sustainable gesture',   reward: '+3 LAKE',  color: '#059669', bg: 'rgba(5,150,105,0.08)'  },
              ].map((ch) => (
                <View key={ch.action} style={{
                  backgroundColor: ch.bg, borderRadius: 14,
                  borderWidth: 1, borderColor: ch.color + '33',
                  paddingHorizontal: 14, paddingVertical: 10, minWidth: 148,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Text style={{ fontSize: 18 }}>{ch.icon}</Text>
                    <View style={{ backgroundColor: ch.color, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: 'white' }}>{ch.reward}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#1A1612' }}>{ch.action}</Text>
                  <Text style={{ fontSize: 10, color: '#A89E92', marginTop: 2 }}>Sustainability reward</Text>
                </View>
              ))}
            </View>
          </RNScrollView>

          {/* Category filters */}
          <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <XStack gap={8} paddingVertical={4}>
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.key
                return (
                  <Pressable key={cat.key} onPress={() => setSelectedCategory(cat.key)}>
                    <View style={{
                      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
                      backgroundColor: active ? TEAL : 'white',
                      borderWidth: 1,
                      borderColor: active ? TEAL : 'rgba(26,22,18,0.15)',
                    }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? 'white' : INK }}>
                        {cat.emoji}{cat.key}
                      </Text>
                    </View>
                  </Pressable>
                )
              })}
            </XStack>
          </RNScrollView>

          {/* Offer list */}
          {filteredOffers === undefined ? (
            <YStack style={{ alignItems: 'center' }} padding="$4">
              <Spinner color={TEAL} />
            </YStack>
          ) : filteredOffers.length === 0 ? (
            <Text color={INK_LIGHT} paddingTop="$2">No offers in this category.</Text>
          ) : (
            <YStack gap="$4">
              {filteredOffers.map((offer) => (
                <OfferCard
                  key={offer._id}
                  offer={offer}
                  onBook={() => router.push({ pathname: '/book-offer', params: { offerId: offer._id } })}
                />
              ))}
            </YStack>
          )}

          {/* Activities section */}
          {activities !== undefined && activities.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 16, paddingBottom: 10 }}>
                <H2 fontSize="$6" color={INK}>Activities</H2>
                <Text fontSize="$2" color={TEAL} fontWeight="600">
                  {activities.length} experience{activities.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
                <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 4 }}>
                  {activities.map((act) => (
                    <ActivityCard
                      key={act._id}
                      activity={act}
                      onPress={() => router.push({ pathname: '/book-activity', params: { activityId: act._id } })}
                    />
                  ))}
                </View>
              </RNScrollView>
            </>
          )}

        </View>
      </Animated.ScrollView>
    </View>
  )
}

type OfferCardProps = {
  offer: {
    _id: string
    title: string
    description: string
    tokenCost: number
    imageUrl?: string | null
    originalPriceCHF?: number | null
    discountPercentage?: number | null
    category?: string | null
    isEco?: boolean | null
  }
  onBook: () => void
}

function goodUrl(url?: string | null): string | null {
  if (!url) return null
  if (url.includes('picsum') || url.includes('placeholder')) return null
  return url
}

function OfferCard({ offer, onBook }: OfferCardProps) {
  const cat      = offer.category ?? 'Activity'
  const catColor = CAT_COLOR[cat]  ?? '#3DAA72'
  const catEmoji = CAT_EMOJI[cat]  ?? '📍'
  const imageUri = goodUrl(offer.imageUrl) ?? CAT_IMAGE[cat] ?? CAT_IMAGE.Activity

  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 18,
      overflow: 'hidden',
      shadowColor: '#1A1612',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 3,
    }}>

      {/* ── Image zone ── */}
      <View style={{ height: 170, position: 'relative' }}>
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* Soft bottom shadow for readability */}
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 56,
          backgroundColor: 'rgba(0,0,0,0.22)',
        }} />

        {/* Category badge */}
        <View style={{
          position: 'absolute', top: 10, left: 10,
          flexDirection: 'row', alignItems: 'center', gap: 4,
          backgroundColor: catColor,
          borderRadius: 9, paddingHorizontal: 10, paddingVertical: 5,
        }}>
          <Text style={{ fontSize: 12 }}>{catEmoji}</Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: 'white', letterSpacing: 0.2 }}>{cat}</Text>
        </View>

        {/* Eco badge */}
        {offer.isEco && (
          <View style={{
            position: 'absolute', top: 10, right: 10,
            flexDirection: 'row', alignItems: 'center', gap: 3,
            backgroundColor: 'rgba(45,160,90,0.9)',
            borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5,
          }}>
            <Text style={{ fontSize: 11 }}>🌿</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: 'white' }}>Eco</Text>
          </View>
        )}

        {/* Discount pill bottom-right on image */}
        {(offer.discountPercentage ?? 0) > 0 && (
          <View style={{
            position: 'absolute', bottom: 10, right: 10,
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: 7, paddingHorizontal: 9, paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: 'white' }}>
              -{offer.discountPercentage}%
            </Text>
          </View>
        )}
      </View>

      {/* ── Content ── */}
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: INK, lineHeight: 21, marginBottom: 4 }} numberOfLines={2}>
          {offer.title}
        </Text>
        <Text style={{ fontSize: 12, color: INK_LIGHT, lineHeight: 17, marginBottom: 12 }} numberOfLines={2}>
          {offer.description}
        </Text>

        {/* Price + Book row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {offer.originalPriceCHF != null && (
              <Text style={{ fontSize: 12, color: INK_LIGHT, textDecorationLine: 'line-through' }}>
                {offer.originalPriceCHF} CHF
              </Text>
            )}
            <Text style={{ fontSize: 17, fontWeight: '800', color: TEAL }}>
              {offer.tokenCost} LAKE
            </Text>
          </View>

          <TouchableOpacity
            onPress={onBook}
            activeOpacity={0.82}
            style={{
              backgroundColor: TEAL, borderRadius: 12,
              paddingHorizontal: 18, paddingVertical: 10,
              shadowColor: TEAL, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: 'white' }}>Book now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

type ActivityCardProps = {
  activity: {
    _id: string
    title: string
    description: string
    priceJF: number
    originalPriceCHF: number
    durationMinutes: number
    imageUrl?: string | null
    isActive: boolean
  }
  onPress: () => void
}

function ActivityCard({ activity, onPress }: ActivityCardProps) {
  const hours = Math.floor(activity.durationMinutes / 60)
  const mins  = activity.durationMinutes % 60
  const duration = hours > 0
    ? (mins > 0 ? `${hours}h ${mins}min` : `${hours}h`)
    : `${mins}min`

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        width: 200,
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#1A1612',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.09,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Image */}
      <View style={{ height: 120, position: 'relative' }}>
        <Image
          source={{ uri: goodUrl(activity.imageUrl) ?? CAT_IMAGE.Activity }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
          backgroundColor: 'rgba(0,0,0,0.25)',
        }} />
        {/* Duration badge */}
        <View style={{
          position: 'absolute', bottom: 8, left: 8,
          flexDirection: 'row', alignItems: 'center', gap: 3,
          backgroundColor: 'rgba(0,0,0,0.55)',
          borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3,
        }}>
          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>⏱</Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: 'white' }}>{duration}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ padding: 11, gap: 4 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: INK, lineHeight: 18 }} numberOfLines={2}>
          {activity.title}
        </Text>
        <Text style={{ fontSize: 11, color: INK_LIGHT, lineHeight: 15 }} numberOfLines={2}>
          {activity.description}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: TEAL }}>{activity.priceJF} LAKE</Text>
          {activity.originalPriceCHF > 0 && (
            <Text style={{ fontSize: 11, color: INK_LIGHT }}>{activity.originalPriceCHF} CHF</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}
