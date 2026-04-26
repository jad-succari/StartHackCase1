import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { useQuery } from 'convex/react'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Mapbox, {
  Camera,
  MapView,
  MarkerView,
  RasterDemSource,
  Terrain,
  UserLocation,
} from '@rnmapbox/maps'
import { api } from '../../convex/_generated/api'

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? ''
Mapbox.setAccessToken(MAPBOX_TOKEN)

if (Platform.OS === 'web' && MAPBOX_TOKEN) {
  try {
    const mapboxgl = require('mapbox-gl')
    mapboxgl.accessToken = MAPBOX_TOKEN
  } catch (_) {}
}

const TEAL      = '#2A8FA0'
const INK       = '#1A1612'
const INK_LIGHT = '#A89E92'
const GOLD      = '#C9A84C'
const BORDER    = 'rgba(26,22,18,0.08)'

function getCatColor(category?: string): string {
  const map: Record<string, string> = {
    Transport:  '#2A8FA0',
    transport:  '#2A8FA0',
    Ski:        '#4A90D9',
    ski:        '#4A90D9',
    Restaurant: '#E07B54',
    restaurant: '#E07B54',
    Activity:   '#8B5CF6',
    activity:   '#8B5CF6',
  }
  return map[category ?? ''] ?? TEAL
}

function getCatEmoji(category?: string): string {
  const map: Record<string, string> = {
    Transport:  '🚡',
    transport:  '🚡',
    Ski:        '⛷️',
    ski:        '⛷️',
    Restaurant: '🍽️',
    restaurant: '🍽️',
    Activity:   '🏔️',
    activity:   '🏔️',
  }
  return map[category ?? ''] ?? '📍'
}

const CATEGORIES = [
  { id: 'all',        label: 'All',        emoji: '🗺️' },
  { id: 'Transport',  label: 'Transport',  emoji: '🚡' },
  { id: 'Ski',        label: 'Ski',        emoji: '⛷️' },
  { id: 'Restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'Activity',   label: 'Activity',   emoji: '🏔️' },
]

const CAT_IMAGE: Record<string, string> = {
  Transport: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=500&q=70',
  Ski:       'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=500&q=70',
  Restaurant:'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=500&q=70',
  Activity:  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&q=70',
}

const PARTNERS_HARDCODED: Partner[] = [
  {
    _id: 'hc-1', name: 'Schilthornbahn AG', category: 'Transport',
    locationName: 'Mürren', isEco: true, lat: 46.5592, lng: 7.8986,
    offers: [{ _id: 'hco-1', title: 'Schilthorn · Piz Gloria', tokenCost: 90, savingsCHF: 42, description: 'Panoramic cable car to Schilthorn summit at 2,970 m', imageUrl: CAT_IMAGE.Transport }],
    activities: [],
  },
  {
    _id: 'hc-2', name: 'Jungfrau Railways', category: 'Transport',
    locationName: 'Grindelwald', isEco: true, lat: 46.5751, lng: 7.9857,
    offers: [{ _id: 'hco-2', title: 'Jungfraujoch — Top of Europe', tokenCost: 150, savingsCHF: 38, description: 'Highest railway in Europe to 3,454 m — glacier views and Ice Palace', imageUrl: CAT_IMAGE.Transport }],
    activities: [],
  },
  {
    _id: 'hc-3', name: 'Grindelwald Sports', category: 'Ski',
    locationName: 'Grindelwald', isEco: false, lat: 46.6244, lng: 8.0409,
    offers: [{ _id: 'hco-3', title: 'Ski Grindelwald First', tokenCost: 120, savingsCHF: 55, description: 'Full-day ski pass — all levels, 213 km of pistes', imageUrl: CAT_IMAGE.Ski }],
    activities: [],
  },
  {
    _id: 'hc-4', name: 'Restaurant Zur Mühle', category: 'Restaurant',
    locationName: 'Interlaken', isEco: true, lat: 46.6863, lng: 7.8632,
    offers: [{ _id: 'hco-4', title: 'Alpine fondue dinner', tokenCost: 30, savingsCHF: 18, description: 'Traditional Swiss fondue with local dairy products', imageUrl: CAT_IMAGE.Restaurant }],
    activities: [],
  },
  {
    _id: 'hc-5', name: 'Harder Kulm', category: 'Activity',
    locationName: 'Interlaken', isEco: false, lat: 46.7012, lng: 7.8756,
    offers: [{ _id: 'hco-5', title: 'Harder Kulm · 360° panorama', tokenCost: 60, savingsCHF: 22, description: 'Funicular to 1,322 m — panoramic views of the Alps and Bernese Oberland', imageUrl: CAT_IMAGE.Activity }],
    activities: [],
  },
]

const DEFAULT_CENTER: [number, number] = [7.8632, 46.6863]
const SHEET_HEIGHT = 440

type Offer = {
  _id: string
  title: string
  description: string
  tokenCost: number
  originalPriceCHF?: number | null
  savingsCHF?: number | null
  discountPercentage?: number | null
  imageUrl?: string | null
  isActive?: boolean | null
}

type Activity = {
  _id: string
  title: string
  description: string
  priceJF: number
  originalPriceCHF: number
  durationMinutes: number
  imageUrl?: string | null
}

type Partner = {
  _id: string
  name: string
  category?: string
  description?: string
  village?: string
  locationName?: string
  lat?: number
  lng?: number
  isEco?: boolean
  isEcoCertified?: boolean
  offers: Offer[]
  activities: Activity[]
}

export default function MapScreen() {
  const { top, bottom } = useSafeAreaInsets()
  const rawPartners = useQuery(api.partners.getPartners)
  const convexPartners = rawPartners as Partner[] | undefined
  const partners = (convexPartners && convexPartners.length > 0) ? convexPartners : PARTNERS_HARDCODED

  const [activeCategory, setActiveCategory] = useState('all')
  const [selected, setSelected]             = useState<Partner | null>(null)
  const [is3D, setIs3D]                     = useState(true)
  const sheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current
  const cameraRef = useRef<any>(null)

  const filtered = partners.filter(
    (p) => (activeCategory === 'all' || p.category === activeCategory) && p.lat && p.lng
  )

  function openSheet(partner: Partner) {
    setSelected(partner)
    cameraRef.current?.setCamera({
      centerCoordinate: [partner.lng!, partner.lat!],
      zoomLevel: 12,
      pitch: 50,
      animationDuration: 1000,
      animationMode: 'flyTo',
    })
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 22,
      stiffness: 200,
      mass: 1,
    }).start()
  }

  function closeSheet() {
    Animated.spring(sheetAnim, {
      toValue: SHEET_HEIGHT,
      useNativeDriver: true,
      damping: 22,
      stiffness: 200,
      mass: 1,
    }).start(() => {
      setSelected(null)
      cameraRef.current?.setCamera({
        centerCoordinate: DEFAULT_CENTER,
        zoomLevel: 11,
        pitch: is3D ? 50 : 0,
        animationDuration: 700,
        animationMode: 'easeTo',
      })
    })
  }

  function recenter() {
    cameraRef.current?.setCamera({
      centerCoordinate: DEFAULT_CENTER,
      zoomLevel: 11,
      pitch: is3D ? 50 : 0,
      animationDuration: 900,
    })
  }

  function toggle3D() {
    const next = !is3D
    setIs3D(next)
    cameraRef.current?.setCamera({
      pitch: next ? 50 : 0,
      animationDuration: 600,
      animationMode: 'easeTo',
    })
  }

  return (
    <View style={s.root}>

      <MapView
        style={StyleSheet.absoluteFillObject}
        styleURL="mapbox://styles/mapbox/satellite-streets-v12"
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled
        compassViewPosition={3}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={11}
          centerCoordinate={DEFAULT_CENTER}
          pitch={50}
          heading={0}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {Platform.OS !== 'web' && UserLocation && <UserLocation visible={true} />}

        {Platform.OS !== 'web' && RasterDemSource && Terrain && (
          <>
            <RasterDemSource
              id="mapbox-dem"
              url="mapbox://mapbox.mapbox-terrain-dem-v1"
              tileSize={512}
              maxZoomLevel={14}
            />
            <Terrain sourceID="mapbox-dem" style={{ exaggeration: 1.8 }} />
          </>
        )}

        {filtered.map((partner) => {
          const color = getCatColor(partner.category)
          const emoji = getCatEmoji(partner.category)
          return (
            <MarkerView
              key={partner._id}
              id={partner._id}
              coordinate={[partner.lng!, partner.lat!]}
              allowOverlap={true}
            >
              <TouchableOpacity onPress={() => openSheet(partner)} activeOpacity={0.8}>
                <View style={[s.pin, { backgroundColor: color }]}>
                  <Text style={s.pinEmoji}>{emoji}</Text>
                </View>
              </TouchableOpacity>
            </MarkerView>
          )
        })}
      </MapView>

      {/* Category filter bar */}
      <View style={[s.filterBar, { top: top + 8 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.8}
                style={[s.chip, active && s.chipActive]}
              >
                <Text style={s.chipEmoji}>{cat.emoji}</Text>
                <Text style={[s.chipLabel, active && s.chipLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[s.toggle3D, { top: top + 110 }]}
        onPress={toggle3D}
        activeOpacity={0.85}
      >
        <Text style={s.toggle3DText}>{is3D ? '2D' : '3D'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.fab, { bottom: selected ? SHEET_HEIGHT + 16 : bottom + 24 }]}
        onPress={recenter}
        activeOpacity={0.85}
      >
        <Text style={s.fabIcon}>⊙</Text>
      </TouchableOpacity>

      {rawPartners === undefined && (
        <View style={[s.loadingCard, { top: top + 72 }]}>
          <ActivityIndicator size="small" color={TEAL} />
        </View>
      )}

      {selected && (
        <Animated.View
          style={[
            s.sheet,
            {
              transform: [{ translateY: sheetAnim }],
              paddingBottom: Math.max(bottom, 16),
            },
          ]}
        >
          <View style={s.handle} />

          <TouchableOpacity
            onPress={closeSheet}
            style={s.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={s.closeX}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.sheetContent}
          >
            {/* Partner header */}
            <View style={s.sheetTitleRow}>
              <Text style={s.sheetName}>{selected.name}</Text>
              {(selected.isEco || selected.isEcoCertified) && (
                <View style={s.ecoBadge}>
                  <Text style={s.ecoText}>🌿 Eco</Text>
                </View>
              )}
            </View>

            <View style={s.sheetMeta}>
              <View style={[s.catBadge, { backgroundColor: getCatColor(selected.category) + '22' }]}>
                <Text style={[s.catBadgeText, { color: getCatColor(selected.category) }]}>
                  {getCatEmoji(selected.category)}{' '}
                  {(selected.category ?? 'Partner').toUpperCase()}
                </Text>
              </View>
              {(selected.locationName ?? selected.village) ? (
                <Text style={s.village}>
                  📍 {selected.locationName ?? selected.village}
                </Text>
              ) : null}
            </View>

            {selected.description ? (
              <Text style={s.desc}>{selected.description}</Text>
            ) : null}

            {/* Offers */}
            {selected.offers.length > 0 && (
              <>
                <View style={s.divider} />
                <Text style={s.sectionLabel}>BOOKABLE OFFERS</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.cardsList}
                >
                  {selected.offers.map((offer) => {
                    const imgUri = offer.imageUrl ?? CAT_IMAGE[selected.category ?? 'Activity'] ?? CAT_IMAGE.Activity
                    return (
                      <View key={offer._id} style={s.offerCard}>
                        <Image
                          source={{ uri: imgUri }}
                          style={s.offerImage}
                          resizeMode="cover"
                        />
                        {(offer.discountPercentage ?? 0) > 0 && (
                          <View style={s.discountBadge}>
                            <Text style={s.discountText}>-{offer.discountPercentage}%</Text>
                          </View>
                        )}
                        <View style={s.offerBody}>
                          <Text style={s.offerTitle} numberOfLines={2}>{offer.title}</Text>
                          <Text style={s.offerDesc} numberOfLines={2}>{offer.description}</Text>
                          <View style={s.offerFooter}>
                            <View>
                              <Text style={s.offerGTAmount}>{offer.tokenCost} <Text style={s.offerGTLabel}>LAKE</Text></Text>
                              {(offer.savingsCHF ?? 0) > 0 && (
                                <Text style={s.savingsText}>Save CHF {offer.savingsCHF}</Text>
                              )}
                            </View>
                            <TouchableOpacity
                              style={s.bookBtn}
                              activeOpacity={0.82}
                              onPress={() => {
                                closeSheet()
                                router.push({ pathname: '/book-offer', params: { offerId: offer._id } })
                              }}
                            >
                              <Text style={s.bookBtnText}>Book</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )
                  })}
                </ScrollView>
              </>
            )}

            {/* Activities */}
            {selected.activities && selected.activities.length > 0 && (
              <>
                <View style={s.divider} />
                <Text style={s.sectionLabel}>ACTIVITIES</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.cardsList}
                >
                  {selected.activities.map((act) => {
                    const hours   = Math.floor(act.durationMinutes / 60)
                    const mins    = act.durationMinutes % 60
                    const dur     = hours > 0 ? (mins > 0 ? `${hours}h ${mins}min` : `${hours}h`) : `${mins}min`
                    const imgUri  = act.imageUrl ?? CAT_IMAGE.Activity
                    return (
                      <View key={act._id} style={s.offerCard}>
                        <Image
                          source={{ uri: imgUri }}
                          style={s.offerImage}
                          resizeMode="cover"
                        />
                        <View style={s.durationBadge}>
                          <Text style={s.durationText}>⏱ {dur}</Text>
                        </View>
                        <View style={s.offerBody}>
                          <Text style={s.offerTitle} numberOfLines={2}>{act.title}</Text>
                          <Text style={s.offerDesc} numberOfLines={2}>{act.description}</Text>
                          <View style={s.offerFooter}>
                            <Text style={s.offerGTAmount}>{act.priceJF} <Text style={s.offerGTLabel}>LAKE</Text></Text>
                            <View style={[s.bookBtn, { backgroundColor: '#8B5CF6' }]}>
                              <Text style={s.bookBtnText}>Explore</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )
                  })}
                </ScrollView>
              </>
            )}

            {selected.offers.length === 0 && (!selected.activities || selected.activities.length === 0) && (
              <>
                <View style={s.divider} />
                <Text style={s.noOffers}>No offers available for this partner.</Text>
              </>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#DCE8EC' },
  filterBar: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(250,248,245,0.96)', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 7, gap: 5,
    borderWidth: 1, borderColor: 'rgba(26,22,18,0.1)',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  chipActive: { backgroundColor: TEAL, borderColor: TEAL },
  chipEmoji: { fontSize: 14 },
  chipLabel: { fontSize: 12, fontWeight: '600', color: INK },
  chipLabelActive: { color: 'white' },
  toggle3D: {
    position: 'absolute', right: 12, zIndex: 10,
    backgroundColor: 'white', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1.5, borderColor: TEAL,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 5,
  },
  toggle3DText: { fontSize: 13, fontWeight: '700', color: TEAL },
  pin: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: 'white',
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }, elevation: 5,
  },
  pinEmoji: { fontSize: 20 },
  fab: {
    position: 'absolute', right: 20, zIndex: 10,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 6,
    borderWidth: 1, borderColor: BORDER,
  },
  fabIcon: { fontSize: 22, color: TEAL },
  loadingCard: {
    position: 'absolute', alignSelf: 'center', zIndex: 10,
    backgroundColor: 'white', borderRadius: 20, padding: 12,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: SHEET_HEIGHT, backgroundColor: '#FAFAF8',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    paddingTop: 12, paddingHorizontal: 20,
    shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 }, elevation: 12, zIndex: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(26,22,18,0.15)',
    alignSelf: 'center', marginBottom: 12,
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 20,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(26,22,18,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeX: { fontSize: 12, color: INK_LIGHT, fontWeight: '600' },
  sheetContent: { paddingBottom: 8 },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sheetName: { fontSize: 20, fontWeight: '800', color: INK, flex: 1 },
  ecoBadge: {
    backgroundColor: '#E8F5E9', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  ecoText: { fontSize: 11, fontWeight: '600', color: '#5C9E31' },
  sheetMeta: {
    flexDirection: 'row', alignItems: 'center',
    flexWrap: 'wrap', gap: 8, marginBottom: 8,
  },
  catBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  catBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  village: { fontSize: 12, color: INK_LIGHT },
  desc: { fontSize: 13, color: INK_LIGHT, lineHeight: 19, marginBottom: 4 },
  divider: { height: 1, backgroundColor: 'rgba(26,22,18,0.07)', marginVertical: 12 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: INK_LIGHT,
    letterSpacing: 1.2, marginBottom: 10,
  },
  cardsList: { gap: 10, paddingBottom: 4 },
  offerCard: {
    width: 200, backgroundColor: 'white', borderRadius: 16,
    borderWidth: 1, borderColor: BORDER, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  offerImage: { width: '100%', height: 100 },
  offerBody: { padding: 10, gap: 4 },
  offerTitle: { fontSize: 12, fontWeight: '700', color: INK, lineHeight: 17 },
  offerDesc:  { fontSize: 11, color: INK_LIGHT, lineHeight: 15 },
  offerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  offerGTAmount: { fontSize: 16, fontWeight: '800', color: TEAL },
  offerGTLabel:  { fontSize: 11, fontWeight: '700', color: TEAL },
  savingsText: { fontSize: 10, color: GOLD, fontWeight: '600' },
  discountBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  discountText: { fontSize: 10, fontWeight: '700', color: 'white' },
  durationBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  durationText: { fontSize: 10, fontWeight: '700', color: 'white' },
  bookBtn: {
    backgroundColor: TEAL, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  bookBtnText: { fontSize: 11, fontWeight: '700', color: 'white' },
  noOffers: { fontSize: 12, color: INK_LIGHT, paddingVertical: 8 },
})
