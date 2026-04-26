import { useState } from 'react'
import { Alert, TouchableOpacity, View } from 'react-native'
import { useMutation, useQuery } from 'convex/react'
import QRCode from 'react-native-qrcode-svg'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { ScrollView, Spinner, Text, YStack } from 'tamagui'

const TEAL      = '#2A8FA0'
const TEAL_BG   = 'rgba(42,143,160,0.11)'
const TEAL_BRD  = 'rgba(42,143,160,0.28)'
const INK       = '#1A1612'
const INK_MID   = '#6B5E52'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const RAISED    = '#F2EEE9'
const BORDER    = 'rgba(26,22,18,0.08)'
const RED       = '#C62828'
const DARK_STUB = '#0D0D0D'

export default function TicketsScreen() {
  const user       = useQuery(api.wallet.getUser)
  const allTickets = useQuery(
    api.wallet.getUserTickets,
    user ? { userId: user._id } : 'skip'
  )
  const cancelTicket = useMutation(api.wallet.cancelTicket)
  const [cancellingId, setCancellingId] = useState<Id<'tickets'> | null>(null)
  const [confirmingId, setConfirmingId] = useState<Id<'tickets'> | null>(null)

  const tickets = allTickets?.filter((t) => t.status !== 'annulé')

  const doCancel = async (ticketId: Id<'tickets'>) => {
    setConfirmingId(null)
    setCancellingId(ticketId)
    try {
      await cancelTicket({ ticketId })
    } catch (err) {
      Alert.alert('Error', (err as Error).message)
    } finally {
      setCancellingId(null)
    }
  }

  if (user === undefined || allTickets === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} gap="$3" backgroundColor={BG}>
        <Spinner size="large" color={TEAL} />
        <Text color={INK_LIGHT} fontSize="$4">Loading...</Text>
      </YStack>
    )
  }

  if (!tickets || tickets.length === 0) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} padding="$6" gap="$3" backgroundColor={BG}>
        <Text style={{ fontSize: 52 }}>🎫</Text>
        <Text style={{ fontFamily: 'Georgia', fontSize: 22, color: INK, textAlign: 'center' }}>No tickets yet</Text>
        <Text style={{ textAlign: 'center', fontSize: 14, color: INK_LIGHT, lineHeight: 20 }}>
          Book an offer or activity from the Discover tab.
        </Text>
      </YStack>
    )
  }

  const validCount = tickets.filter((t) => t.status === 'valide').length
  const usedCount  = tickets.filter((t) => t.status === 'utilisé' || t.status === 'used').length

  return (
    <ScrollView backgroundColor={BG}>
      <YStack padding="$4" paddingTop="$12" paddingBottom="$10" gap="$5">

        {/* ── Header ── */}
        <YStack gap="$1" paddingBottom="$1">
          <Text style={{ fontFamily: 'Georgia', fontSize: 32, color: INK, letterSpacing: -0.5, lineHeight: 36 }}>
            My Tickets
          </Text>
          <Text style={{ fontSize: 13, color: INK_LIGHT }}>
            {validCount} valid{validCount !== 1 ? '' : ''}
            {usedCount > 0 ? ` · ${usedCount} used` : ''}
            {' · '}Single-use QR code
          </Text>
        </YStack>

        {tickets.map((ticket) => (
          <TicketCard
            key={ticket._id}
            ticket={ticket}
            isValide={ticket.status === 'valide'}
            isCancelling={cancellingId === ticket._id}
            isConfirming={confirmingId === ticket._id}
            onConfirm={() => setConfirmingId(ticket._id)}
            onCancelConfirm={() => setConfirmingId(null)}
            onCancelDo={() => void doCancel(ticket._id)}
          />
        ))}
      </YStack>
    </ScrollView>
  )
}

type Ticket = {
  _id: Id<'tickets'>
  offerTitle: string
  tokenCost: number
  imageUrl?: string | null
  externalTicketId: string
  purchasedAt: number
  status: string
  validDate?: string
}

function TicketCard({
  ticket, isValide,
  isCancelling, isConfirming,
  onConfirm, onCancelConfirm, onCancelDo,
}: {
  ticket: Ticket
  isValide: boolean
  isCancelling: boolean
  isConfirming: boolean
  onConfirm: () => void
  onCancelConfirm: () => void
  onCancelDo: () => void
}) {
  const [showQR, setShowQR] = useState(false)
  const isUsed = ticket.status === 'utilisé' || ticket.status === 'used'

  const dateLabel = ticket.validDate
    ? (() => {
        const [y, m, d] = ticket.validDate!.split('-').map(Number)
        return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      })()
    : new Date(ticket.purchasedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isValide ? TEAL_BRD : BORDER,
      opacity: isValide ? 1 : 0.6,
      shadowColor: INK,
      shadowOpacity: isValide ? 0.14 : 0.05,
      shadowRadius: 36,
      shadowOffset: { width: 0, height: 12 },
      elevation: 5,
    }}>

      {/* ── Header zone — teal wash only for valid tickets ── */}
      <View style={{ backgroundColor: isValide ? TEAL_BG : 'rgba(26,22,18,0.04)', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18 }}>

        {/* Top row: brand label + status pill + ticket icon */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>

          <View style={{ gap: 8 }}>
            {/* Brand label */}
            <Text style={{
              fontSize: 9, fontWeight: '800', color: TEAL,
              letterSpacing: 2.5, textTransform: 'uppercase',
            }}>
              EtherLaken · Jungfrau
            </Text>
            {/* Status pill */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
              borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
              backgroundColor: isValide ? TEAL : 'rgba(26,22,18,0.06)',
              borderWidth: 1,
              borderColor: isValide ? TEAL : BORDER,
            }}>
              <Text style={{
                fontSize: 11, fontWeight: '800', letterSpacing: 0.6,
                color: isValide ? 'white' : INK_LIGHT,
              }}>
                {isValide ? '✓  VALID' : isUsed ? '✓  USED' : '◷  EXPIRED'}
              </Text>
            </View>
          </View>

          {/* Ticket icon circle */}
          <View style={{
            width: 54, height: 54, borderRadius: 27,
            backgroundColor: isValide ? TEAL : 'rgba(26,22,18,0.05)',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: isValide ? 'rgba(42,143,160,0.5)' : BORDER,
            shadowColor: isValide ? TEAL : INK,
            shadowOpacity: isValide ? 0.25 : 0.04,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
          }}>
            <Text style={{ fontSize: 24 }}>🎫</Text>
          </View>
        </View>

        {/* Offer title */}
        <Text style={{
          fontFamily: 'Georgia', fontSize: 22, color: INK,
          lineHeight: 28, letterSpacing: -0.3, marginBottom: 5,
        }}>
          {ticket.offerTitle}
        </Text>
        <Text style={{ fontSize: 12, color: INK_MID, fontWeight: '500' }}>
          📍 Jungfrau Region · Switzerland
        </Text>
      </View>

      {/* ── Perforation line ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 24 }}>
        {/* Left notch — overflow:hidden clips to half-circle */}
        <View style={{
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: BG, marginLeft: -12,
          borderWidth: 1, borderColor: BORDER,
        }} />
        <View style={{
          flex: 1, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: BORDER,
        }} />
        {/* Right notch */}
        <View style={{
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: BG, marginRight: -12,
          borderWidth: 1, borderColor: BORDER,
        }} />
      </View>

      {/* ── Info zone ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18 }}>
        <View style={{ flexDirection: 'row' }}>
          <InfoCell label="DATE" value={dateLabel} />
          <View style={{ width: 1, backgroundColor: BORDER, marginHorizontal: 14 }} />
          <InfoCell label="TIME" value="09:00" />
          <View style={{ width: 1, backgroundColor: BORDER, marginHorizontal: 14 }} />
          <InfoCell label="COST" value={`${ticket.tokenCost} LAKE`} valueColor={isValide ? TEAL : INK_LIGHT} />
        </View>

        {/* Reference row */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16,
        }}>
          <Text style={{ fontSize: 9, color: 'rgba(26,22,18,0.20)', fontWeight: '700', letterSpacing: 1.2 }}>
            1× SINGLE USE
          </Text>
          <Text style={{
            fontFamily: 'Courier New', fontSize: 9, letterSpacing: 1.5, fontWeight: '600',
            color: 'rgba(26,22,18,0.20)',
          }}>
            {ticket.externalTicketId}
          </Text>
        </View>
      </View>

      {/* ── QR stub (dark) — only when open ── */}
      {isValide && showQR && (
        <View style={{ backgroundColor: DARK_STUB, paddingHorizontal: 24, paddingTop: 22, paddingBottom: 28, alignItems: 'center' }}>

          {/* Branded header inside stub */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            alignSelf: 'stretch', marginBottom: 22,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>⛰️</Text>
              <View>
                <Text style={{ fontFamily: 'Georgia', fontSize: 15, color: 'white', letterSpacing: -0.2 }}>
                  EtherLaken
                </Text>
                <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: 1.8, textTransform: 'uppercase' }}>
                  Jungfrau Region
                </Text>
              </View>
            </View>
            <View style={{
              borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
              backgroundColor: 'rgba(42,143,160,0.15)',
              borderWidth: 1, borderColor: 'rgba(42,143,160,0.35)',
            }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: TEAL, letterSpacing: 0.8 }}>✓ VALID</Text>
            </View>
          </View>

          {/* QR code — no overlay, must be fully readable */}
          <View style={{
            backgroundColor: 'white', padding: 14, borderRadius: 18,
            shadowColor: TEAL, shadowOpacity: 0.22, shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
          }}>
            <QRCode
              value={ticket.externalTicketId}
              size={200}
              color={INK}
              backgroundColor="white"
            />
          </View>

          {/* Scan instruction */}
          <Text style={{
            marginTop: 20, fontSize: 10, color: 'rgba(255,255,255,0.28)',
            letterSpacing: 2.5, fontWeight: '700', textTransform: 'uppercase',
          }}>
            Scan to validate
          </Text>
          <Text style={{
            fontFamily: 'Courier New', fontSize: 14, color: TEAL,
            fontWeight: '700', marginTop: 5, letterSpacing: 1.2,
          }}>
            {ticket.externalTicketId}
          </Text>
        </View>
      )}

      {/* ── Primary action: Reveal / Hide QR ── */}
      {isValide && !isCancelling && !isConfirming && (
        <>
          <TouchableOpacity
            onPress={() => setShowQR((v) => !v)}
            activeOpacity={0.88}
            style={{
              backgroundColor: showQR ? DARK_STUB : TEAL,
              paddingVertical: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Text style={{ fontSize: 18 }}>{showQR ? '✕' : '📲'}</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: 'white', letterSpacing: 0.2 }}>
              {showQR ? 'Hide QR Code' : 'Reveal QR Code'}
            </Text>
          </TouchableOpacity>

          {/* Cancel — subtle text link, only when QR is hidden */}
          {!showQR && (
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.7}
              style={{ paddingVertical: 11, alignItems: 'center', backgroundColor: 'white' }}
            >
              <Text style={{ fontSize: 12, color: 'rgba(198,40,40,0.55)', fontWeight: '500' }}>
                Cancel booking
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* ── Confirm cancel ── */}
      {isConfirming && (
        <View style={{ padding: 16, paddingTop: 14 }}>
          <Text style={{ fontSize: 13, color: INK_LIGHT, textAlign: 'center', marginBottom: 14, lineHeight: 20 }}>
            Cancel this booking?{'\n'}Tokens will be refunded to your wallet.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={onCancelConfirm}
              style={{
                flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center',
                backgroundColor: RAISED, borderWidth: 1, borderColor: BORDER,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: INK_MID }}>Keep it</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCancelDo}
              style={{ flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: RED }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: 'white' }}>Yes, cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Cancelling spinner ── */}
      {isCancelling && (
        <View style={{ padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <Spinner size="small" color={RED} />
          <Text style={{ fontSize: 13, color: INK_LIGHT }}>Cancelling...</Text>
        </View>
      )}
    </View>
  )
}

function InfoCell({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <YStack flex={1} gap="$1">
      <Text style={{ fontSize: 10, fontWeight: '700', color: INK_LIGHT, letterSpacing: 1.2, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: valueColor ?? INK, lineHeight: 21 }}>
        {value}
      </Text>
    </YStack>
  )
}
