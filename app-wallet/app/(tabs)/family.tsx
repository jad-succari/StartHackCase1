import React, { useRef, useState } from 'react'
import {
  Animated,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
} from 'react-native'
import { useMutation, useQuery } from 'convex/react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

const PRIMARY   = '#0D9488'
const DARK      = '#134E4A'
const BG        = '#F0FDFA'
const WHITE     = '#FFFFFF'
const GRAY_TEXT = '#6B7280'

type Member = {
  memberId: Id<'familyMembers'>
  userId: Id<'users'>
  name: string
  greenTokensBalance: number
}

type Dashboard = {
  pool: { _id: Id<'familyPools'>; name: string; ownerId: Id<'users'> }
  isOwner: boolean
  members: Member[]
}

export default function FamilyScreen() {
  const { top } = useSafeAreaInsets()
  const user = useQuery(api.wallet.getUser)
  const dashboard = useQuery(
    api.family.getFamilyDashboard,
    user ? { userId: user._id } : 'skip'
  )
  const seedFamilyDemo = useMutation(api.family.seedFamilyDemo)
  const [seeding, setSeeding] = useState(false)

  const handleSeedDemo = async () => {
    if (!user) return
    setSeeding(true)
    try {
      await seedFamilyDemo({ ownerId: user._id })
    } finally {
      setSeeding(false)
    }
  }

  if (user === undefined || dashboard === undefined) {
    return (
      <View style={[s.center, { backgroundColor: BG }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    )
  }

  if (!user) return null

  if (!dashboard) {
    return (
      <EmptyState onDemo={() => void handleSeedDemo()} loading={seeding} top={top} />
    )
  }

  return <FamilyDashboard dashboard={dashboard as Dashboard} currentUserId={user._id} top={top} />
}

/* ─── Empty state ─── */
function EmptyState({ onDemo, loading, top }: { onDemo: () => void; loading: boolean; top: number }) {
  return (
    <View style={[s.center, { backgroundColor: BG, paddingTop: top, paddingHorizontal: 32 }]}>
      <Text style={s.emptyEmoji}>👨‍👩‍👧‍👦</Text>
      <Text style={s.emptyTitle}>Aucune cagnotte familiale</Text>
      <Text style={s.emptyBody}>
        Utilisez le code de parrainage d'un membre de votre famille pour rejoindre sa cagnotte automatiquement.
      </Text>
      <TouchableOpacity
        onPress={onDemo}
        disabled={loading}
        style={[s.demoBtn, loading && { opacity: 0.5 }]}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator color={WHITE} />
          : <Text style={s.demoBtnText}>🧪 Mode démo</Text>
        }
      </TouchableOpacity>
    </View>
  )
}

/* ─── Dashboard ─── */
function FamilyDashboard({
  dashboard,
  currentUserId,
  top,
}: {
  dashboard: Dashboard
  currentUserId: Id<'users'>
  top: number
}) {
  const transferTokens = useMutation(api.family.transferTokens)
  const [selectedId, setSelectedId] = useState<Id<'users'> | null>(null)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const currentBalance = dashboard.members.find((m) => m.userId === currentUserId)?.greenTokensBalance ?? 0

  // Toast
  const toastY = useRef(new Animated.Value(-80)).current
  const showToast = () => {
    Animated.sequence([
      Animated.timing(toastY, { toValue: 0,   duration: 280, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastY, { toValue: -80, duration: 280, useNativeDriver: true }),
    ]).start()
  }

  const clearError = () => { if (errorMsg) setErrorMsg('') }

  const handleTransfer = async () => {
    if (!selectedId) return
    const n = parseInt(amount, 10)
    if (isNaN(n) || n <= 0) return

    if (n > currentBalance) {
      setErrorMsg(`Solde insuffisant — vous avez seulement ${currentBalance} LAKE`)
      return
    }

    setErrorMsg('')
    setBusy(true)
    try {
      await transferTokens({ fromUserId: currentUserId, toUserId: selectedId, amount: n })
      setAmount('')
      setSelectedId(null)
      showToast()
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Une erreur est survenue')
    } finally {
      setBusy(false)
    }
  }

  const totalGT = dashboard.members.reduce((sum, m) => sum + m.greenTokensBalance, 0)
  const others   = dashboard.members.filter((m) => m.userId !== currentUserId)
  const canSend  = !!selectedId && amount.length > 0 && !busy

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>

      {/* Toast */}
      <Animated.View
        style={[s.toast, { transform: [{ translateY: toastY }] }]}
        pointerEvents="none"
      >
        <Text style={s.toastText}>✅ LAKE envoyés !</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Header ── */}
        <View style={[s.header, { paddingTop: top + 24 }]}>
          <View style={s.headerRow}>
            <Text style={s.headerName}>{dashboard.pool.name}</Text>
            {dashboard.isOwner && <Text style={s.crown}>👑</Text>}
          </View>
          <Text style={s.headerMembers}>
            {dashboard.members.length} membre{dashboard.members.length !== 1 ? 's' : ''}
          </Text>
          <Text style={s.headerTotal}>{totalGT} LAKE</Text>
          <Text style={s.headerSub}>répartis entre les membres</Text>
        </View>

        {/* ── Members ── */}
        <Text style={s.sectionLabel}>MEMBRES</Text>

        {dashboard.members.map((member) => {
          const initial = member.name.charAt(0).toUpperCase()
          const isMe = member.userId === currentUserId
          return (
            <View key={member.memberId} style={s.memberCard}>
              <View style={s.avatar}>
                <Text style={s.avatarLetter}>{initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.nameRow}>
                  <Text style={s.memberName}>{member.name}</Text>
                  {isMe && (
                    <View style={s.youBadge}>
                      <Text style={s.youBadgeText}>Vous</Text>
                    </View>
                  )}
                </View>
                <Text style={s.memberBalance}>🌿 {member.greenTokensBalance} LAKE</Text>
              </View>
            </View>
          )
        })}

        {/* ── Transfer ── */}
        {others.length > 0 && (
          <View style={s.transferCard}>
            <Text style={s.transferTitle}>Envoyer des LAKE</Text>

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

            <View style={s.inputRow}>
              <TextInput
                value={amount}
                onChangeText={(v) => { setAmount(v); clearError() }}
                keyboardType="numeric"
                placeholder="Montant en LAKE"
                placeholderTextColor="#9CA3AF"
                style={[s.input, !!errorMsg && s.inputError]}
              />
              <TouchableOpacity
                onPress={() => void handleTransfer()}
                disabled={!canSend}
                style={[s.sendBtn, !canSend && s.sendBtnDisabled]}
                activeOpacity={0.8}
              >
                <Text style={s.sendBtnText}>{busy ? '…' : 'Envoyer'}</Text>
              </TouchableOpacity>
            </View>

            {!!errorMsg && (
              <View style={s.errorCard}>
                <Text style={s.errorIcon}>⚠️</Text>
                <Text style={s.errorText}>{errorMsg}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', textAlign: 'center', marginBottom: 12 },
  emptyBody: { fontSize: 14, color: GRAY_TEXT, textAlign: 'center', lineHeight: 22, marginBottom: 0 },
  demoBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
  },
  demoBtnText: { color: WHITE, fontWeight: '700', fontSize: 16 },

  // Toast
  toast: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#059669',
    paddingVertical: 14,
    alignItems: 'center',
  },
  toastText: { color: WHITE, fontWeight: '700', fontSize: 15 },

  // Header
  header: {
    backgroundColor: PRIMARY,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  headerName: { fontSize: 26, fontWeight: '800', color: WHITE, flex: 1 },
  crown: { fontSize: 22 },
  headerMembers: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  headerTotal: { fontSize: 48, fontWeight: '800', color: WHITE, textAlign: 'center' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 2 },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAY_TEXT,
    letterSpacing: 1.5,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },

  // Member card
  memberCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: WHITE, fontWeight: '700', fontSize: 18 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  memberName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  youBadge: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  youBadgeText: { fontSize: 10, fontWeight: '600', color: PRIMARY },
  memberBalance: { fontSize: 14, fontWeight: '600', color: DARK },

  // Transfer card
  transferCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  transferTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 12 },

  // Chips
  chip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipSelected: { backgroundColor: PRIMARY },
  chipText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  chipTextSelected: { color: WHITE, fontWeight: '700' },

  // Input row
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
  },
  sendBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: WHITE, fontWeight: '700', fontSize: 15 },

  // Error
  inputError: { borderColor: '#FCA5A5' },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  errorIcon: { fontSize: 16 },
  errorText: { fontSize: 13, fontWeight: '600', color: '#DC2626', flex: 1 },
})
