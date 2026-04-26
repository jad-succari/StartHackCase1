import React, { useRef, useState } from 'react'
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native'
import { useMutation, useQuery } from 'convex/react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

const TEAL      = '#2A8FA0'
const TEAL_BG   = 'rgba(42,143,160,0.07)'
const TEAL_BRD  = 'rgba(42,143,160,0.35)'
const GOLD      = '#C9A84C'
const GOLD_BG   = 'rgba(201,168,76,0.08)'
const GOLD_BRD  = 'rgba(201,168,76,0.25)'
const INK       = '#1A1612'
const INK_MID   = '#6B5E52'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const BORDER    = 'rgba(26,22,18,0.08)'
const WHITE     = '#FFFFFF'

type SubTab = 'profile' | 'family' | 'badges'

type FamilyMember = {
  memberId: Id<'familyMembers'>
  userId: Id<'users'>
  name: string
  greenTokensBalance: number
}

type FamilyDashboard = {
  pool: { _id: Id<'familyPools'>; name: string; ownerId: Id<'users'> }
  isOwner: boolean
  members: FamilyMember[]
}

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
    { icon: '🎁', text: '+5 LAKE bonus on your next booking' },
    { icon: '⭐', text: 'Access to early bird offers' },
  ],
  ski: [
    { icon: '🎿', text: '10% discount on ski passes' },
    { icon: '🚡', text: 'Priority access to cable cars' },
    { icon: '🏂', text: 'Access to members-only slopes' },
  ],
  eco: [
    { icon: '🌱', text: '+15 LAKE bonus per eco-certified activity' },
    { icon: '♻️', text: 'Badge visible on your traveler profile' },
    { icon: '🌍', text: 'Exclusive sustainable experiences unlocked' },
  ],
  restaurant: [
    { icon: '👨‍🍳', text: "Chef's private menu access" },
    { icon: '🍷', text: 'Complimentary tasting at meal end' },
    { icon: '📅', text: 'Priority reservations on weekends' },
  ],
  transport: [
    { icon: '🚄', text: 'Free upgrade on regional trains' },
    { icon: '🎫', text: '24h unlimited pass on Jungfrau network' },
    { icon: '🛎️', text: 'Free hotel luggage service' },
  ],
  blazer: [
    { icon: '🗺️', text: 'Access to exclusive hiking trails' },
    { icon: '🏕️', text: 'Adventure kit at check-in' },
    { icon: '📸', text: 'Souvenir photo session included' },
  ],
  collector: [
    { icon: '🎁', text: 'Mystery LAKE bonus every week' },
    { icon: '🏷️', text: 'Exclusive partner discounts' },
    { icon: '🔑', text: 'Access to EtherLaken Collectors club' },
  ],
  legend: [
    { icon: '🏆', text: 'VIP access to Jungfrau events' },
    { icon: '🎖️', text: 'EtherLaken ambassador status' },
    { icon: '💎', text: 'Dedicated personal concierge' },
  ],
  spender: [
    { icon: '💰', text: '5% cashback in LAKE on every purchase' },
    { icon: '🛍️', text: 'Discounts at partner shops' },
    { icon: '🎪', text: 'First access to new offers' },
  ],
  summit: [
    { icon: '⛰️', text: 'Personal guide for mountain excursions' },
    { icon: '🏔️', text: 'Off-season summit access' },
    { icon: '🌄', text: 'Private sunrise tour on request' },
  ],
  vip: [
    { icon: '💎', text: '24/7 concierge service' },
    { icon: '🛡️', text: 'Priority support within 1 hour' },
    { icon: '🌟', text: 'Invitations to exclusive partner events' },
  ],
  explorer: [
    { icon: '🏅', text: 'Ambassador status — free annual pass' },
    { icon: '🌐', text: 'Access to all network destinations' },
    { icon: '🎗️', text: 'Name plaque at EtherLaken HQ' },
  ],
}

export default function ProfileScreen() {
  const { top } = useSafeAreaInsets()
  const user = useQuery(api.wallet.getUser)
  const [activeTab, setActiveTab] = useState<SubTab>('profile')

  if (user === undefined) {
    return (
      <View style={[s.center, { backgroundColor: BG }]}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    )
  }

  if (!user) {
    return (
      <View style={[s.center, { backgroundColor: BG, paddingHorizontal: 32 }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
        <Text style={{ fontSize: 16, color: INK_LIGHT, textAlign: 'center' }}>
          No user found. Load demo data from the Discover tab first.
        </Text>
      </View>
    )
  }

  const initials = user.name
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>

      {/* ── Profile header ── */}
      <View style={[s.header, { paddingTop: top + 16 }]}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <Text style={s.headerName}>{user.name}</Text>
        <View style={s.goldPill}>
          <Text style={s.goldPillText}>✦ Gold Member</Text>
        </View>

        {/* Sub-tabs */}
        <View style={s.subTabsRow}>
          {(['profile', 'family', 'badges'] as SubTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[s.subTab, activeTab === tab && s.subTabActive]}
              activeOpacity={0.7}
            >
              <Text style={[s.subTabText, activeTab === tab && s.subTabTextActive]}>
                {tab === 'profile' ? 'Profile' : tab === 'family' ? 'Family' : 'Badges'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === 'profile' && <ProfileContent user={user} />}
      {activeTab === 'family'  && <FamilyContent currentUserId={user._id} />}
      {activeTab === 'badges'  && <BadgesContent userId={user._id} />}
    </View>
  )
}

/* ─── Profile content ─────────────────────────────────────── */
function ProfileContent({ user }: { user: any }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 48 }}>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatCard icon="🌿" value={`${user.greenTokensBalance}`} label="LAKE Balance" color={TEAL} />
        <StatCard icon="⭐" value={`${user.weeklyScore ?? 0}`} label="Weekly Score" color={GOLD} />
      </View>

      {/* Referral code */}
      <View style={s.infoCard}>
        <Text style={s.infoLabel}>REFERRAL CODE</Text>
        <Text style={{ fontFamily: 'Courier New', fontSize: 24, fontWeight: '700', color: TEAL, letterSpacing: 2 }}>
          {user.referralCode ?? '—'}
        </Text>
        <Text style={{ fontSize: 12, color: INK_LIGHT, lineHeight: 18 }}>
          Share this code with family and friends to join your pool automatically.
        </Text>
      </View>

      {/* Account details */}
      <View style={s.infoCard}>
        <Text style={s.infoLabel}>ACCOUNT DETAILS</Text>
        <View style={s.infoRow}>
          <Text style={s.infoKey}>Name</Text>
          <Text style={s.infoValue}>{user.name}</Text>
        </View>
        {!!user.email && (
          <View style={s.infoRow}>
            <Text style={s.infoKey}>Email</Text>
            <Text style={s.infoValue}>{user.email}</Text>
          </View>
        )}
        <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={s.infoKey}>Member type</Text>
          <Text style={s.infoValue}>{user.isTourist ? 'Tourist' : 'Partner'}</Text>
        </View>
      </View>

      {/* Wallet address */}
      {!!user.safeAddress && (
        <View style={s.infoCard}>
          <Text style={s.infoLabel}>GNOSIS SAFE ADDRESS</Text>
          <Text style={{ fontFamily: 'Courier New', fontSize: 11, color: INK_MID, letterSpacing: 0.3, lineHeight: 16 }} numberOfLines={2}>
            {user.safeAddress}
          </Text>
        </View>
      )}

      {/* Gold status card */}
      <View style={[s.infoCard, { backgroundColor: '#111111', borderColor: 'rgba(201,168,76,0.18)' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 10, color: 'rgba(201,168,76,0.5)', letterSpacing: 1.5, fontWeight: '600', textTransform: 'uppercase' }}>
              Status
            </Text>
            <Text style={{ fontFamily: 'Georgia', fontSize: 20, color: GOLD, marginTop: 4 }}>Gold Member</Text>
          </View>
          <View style={{ backgroundColor: GOLD_BG, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: GOLD_BRD }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 0.8 }}>✦ ACTIVE</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <View style={{
      flex: 1, backgroundColor: WHITE, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: BORDER, alignItems: 'center', gap: 4,
      shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    }}>
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <Text style={{ fontSize: 22, fontWeight: '700', color }}>{value}</Text>
      <Text style={{ fontSize: 11, color: INK_LIGHT, textAlign: 'center' }}>{label}</Text>
    </View>
  )
}

/* ─── Family content ──────────────────────────────────────── */
function FamilyContent({ currentUserId }: { currentUserId: Id<'users'> }) {
  const dashboard    = useQuery(api.family.getFamilyDashboard, { userId: currentUserId })
  const seedDemo     = useMutation(api.family.seedFamilyDemo)
  const transferTokens = useMutation(api.family.transferTokens)
  const [seeding, setSeeding]       = useState(false)
  const [selectedId, setSelectedId] = useState<Id<'users'> | null>(null)
  const [amount, setAmount]         = useState('')
  const [busy, setBusy]             = useState(false)
  const [errorMsg, setErrorMsg]     = useState('')

  const toastY = useRef(new Animated.Value(-400)).current
  const showToast = () => {
    Animated.sequence([
      Animated.timing(toastY, { toValue: 0,    duration: 280, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastY, { toValue: -400, duration: 280, useNativeDriver: true }),
    ]).start()
  }

  if (dashboard === undefined) {
    return <View style={s.center}><ActivityIndicator size="large" color={TEAL} /></View>
  }

  if (!dashboard) {
    return (
      <View style={[s.center, { paddingHorizontal: 32 }]}>
        <Text style={{ fontSize: 52, marginBottom: 20 }}>👨‍👩‍👧‍👦</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: INK, textAlign: 'center', marginBottom: 12 }}>
          No family pool
        </Text>
        <Text style={{ fontSize: 14, color: INK_LIGHT, textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
          Use a family member's referral code to join their pool automatically.
        </Text>
        <TouchableOpacity
          onPress={async () => {
            setSeeding(true)
            try { await seedDemo({ ownerId: currentUserId }) }
            finally { setSeeding(false) }
          }}
          disabled={seeding}
          style={{ backgroundColor: TEAL, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, opacity: seeding ? 0.5 : 1 }}
          activeOpacity={0.8}
        >
          {seeding
            ? <ActivityIndicator color={WHITE} />
            : <Text style={{ color: WHITE, fontWeight: '700', fontSize: 16 }}>🧪 Demo mode</Text>
          }
        </TouchableOpacity>
      </View>
    )
  }

  const db          = dashboard as FamilyDashboard
  const totalGT     = db.members.reduce((s, m) => s + m.greenTokensBalance, 0)
  const others      = db.members.filter((m) => m.userId !== currentUserId)
  const myBalance   = db.members.find((m) => m.userId === currentUserId)?.greenTokensBalance ?? 0
  const canSend     = !!selectedId && amount.length > 0 && !busy

  const handleTransfer = async () => {
    if (!selectedId) return
    const n = parseInt(amount, 10)
    if (isNaN(n) || n <= 0) return
    if (n > myBalance) { setErrorMsg(`Insufficient balance — you only have ${myBalance} LAKE`); return }
    setErrorMsg('')
    setBusy(true)
    try {
      await transferTokens({ fromUserId: currentUserId, toUserId: selectedId, amount: n })
      setAmount('')
      setSelectedId(null)
      showToast()
    } catch (e: any) {
      setErrorMsg(e.message ?? 'An error occurred')
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[s.toast, { transform: [{ translateY: toastY }] }]} pointerEvents="none">
        <Text style={{ color: WHITE, fontWeight: '700', fontSize: 15 }}>✅ LAKE sent!</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Pool card */}
        <View style={{ backgroundColor: TEAL, margin: 16, borderRadius: 20, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: WHITE, flex: 1 }}>{db.pool.name}</Text>
            {db.isOwner && <Text style={{ fontSize: 22 }}>👑</Text>}
          </View>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>
            {db.members.length} member{db.members.length !== 1 ? 's' : ''}
          </Text>
          <Text style={{ fontSize: 44, fontWeight: '800', color: WHITE, textAlign: 'center' }}>{totalGT}</Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 2 }}>LAKE total</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 2 }}>
            distributed among members
          </Text>
        </View>

        <Text style={s.sectionLabel}>MEMBERS</Text>

        {db.members.map((member) => {
          const isMe = member.userId === currentUserId
          return (
            <View key={member.memberId} style={s.memberCard}>
              <View style={s.memberAvatar}>
                <Text style={{ color: WHITE, fontWeight: '700', fontSize: 18 }}>
                  {member.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: INK }}>{member.name}</Text>
                  {isMe && (
                    <View style={{ borderWidth: 1, borderColor: TEAL, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: TEAL }}>You</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: INK_MID }}>
                  🌿 {member.greenTokensBalance} LAKE
                </Text>
              </View>
            </View>
          )
        })}

        {others.length > 0 && (
          <View style={s.transferCard}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: INK, marginBottom: 12 }}>Send LAKE</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 2 }}>
                {others.map((m) => {
                  const sel = selectedId === m.userId
                  return (
                    <TouchableOpacity
                      key={m.userId}
                      onPress={() => setSelectedId(sel ? null : m.userId)}
                      style={[s.chip, sel && s.chipSelected]}
                      activeOpacity={0.75}
                    >
                      <Text style={[s.chipText, sel && s.chipTextSelected]}>
                        {m.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </ScrollView>

            {/* Quick amounts */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {[10, 20, 50, 100].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setAmount(String(n))}
                  style={[s.quickAmount, amount === String(n) && s.quickAmountSelected]}
                  activeOpacity={0.75}
                >
                  <Text style={[{ fontSize: 14, fontWeight: '600', color: INK }, amount === String(n) && { color: WHITE }]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <TextInput
                value={amount}
                onChangeText={(v) => { setAmount(v); if (errorMsg) setErrorMsg('') }}
                keyboardType="numeric"
                placeholder="Amount in LAKE"
                placeholderTextColor="#9CA3AF"
                style={[s.input, !!errorMsg && { borderColor: '#FCA5A5' }]}
              />
              <TouchableOpacity
                onPress={() => void handleTransfer()}
                disabled={!canSend}
                style={[s.sendBtn, !canSend && { opacity: 0.4 }]}
                activeOpacity={0.8}
              >
                <Text style={{ color: WHITE, fontWeight: '700', fontSize: 15 }}>{busy ? '…' : 'Send'}</Text>
              </TouchableOpacity>
            </View>

            {!!errorMsg && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
                borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginTop: 10,
              }}>
                <Text style={{ fontSize: 16 }}>⚠️</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#DC2626', flex: 1 }}>{errorMsg}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

/* ─── Badges content ──────────────────────────────────────── */
function BadgesContent({ userId }: { userId: Id<'users'> }) {
  const { width }  = useWindowDimensions()
  const badges     = useQuery(api.wallet.getBadges, { userId })
  const [selected, setSelected] = useState<Badge | null>(null)

  if (badges === undefined) {
    return <View style={s.center}><ActivityIndicator size="large" color={TEAL} /></View>
  }

  const unlockedCount = badges.filter((b) => b.unlocked).length
  const cardWidth     = (width - 48) / 2

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 48 }}>

        <View style={{ paddingHorizontal: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: INK }}>My Badges</Text>
          <View style={{ backgroundColor: TEAL_BG, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: TEAL_BRD }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: TEAL }}>
              {unlockedCount} / {badges.length} unlocked
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, paddingHorizontal: 16 }}>
          {badges.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              onPress={() => setSelected(badge)}
              activeOpacity={0.8}
              style={[s.badgeCard, { width: cardWidth }, !badge.unlocked && { opacity: 0.55 }]}
            >
              <Text style={{ fontSize: 44, lineHeight: 54, textAlign: 'center' }}>{badge.emoji}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: badge.unlocked ? INK : INK_LIGHT, textAlign: 'center' }}>
                {badge.title}
              </Text>
              <Text style={{ fontSize: 11, color: INK_LIGHT, textAlign: 'center', lineHeight: 15 }}>{badge.desc}</Text>
              <View style={{
                borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4,
                backgroundColor: badge.unlocked ? TEAL : 'rgba(26,22,18,0.07)',
              }}>
                <Text style={{ fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: badge.unlocked ? WHITE : INK_LIGHT }}>
                  {badge.unlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selected && <BadgeModal badge={selected} onClose={() => setSelected(null)} />}
    </View>
  )
}

function BadgeModal({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  const benefits = BADGE_BENEFITS[badge.id] ?? []

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(10,10,10,0.72)', justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback>
            <View style={[s.modalSheet, { borderTopColor: badge.unlocked ? 'rgba(201,168,76,0.3)' : BORDER }]}>

              <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={{ fontSize: 13, color: INK_LIGHT, fontWeight: '600' }}>✕</Text>
              </TouchableOpacity>

              <View style={[
                s.emojiRing,
                badge.unlocked
                  ? { backgroundColor: 'rgba(201,168,76,0.08)', borderColor: 'rgba(201,168,76,0.4)' }
                  : { backgroundColor: 'rgba(26,22,18,0.04)', borderColor: BORDER },
              ]}>
                <Text style={{ fontSize: 52 }}>{badge.emoji}</Text>
              </View>

              <View style={[
                { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 10 },
                badge.unlocked
                  ? { backgroundColor: 'rgba(201,168,76,0.12)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)' }
                  : { backgroundColor: 'rgba(26,22,18,0.06)', borderWidth: 1, borderColor: BORDER },
              ]}>
                <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: badge.unlocked ? GOLD : INK_LIGHT }}>
                  {badge.unlocked ? '✦ UNLOCKED' : '🔒 LOCKED'}
                </Text>
              </View>

              <Text style={{ fontSize: 22, fontWeight: '800', color: INK, textAlign: 'center', marginBottom: 4 }}>
                {badge.title}
              </Text>
              <Text style={{ fontSize: 13, color: INK_LIGHT, textAlign: 'center', lineHeight: 19 }}>{badge.desc}</Text>

              <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(26,22,18,0.07)', marginVertical: 20 }} />

              <Text style={{ fontSize: 11, fontWeight: '700', color: INK_LIGHT, letterSpacing: 1.2, textTransform: 'uppercase', alignSelf: 'flex-start', marginBottom: 12 }}>
                {badge.unlocked ? 'Your benefits' : 'Benefits to unlock'}
              </Text>

              <View style={{ width: '100%', gap: 10 }}>
                {benefits.map((b, i) => (
                  <View key={i} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14,
                    backgroundColor: badge.unlocked ? 'rgba(42,143,160,0.06)' : 'rgba(26,22,18,0.04)',
                  }}>
                    <Text style={{ fontSize: 18 }}>{b.icon}</Text>
                    <Text style={{ flex: 1, fontSize: 13, color: badge.unlocked ? INK : INK_LIGHT, lineHeight: 18, fontWeight: '500' }}>
                      {b.text}
                    </Text>
                    {!badge.unlocked && <Text style={{ fontSize: 12, color: INK_LIGHT }}>🔒</Text>}
                  </View>
                ))}
              </View>

              {!badge.unlocked && (
                <View style={{ marginTop: 16, backgroundColor: 'rgba(26,22,18,0.05)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, width: '100%' }}>
                  <Text style={{ fontSize: 12, color: INK_LIGHT, textAlign: 'center', lineHeight: 18 }}>
                    Complete the condition to unlock these benefits.
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

  header: {
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingBottom: 0,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    shadowColor: INK,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: INK, shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 6 },
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: WHITE },
  headerName: { fontSize: 22, fontWeight: '700', color: INK, marginBottom: 8 },

  goldPill: {
    backgroundColor: GOLD_BG,
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: GOLD_BRD, marginBottom: 20,
  },
  goldPillText: { fontSize: 12, fontWeight: '700', color: GOLD, letterSpacing: 0.5 },

  subTabsRow: {
    flexDirection: 'row', width: '100%',
    borderTopWidth: 1, borderTopColor: BORDER,
  },
  subTab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  subTabActive: { borderBottomColor: TEAL },
  subTabText: { fontSize: 13, fontWeight: '600', color: INK_LIGHT },
  subTabTextActive: { color: TEAL },

  infoCard: {
    backgroundColor: WHITE, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: BORDER, gap: 8,
    shadowColor: INK, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  infoLabel: {
    fontSize: 10, fontWeight: '700', color: INK_LIGHT,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  infoKey: { fontSize: 13, color: INK_LIGHT },
  infoValue: { fontSize: 13, fontWeight: '600', color: INK },

  toast: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: '#059669', paddingVertical: 14, alignItems: 'center',
  },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: INK_LIGHT, letterSpacing: 1.5,
    marginHorizontal: 16, marginTop: 20, marginBottom: 10,
  },

  memberCard: {
    backgroundColor: WHITE, borderRadius: 16,
    marginHorizontal: 16, marginBottom: 10, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: INK, shadowOpacity: 0.09, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  memberAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: INK, alignItems: 'center', justifyContent: 'center',
  },

  transferCard: {
    backgroundColor: WHITE, borderRadius: 20,
    marginHorizontal: 16, marginTop: 8, padding: 20,
    shadowColor: INK, shadowOpacity: 0.09, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },

  chip: { backgroundColor: 'rgba(26,22,18,0.06)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: BORDER },
  chipSelected: { backgroundColor: INK, borderColor: INK },
  chipText: { fontSize: 14, fontWeight: '500', color: INK_MID },
  chipTextSelected: { color: WHITE, fontWeight: '700' },

  quickAmount: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: BORDER, backgroundColor: WHITE,
  },
  quickAmountSelected: { backgroundColor: INK, borderColor: INK },

  input: {
    flex: 1, height: 48, borderRadius: 12,
    borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 16, fontSize: 15, color: INK,
  },
  sendBtn: {
    height: 48, borderRadius: 12, backgroundColor: INK,
    paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center',
  },

  badgeCard: {
    backgroundColor: WHITE, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER, padding: 16,
    alignItems: 'center', gap: 6,
    shadowColor: INK, shadowOpacity: 0.09, shadowRadius: 18, shadowOffset: { width: 0, height: 5 }, elevation: 2,
  },

  modalSheet: {
    backgroundColor: '#FAFAF8',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingTop: 28, paddingBottom: 44, paddingHorizontal: 28,
    alignItems: 'center', borderTopWidth: 1,
  },
  closeBtn: {
    position: 'absolute', top: 20, right: 24,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(26,22,18,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  emojiRing: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 2,
  },
})
