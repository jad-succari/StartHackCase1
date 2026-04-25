import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { useQuery } from 'convex/react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Mapbox, {
  Camera,
  MapView,
  PointAnnotation,
  MarkerView,
  RasterDemSource,
  Terrain,
} from '@rnmapbox/maps'
import { api } from '../../convex/_generated/api'

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? ''
Mapbox.setAccessToken(MAPBOX_TOKEN)

// On web, mapbox-gl needs the token set directly on its global object
if (Platform.OS === 'web' && MAPBOX_TOKEN) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mapboxgl = require('mapbox-gl')
    mapboxgl.accessToken = MAPBOX_TOKEN
  } catch (_) {
    // not in web context
  }
}

// ─── Palette ────────────────────────────────────────────────
const TEAL      = '#2A8FA0'
const INK       = '#1A1612'
const INK_LIGHT = '#A89E92'
const GOLD      = '#C9A84C'
const BORDER    = 'rgba(26,22,18,0.08)'

// Support both lowercase (legacy) and Title Case (new data)
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
    'Activité': '#8B5CF6',
    activité:   '#8B5CF6',
    panorama:   '#8B5CF6',
    eco:        '#5C9E31',
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
    'Activité': '🏔️',
    activité:   '🏔️',
    panorama:   '🏔️',
    eco:        '🌿',
  }
  return map[category ?? ''] ?? '📍'
}

const CATEGORIES = [
  { id: 'all',        label: 'Tous',       emoji: '🗺️' },
  { id: 'Transport',  label: 'Transport',  emoji: '🚡' },
  { id: 'Ski',        label: 'Ski',        emoji: '⛷️' },
  { id: 'Restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'Activity',   label: 'Activity',   emoji: '🏔️' },
]

const DEFAULT_CENTER: [number, number] = [7.8632, 46.6863]
const SHEET_HEIGHT = 420

// ─── Types ──────────────────────────────────────────────────
type Offer = {
  _id: string
  title: string
  description: string
  tokenCost: number
  originalPriceCHF?: number
  savingsCHF?: number
  discountPercentage?: number
  isActive?: boolean
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
}

// ─── Screen ─────────────────────────────────────────────────
export default function MapScreen() {
  const { top, bottom } = useSafeAreaInsets()
  const rawPartners = useQuery(api.partners.getPartners)
  const partners    = rawPartners as Partner[] | undefined

  const [activeCategory, setActiveCategory] = useState('all')
  const [selected, setSelected]             = useState<Partner | null>(null)
  const [is3D, setIs3D]                     = useState(true)
  const sheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current
  const cameraRef = useRef<any>(null)

  const filtered = (partners ?? []).filter(
    (p) => (activeCategory === 'all' || p.category === activeCategory) && p.lat && p.lng
  )

  function openSheet(partner: Partner) {
    setSelected(partner)
    cameraRef.current?.setCamera({
      centerCoordinate: [partner.lng!, partner.lat!],
      zoomLevel: 14,
      pitch: 60,
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
    }).start(() => setSelected(null))
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

      {/* ── Map ─────────────────────────────────────────── */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        styleURL="mapbox://styles/mapbox/outdoors-v12"
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

        {/* 3D Terrain — native only (web doesn't support RasterDemSource/Terrain) */}
        {Platform.OS !== 'web' && RasterDemSource && Terrain && (
          <>
            <RasterDemSource
              id="mapbox-dem"
              url="mapbox://mapbox.mapbox-terrain-dem-v1"
              tileSize={512}
              maxZoomLevel={14}
            />
            <Terrain
              sourceID="mapbox-dem"
              style={{ exaggeration: 1.8 }}
            />
          </>
        )}

        {/* Markers — MarkerView on web, PointAnnotation on native */}
        {filtered.map((partner) => {
          const color = getCatColor(partner.category)
          const emoji = getCatEmoji(partner.category)
          if (Platform.OS === 'web') {
            return (
              <MarkerView
                key={partner._id}
                id={partner._id}
                coordinate={[partner.lng!, partner.lat!]}
              >
                <TouchableOpacity onPress={() => openSheet(partner)} activeOpacity={0.8}>
                  <View style={[s.pin, { backgroundColor: color }]}>
                    <Text style={s.pinEmoji}>{emoji}</Text>
                  </View>
                </TouchableOpacity>
              </MarkerView>
            )
          }
          return (
            <PointAnnotation
              key={partner._id}
              id={partner._id}
              coordinate={[partner.lng!, partner.lat!]}
              onSelected={() => openSheet(partner)}
            >
              <View style={[s.pin, { backgroundColor: color }]}>
                <Text style={s.pinEmoji}>{emoji}</Text>
              </View>
            </PointAnnotation>
          )
        })}
      </MapView>

      {/* ── Filter bar ──────────────────────────────────── */}
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

      {/* ── 3D toggle ───────────────────────────────────── */}
      <TouchableOpacity
        style={[s.toggle3D, { top: top + 110 }]}
        onPress={toggle3D}
        activeOpacity={0.85}
      >
        <Text style={s.toggle3DText}>{is3D ? '2D' : '3D'}</Text>
      </TouchableOpacity>

      {/* ── Recenter FAB ────────────────────────────────── */}
      <TouchableOpacity
        style={[s.fab, { bottom: bottom + 24 }]}
        onPress={recenter}
        activeOpacity={0.85}
      >
        <Text style={s.fabIcon}>⊙</Text>
      </TouchableOpacity>

      {/* ── Loading ─────────────────────────────────────── */}
      {partners === undefined && (
        <View style={[s.loadingCard, { top: top + 72 }]}>
          <ActivityIndicator size="small" color={TEAL} />
        </View>
      )}

      {/* ── Bottom sheet ────────────────────────────────── */}
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
            {/* Header */}
            <View style={s.sheetTitleRow}>
              <Text style={s.sheetName}>{selected.name}</Text>
              {(selected.isEco || selected.isEcoCertified) && (
                <View style={s.ecoBadge}>
                  <Text style={s.ecoText}>🌿 Éco</Text>
                </View>
              )}
            </View>

            <View style={s.sheetMeta}>
              <View
                style={[s.catBadge, { backgroundColor: getCatColor(selected.category) + '22' }]}
              >
                <Text style={[s.catBadgeText, { color: getCatColor(selected.category) }]}>
                  {getCatEmoji(selected.category)}{' '}
                  {(selected.category ?? 'partenaire').toUpperCase()}
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

            <View style={s.divider} />

            <Text style={s.offersLabel}>OFFRES DISPONIBLES</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.offersList}
            >
              {selected.offers.length === 0 && (
                <Text style={s.noOffers}>Aucune offre pour ce partenaire.</Text>
              )}
              {selected.offers.map((offer) => (
                <View key={offer._id} style={s.offerCard}>
                  <Text style={s.offerTitle} numberOfLines={2}>
                    {offer.title}
                  </Text>
                  <Text style={s.offerDesc} numberOfLines={3}>
                    {offer.description}
                  </Text>
                  <View style={s.offerPriceRow}>
                    <Text style={s.offerGTAmount}>{offer.tokenCost}</Text>
                    <Text style={s.offerGTLabel}> GT</Text>
                  </View>
                  {offer.savingsCHF ? (
                    <View style={s.savingsBadge}>
                      <Text style={s.savingsText}>
                        Économie CHF {offer.savingsCHF}
                      </Text>
                    </View>
                  ) : null}
                  {offer.discountPercentage ? (
                    <View style={s.discountBadge}>
                      <Text style={s.discountText}>-{offer.discountPercentage}%</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  )
}

// ─── Styles ─────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#DCE8EC' },

  // Filter bar
  filterBar: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250,248,245,0.96)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(26,22,18,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chipActive: { backgroundColor: TEAL, borderColor: TEAL },
  chipEmoji: { fontSize: 14 },
  chipLabel: { fontSize: 12, fontWeight: '600', color: INK },
  chipLabelActive: { color: 'white' },

  // 3D toggle pill
  toggle3D: {
    position: 'absolute',
    right: 12,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: TEAL,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  toggle3DText: { fontSize: 13, fontWeight: '700', color: TEAL },

  // Marker pin
  pin: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  pinEmoji: { fontSize: 20 },

  // Recenter FAB
  fab: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  fabIcon: { fontSize: 22, color: TEAL },

  // Loading card
  loadingCard: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  // Bottom sheet
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#FAFAF8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
    zIndex: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(26,22,18,0.15)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(26,22,18,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: { fontSize: 12, color: INK_LIGHT, fontWeight: '600' },
  sheetContent: { paddingBottom: 8 },

  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sheetName: { fontSize: 20, fontWeight: '800', color: INK, flex: 1 },
  ecoBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ecoText: { fontSize: 11, fontWeight: '600', color: '#5C9E31' },
  sheetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  catBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  catBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  village: { fontSize: 12, color: INK_LIGHT },
  desc: { fontSize: 13, color: INK_LIGHT, lineHeight: 19, marginBottom: 4 },
  divider: { height: 1, backgroundColor: 'rgba(26,22,18,0.07)', marginVertical: 14 },
  offersLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: INK_LIGHT,
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // Offers horizontal list
  offersList: { gap: 10, paddingBottom: 4 },
  offerCard: {
    width: 190,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    gap: 5,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  offerTitle: { fontSize: 13, fontWeight: '700', color: INK, lineHeight: 18 },
  offerDesc: { fontSize: 11, color: INK_LIGHT, lineHeight: 15 },
  offerPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  offerGTAmount: { fontSize: 22, fontWeight: '800', color: TEAL },
  offerGTLabel: { fontSize: 12, fontWeight: '700', color: TEAL },
  savingsBadge: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  savingsText: { fontSize: 10, fontWeight: '600', color: GOLD },
  discountBadge: {
    backgroundColor: 'rgba(42,143,160,0.10)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  discountText: { fontSize: 10, fontWeight: '700', color: TEAL },
  noOffers: { fontSize: 12, color: INK_LIGHT, paddingVertical: 8 },
})