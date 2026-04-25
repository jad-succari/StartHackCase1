import React, { useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Text,
  useWindowDimensions,
} from 'react-native'
import { useQuery } from 'convex/react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../../convex/_generated/api'

const TEAL     = '#2A8FA0'
const TEAL_BG  = 'rgba(42,143,160,0.07)'
const TEAL_BRD = 'rgba(42,143,160,0.35)'
const GOLD     = '#C9A84C'
const INK      = '#1A1612'
const INK_LIGHT = '#A89E92'
const BG       = '#FAF8F5'
const BORDER   = 'rgba(26,22,18,0.08)'

type Badge = {
  id: string
  emoji: string
  title: string
  desc: string
  unlocked: boolean
}

type Benefit = { icon: string; text: string }

const BADGE_BENEFITS: Record<string, Benefit[]> = {
  first: [
    { icon: '🎁', text: '+5 GT offerts sur votre prochain booking' },
    { icon: '⭐', text: 'Accès aux offres early bird' },
  ],
  ski: [
    { icon: '🎿', text: 'Réduction 10% sur les forfaits ski' },
    { icon: '🚡', text: 'Priorité aux remontées mécaniques' },
    { icon: '🏂', text: 'Accès aux pistes réservées membres' },
  ],
  eco: [
    { icon: '🌱', text: '+15 GT bonus par activité éco-certifiée' },
    { icon: '♻️', text: 'Badge visible sur votre profil voyageur' },
    { icon: '🌍', text: 'Expériences durables exclusives débloquées' },
  ],
  restaurant: [
    { icon: '👨‍🍳', text: 'Menu du chef en accès privé' },
    { icon: '🍷', text: 'Dégustation offerte en fin de repas' },
    { icon: '📅', text: 'Réservation prioritaire les week-ends' },
  ],
  transport: [
    { icon: '🚄', text: 'Surclassement gratuit sur les trains régionaux' },
    { icon: '🎫', text: 'Pass illimité 24h sur le réseau Jungfrau' },
    { icon: '🛎️', text: 'Service de bagages à l\'hôtel offert' },
  ],
  blazer: [
    { icon: '🗺️', text: 'Accès aux sentiers de randonnée exclusifs' },
    { icon: '🏕️', text: 'Kit aventure offert à l\'accueil' },
    { icon: '📸', text: 'Séance photo souvenir incluse' },
  ],
  collector: [
    { icon: '🎁', text: 'Bonus GT mystère chaque semaine' },
    { icon: '🏷️', text: 'Réductions partenaires exclusives' },
    { icon: '🔑', text: 'Accès au club Collectors EtherLaken' },
  ],
  legend: [
    { icon: '🏆', text: 'Accès VIP aux événements Jungfrau' },
    { icon: '🎖️', text: 'Statut ambassadeur EtherLaken' },
    { icon: '💎', text: 'Conciergerie personnelle dédiée' },
  ],
  spender: [
    { icon: '💰', text: 'Cashback 5% en GT sur chaque dépense' },
    { icon: '🛍️', text: 'Remises dans les boutiques partenaires' },
    { icon: '🎪', text: 'Avant-première sur les nouvelles offres' },
  ],
  summit: [
    { icon: '⛰️', text: 'Guide personnel pour excursions en montagne' },
    { icon: '🏔️', text: 'Accès aux sommets hors saison' },
    { icon: '🌄', text: 'Sunrise tour privatif sur demande' },
  ],
  vip: [
    { icon: '💎', text: 'Conciergerie disponible 24h/24' },
    { icon: '🛡️', text: 'Support prioritaire garanti en 1h' },
    { icon: '🌟', text: 'Invitations aux soirées partenaires exclusives' },
  ],
  explorer: [
    { icon: '🏅', text: 'Statut Ambassador — pass annuel offert' },
    { icon: '🌐', text: 'Accès à toutes les destinations du réseau' },
    { icon: '🎗️', text: 'Plaque nominative au siège EtherLaken' },
  ],
}

export default function BadgesScreen() {
  const { top } = useSafeAreaInsets()
  const user   = useQuery(api.wallet.getUser)
  const badges = useQuery(
    api.wallet.getBadges,
    user ? { userId: user._id } : 'skip'
  )
  const [selected, setSelected] = useState<Badge | null>(null)

  if (user === undefined || badges === undefined) {
    return (
      <View style={[s.center, { backgroundColor: BG }]}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    )
  }

  const unlockedCount = badges.filter((b) => b.unlocked).length

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView contentContainerStyle={{ paddingTop: top + 24, paddingBottom: 48 }}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Mes Badges</Text>
          <View style={s.progressPill}>
            <Text style={s.progressText}>{unlockedCount} / {badges.length} débloqués</Text>
          </View>
        </View>

        {/* Grid */}
        <BadgeGrid badges={badges} onPress={setSelected} />
      </ScrollView>

      {/* Modal */}
      {selected && (
        <BadgeModal badge={selected} onClose={() => setSelected(null)} />
      )}
    </View>
  )
}

/* ─── Grid ─── */
function BadgeGrid({ badges, onPress }: { badges: Badge[]; onPress: (b: Badge) => void }) {
  const { width } = useWindowDimensions()
  const cardWidth = (width - 48) / 2  // 16 padding each side + 16 gap

  return (
    <View style={s.grid}>
      {badges.map((badge) => (
        <TouchableOpacity
          key={badge.id}
          onPress={() => onPress(badge)}
          activeOpacity={0.8}
          style={[s.card, { width: cardWidth }, !badge.unlocked && s.cardLocked]}
        >
          <Text style={s.cardEmoji}>{badge.emoji}</Text>
          <Text style={[s.cardTitle, !badge.unlocked && { color: INK_LIGHT }]}>{badge.title}</Text>
          <Text style={s.cardDesc}>{badge.desc}</Text>
          <View style={[s.pill, badge.unlocked ? s.pillUnlocked : s.pillLocked]}>
            <Text style={[s.pillText, badge.unlocked ? s.pillTextUnlocked : s.pillTextLocked]}>
              {badge.unlocked ? '✓ DÉBLOQUÉ' : '🔒 VERROUILLÉ'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

/* ─── Modal ─── */
function BadgeModal({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  const benefits = BADGE_BENEFITS[badge.id] ?? []

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay}>
          <TouchableWithoutFeedback>
            <View style={[s.sheet, !badge.unlocked && s.sheetLocked]}>

              {/* Close */}
              <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={s.closeX}>✕</Text>
              </TouchableOpacity>

              {/* Emoji */}
              <View style={[s.emojiRing, badge.unlocked ? s.emojiRingUnlocked : s.emojiRingLocked]}>
                <Text style={s.modalEmoji}>{badge.emoji}</Text>
              </View>

              {/* Status */}
              <View style={[s.statusPill, badge.unlocked ? s.statusUnlocked : s.statusLocked]}>
                <Text style={[s.statusText, badge.unlocked ? s.statusTextUnlocked : s.statusTextLocked]}>
                  {badge.unlocked ? '✦ DÉBLOQUÉ' : '🔒 VERROUILLÉ'}
                </Text>
              </View>

              {/* Title + desc */}
              <Text style={s.modalTitle}>{badge.title}</Text>
              <Text style={s.modalDesc}>{badge.desc}</Text>

              {/* Divider */}
              <View style={s.divider} />

              {/* Benefits */}
              <Text style={s.benefitsLabel}>
                {badge.unlocked ? 'Vos avantages' : 'Avantages à débloquer'}
              </Text>
              <View style={s.benefitsList}>
                {benefits.map((b, i) => (
                  <View
                    key={i}
                    style={[s.benefitRow, !badge.unlocked && s.benefitRowLocked]}
                  >
                    <Text style={s.benefitIcon}>{b.icon}</Text>
                    <Text style={[s.benefitText, !badge.unlocked && { color: INK_LIGHT }]}>
                      {b.text}
                    </Text>
                    {!badge.unlocked && (
                      <Text style={{ fontSize: 12, color: INK_LIGHT }}>🔒</Text>
                    )}
                  </View>
                ))}
              </View>

              {/* CTA if locked */}
              {!badge.unlocked && (
                <View style={s.lockedHint}>
                  <Text style={s.lockedHintText}>
                    Complétez la condition pour débloquer ces avantages.
                  </Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: { paddingHorizontal: 20, marginBottom: 20, gap: 8 },
  title: { fontSize: 30, fontWeight: '700', color: INK, letterSpacing: -0.5 },
  progressPill: {
    backgroundColor: TEAL_BG,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: TEAL_BRD,
  },
  progressText: { fontSize: 12, fontWeight: '600', color: TEAL },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardLocked: { opacity: 0.55 },
  cardEmoji: { fontSize: 44, lineHeight: 54, textAlign: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: INK, textAlign: 'center' },
  cardDesc: { fontSize: 11, color: INK_LIGHT, textAlign: 'center', lineHeight: 15 },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  pillUnlocked: { backgroundColor: TEAL },
  pillLocked: { backgroundColor: 'rgba(26,22,18,0.07)' },
  pillText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  pillTextUnlocked: { color: 'white' },
  pillTextLocked: { color: INK_LIGHT },

  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.72)',
    justifyContent: 'flex-end',
  },

  // Sheet
  sheet: {
    backgroundColor: '#FAFAF8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 28,
    paddingBottom: 44,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 0,
    borderTopWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },
  sheetLocked: { borderColor: BORDER },

  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26,22,18,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: { fontSize: 13, color: INK_LIGHT, fontWeight: '600' },

  // Emoji ring
  emojiRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
  },
  emojiRingUnlocked: {
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderColor: 'rgba(201,168,76,0.4)',
  },
  emojiRingLocked: {
    backgroundColor: 'rgba(26,22,18,0.04)',
    borderColor: BORDER,
  },
  modalEmoji: { fontSize: 52 },

  // Status pill
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 10,
  },
  statusUnlocked: { backgroundColor: 'rgba(201,168,76,0.12)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)' },
  statusLocked: { backgroundColor: 'rgba(26,22,18,0.06)', borderWidth: 1, borderColor: BORDER },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  statusTextUnlocked: { color: GOLD },
  statusTextLocked: { color: INK_LIGHT },

  // Modal text
  modalTitle: { fontSize: 22, fontWeight: '800', color: INK, textAlign: 'center', marginBottom: 4 },
  modalDesc: { fontSize: 13, color: INK_LIGHT, textAlign: 'center', lineHeight: 19 },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(26,22,18,0.07)',
    marginVertical: 20,
  },

  // Benefits
  benefitsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: INK_LIGHT,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  benefitsList: { width: '100%', gap: 10 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42,143,160,0.06)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  benefitRowLocked: { backgroundColor: 'rgba(26,22,18,0.04)' },
  benefitIcon: { fontSize: 18 },
  benefitText: { flex: 1, fontSize: 13, color: INK, lineHeight: 18, fontWeight: '500' },

  // Locked hint
  lockedHint: {
    marginTop: 16,
    backgroundColor: 'rgba(26,22,18,0.05)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
  },
  lockedHintText: { fontSize: 12, color: INK_LIGHT, textAlign: 'center', lineHeight: 18 },
})
