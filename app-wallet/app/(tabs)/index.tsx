import { useState } from 'react'
import { Image, View, Pressable, ScrollView as RNScrollView } from 'react-native'
import { BlurView } from 'expo-blur'
import { useMutation, useQuery } from 'convex/react'
import { Redirect, router } from 'expo-router'
import { api } from '../../convex/_generated/api'
import { getRole } from '../../lib/roleStore'
import {
  Button,
  H2,
  ScrollView,
  Spinner,
  Text,
  XStack,
  YStack,
} from 'tamagui'

const TEAL      = '#0D9488'
const TEAL_DARK = '#0a7c72'
const TEAL_BG   = 'rgba(13,148,136,0.09)'
const TEAL_BRD  = 'rgba(13,148,136,0.22)'
const INK       = '#1A1612'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'

const HERO_URI = 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80'

const CATEGORIES = ['All', 'Ski', 'Restaurant', 'Transport', 'Activity']

export default function DiscoverScreen() {
  const user         = useQuery(api.wallet.getUser)
  const offers       = useQuery(api.wallet.getOffers)
  const populateData = useMutation(api.seed.populateData)
  const [selectedCategory, setSelectedCategory] = useState('All')

  if (getRole() === 'partner') return <Redirect href="/(tabs)/scanner" />

  if (user === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} backgroundColor={BG} gap="$3">
        <Spinner size="large" color={TEAL} />
        <Text color={INK_LIGHT}>Chargement...</Text>
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
            Chargez les données de démonstration pour explorer l'expérience touristique.
          </Text>
        </YStack>
        <Button size="$5" backgroundColor={TEAL} borderRadius="$4" width="100%" onPress={() => void populateData({})}>
          <Text color="white" fontWeight="bold" fontSize="$4">Initialiser les données</Text>
        </Button>
      </YStack>
    )
  }

  const filteredOffers = offers === undefined
    ? undefined
    : selectedCategory === 'All'
      ? offers
      : offers.filter((o) => o.category === selectedCategory)

  return (
    <YStack style={{ flex: 1 }} backgroundColor={BG}>

      {/* Hero */}
      <View style={{ height: 220, position: 'relative', overflow: 'hidden' }}>
        <Image
          source={{ uri: HERO_URI }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 90,
          backgroundColor: 'rgba(0,0,0,0.32)',
        }} />
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
          backgroundColor: BG,
          opacity: 0.95,
        }} />

        {/* Glass pills */}
        <View style={{
          position: 'absolute', top: 16, left: 16, right: 16,
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
                Bonjour, {user.name.split(' ')[0]}
              </Text>
            </XStack>
          </BlurView>

          <BlurView
            intensity={60}
            tint="dark"
            style={{
              borderRadius: 999, overflow: 'hidden',
              backgroundColor: 'rgba(13,148,136,0.75)',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
            }}
          >
            <XStack paddingHorizontal={14} paddingVertical={9} style={{ alignItems: 'center' }} gap={6}>
              <Text color="white" fontSize="$2">🌿</Text>
              <Text color="white" fontSize="$3" fontWeight="700">
                {user.greenTokensBalance} LAKE
              </Text>
            </XStack>
          </BlurView>
        </View>

        <View style={{ position: 'absolute', bottom: 20, left: 18 }}>
          <Text color={INK_LIGHT} fontSize="$1" fontWeight="600" style={{ letterSpacing: 1 }}>
            JUNGFRAU REGION · SWITZERLAND
          </Text>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView>
        <YStack paddingHorizontal="$4" paddingBottom="$8" gap="$3">

          {/* Section header */}
          <XStack justifyContent="space-between" style={{ alignItems: 'baseline' }} paddingTop="$4">
            <H2 fontSize="$6" color={INK}>Offres disponibles</H2>
            {offers !== undefined && (
              <Text fontSize="$2" color={TEAL} fontWeight="600">
                {offers.length} offre{offers.length !== 1 ? 's' : ''}
              </Text>
            )}
          </XStack>

          {/* ── Sustainability earning challenges ── */}
          <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 4, paddingBottom: 4 }}>
              {[
                { icon: '🚂', action: 'Prenez le train', reward: '+10 LAKE', color: '#0D9488', bg: 'rgba(13,148,136,0.08)' },
                { icon: '🌿', action: 'Activité éco-certifiée', reward: '+15 LAKE', color: '#059669', bg: 'rgba(5,150,105,0.08)' },
                { icon: '🚶', action: 'Randonnée locale', reward: '+5 LAKE', color: '#0D9488', bg: 'rgba(13,148,136,0.08)' },
                { icon: '♻️', action: 'Geste durable', reward: '+3 LAKE', color: '#059669', bg: 'rgba(5,150,105,0.08)' },
              ].map((ch) => (
                <View key={ch.action} style={{
                  backgroundColor: ch.bg,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: ch.color + '33',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  minWidth: 148,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Text style={{ fontSize: 18 }}>{ch.icon}</Text>
                    <View style={{
                      backgroundColor: ch.color,
                      borderRadius: 8,
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: 'white' }}>{ch.reward}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#1A1612' }}>{ch.action}</Text>
                  <Text style={{ fontSize: 10, color: '#A89E92', marginTop: 2 }}>Récompense durabilité</Text>
                </View>
              ))}
            </View>
          </RNScrollView>

          {/* Category filter pills */}
          <RNScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap={8} paddingVertical={4}>
              {CATEGORIES.map((cat) => (
                <Pressable key={cat} onPress={() => setSelectedCategory(cat)}>
                  <View style={{
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                    borderRadius: 999,
                    backgroundColor: selectedCategory === cat ? TEAL : 'white',
                    borderWidth: 1,
                    borderColor: selectedCategory === cat ? TEAL : 'rgba(26,22,18,0.15)',
                  }}>
                    <Text style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: selectedCategory === cat ? 'white' : INK,
                    }}>
                      {cat}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </XStack>
          </RNScrollView>

          {/* Offer list */}
          {filteredOffers === undefined ? (
            <YStack style={{ alignItems: 'center' }} padding="$4">
              <Spinner color={TEAL} />
            </YStack>
          ) : filteredOffers.length === 0 ? (
            <Text color={INK_LIGHT} paddingTop="$2">Aucune offre dans cette catégorie.</Text>
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
  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(26,22,18,0.08)',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }}>
      <YStack padding="$3" gap="$2">

        <Text style={{ fontSize: 11, color: INK_LIGHT, fontWeight: '600', letterSpacing: 0.6 }}>
          PARTENAIRE
        </Text>

        <Text style={{ fontSize: 15, fontWeight: '700', color: INK, lineHeight: 21 }} numberOfLines={2}>
          {offer.title}
        </Text>

        <Text style={{ fontSize: 12, color: INK_LIGHT, lineHeight: 17 }} numberOfLines={2}>
          {offer.description}
        </Text>

        <XStack style={{ alignItems: 'center' }} gap={10} paddingTop={2}>
          {offer.originalPriceCHF != null && (
            <Text style={{ fontSize: 13, color: INK_LIGHT, textDecorationLine: 'line-through' }}>
              {offer.originalPriceCHF} CHF
            </Text>
          )}
          <View style={{
            backgroundColor: TEAL_BG,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderWidth: 1,
            borderColor: TEAL_BRD,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: TEAL }}>
              {offer.tokenCost} LAKE
            </Text>
          </View>
        </XStack>

      </YStack>

      {/* Full-width book button */}
      <Pressable
        onPress={onBook}
        style={({ pressed }) => ({
          flexDirection: 'row',
          backgroundColor: pressed ? TEAL_DARK : TEAL,
          overflow: 'hidden',
        })}
      >
        <View style={{
          paddingHorizontal: 18,
          paddingVertical: 13,
          borderRightWidth: 1,
          borderRightColor: 'rgba(255,255,255,0.25)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
            -{offer.discountPercentage ?? 0}%
          </Text>
        </View>

        <View style={{ flex: 1, paddingVertical: 13, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
            Réserver
          </Text>
        </View>
      </Pressable>
    </View>
  )
}
