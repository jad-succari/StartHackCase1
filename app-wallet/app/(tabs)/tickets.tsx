import { useState } from 'react'
import { Alert, Image, View } from 'react-native'
import { useMutation, useQuery } from 'convex/react'
import QRCode from 'react-native-qrcode-svg'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Button, ScrollView, Spinner, Text, XStack, YStack } from 'tamagui'

const TEAL      = '#2A8FA0'
const INK       = '#1A1612'
const INK_MID   = '#6B5E52'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const RAISED    = '#F2EEE9'
const BORDER    = 'rgba(26,22,18,0.08)'
const RED       = '#C62828'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500&q=80'

export default function TicketsScreen() {
  const user = useQuery(api.wallet.getUser)
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
      console.error('Cancel ticket error:', err)
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
        <Text style={{ fontSize: 48 }}>🎫</Text>
        <Text style={{ textAlign: 'center' }} color={INK_LIGHT} fontSize="$4">
          No active tickets
        </Text>
      </YStack>
    )
  }

  const validCount = tickets.filter((t) => t.status === 'valide').length

  return (
    <ScrollView backgroundColor={BG}>
      <YStack padding="$4" gap="$4" paddingTop="$10" paddingBottom="$10">

        {/* Header */}
        <YStack gap="$1" paddingBottom="$1">
          <Text fontSize={32} fontWeight="400" color={INK} style={{ letterSpacing: -0.5, lineHeight: 36 }}>
            My Tickets
          </Text>
          <Text color={INK_LIGHT} fontSize="$3">
            {validCount} valid ticket{validCount !== 1 ? 's' : ''} · available in Wallet
          </Text>
        </YStack>

        {tickets.map((ticket) => {
          const isValide     = ticket.status === 'valide'
          const isCancelling = cancellingId === ticket._id
          const isConfirming = confirmingId === ticket._id

          return (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              isValide={isValide}
              isCancelling={isCancelling}
              isConfirming={isConfirming}
              onConfirm={() => setConfirmingId(ticket._id)}
              onCancelConfirm={() => setConfirmingId(null)}
              onCancelDo={() => void doCancel(ticket._id)}
            />
          )
        })}
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
  validDate?: string // "YYYY-MM-DD"
}

type TicketCardProps = {
  ticket: Ticket
  isValide: boolean
  isCancelling: boolean
  isConfirming: boolean
  onConfirm: () => void
  onCancelConfirm: () => void
  onCancelDo: () => void
}

function TicketCard({
  ticket, isValide,
  isCancelling, isConfirming,
  onConfirm, onCancelConfirm, onCancelDo,
}: TicketCardProps) {
  const [showQR, setShowQR] = useState(false)
  const imgUri = ticket.imageUrl ?? FALLBACK_IMG

  return (
    <YStack
      backgroundColor="white"
      borderRadius="$7"
      borderWidth={1}
      borderColor={BORDER}
      overflow="hidden"
      marginBottom="$2"
      opacity={isValide ? 1 : 0.55}
      style={{
        shadowColor: '#1A1612',
        shadowOpacity: 0.09,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      {/* ── Photo header 140px ── */}
      <View style={{ height: 140, position: 'relative' }}>
        <Image
          source={{ uri: imgUri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* Scrim: transparent top → dark bottom */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10,8,6,0.18)',
        }} />
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 90,
          backgroundColor: 'rgba(10,8,6,0.58)',
        }} />

        {/* Status pill — top right */}
        <View style={{
          position: 'absolute', top: 12, right: 12,
          backgroundColor: isValide ? 'rgba(42,143,160,0.94)' : 'rgba(26,22,18,0.75)',
          borderRadius: 9999,
          paddingHorizontal: 13,
          paddingVertical: 6,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}>
          <Text style={{ fontSize: 11, color: 'white', lineHeight: 13 }}>
            {isValide ? '✓' : '◷'}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: 'white', letterSpacing: 0.8 }}>
            {isValide ? 'VALID' : 'EXPIRED'}
          </Text>
        </View>

        {/* Title + location — bottom left */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 14 }}>
          <Text style={{
            fontSize: 26, fontWeight: '600',
            color: '#FFFFFF', lineHeight: 30,
            textShadowColor: 'rgba(0,0,0,0.4)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 6,
          }}>
            {ticket.offerTitle}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>📍</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '500' }}>
              Jungfrau Region
            </Text>
          </View>
        </View>
      </View>

      {/* ── Info row ── */}
      <XStack backgroundColor="white" paddingHorizontal="$4" paddingVertical="$4">
        <InfoCell
          label="DATE"
          value={ticket.validDate
            ? (() => {
                const [y, m, d] = ticket.validDate!.split('-').map(Number)
                return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              })()
            : new Date(ticket.purchasedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          }
        />
        <View style={{ width: 1, backgroundColor: BORDER, marginHorizontal: 12 }} />
        <InfoCell
          label="TIME"
          value="09:00"
          valueColor={INK}
        />
        <View style={{ width: 1, backgroundColor: BORDER, marginHorizontal: 12 }} />
        <InfoCell
          label="COST"
          value={`${ticket.tokenCost} GT`}
          valueColor={isValide ? TEAL : INK_LIGHT}
        />
      </XStack>

      {/* ── QR code zone (togglable) ── */}
      {isValide && showQR && (
        <YStack
          backgroundColor={RAISED}
          paddingVertical="$5"
          paddingHorizontal="$4"
          style={{ alignItems: 'center' }}
          gap="$3"
        >
          <YStack
            backgroundColor="white"
            padding="$4"
            borderRadius="$5"
            borderWidth={1}
            borderColor={BORDER}
            style={{
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <QRCode value={ticket.externalTicketId} size={180} />
          </YStack>

          {/* Reference under QR */}
          <YStack style={{ alignItems: 'center' }} gap="$1">
            <Text
              fontSize={9} fontWeight="600" color={INK_LIGHT}
              style={{ letterSpacing: 1.2, textTransform: 'uppercase' }}
            >
              Reference
            </Text>
            <Text fontSize="$3" color={INK_MID} fontWeight="500" style={{ letterSpacing: 0.5 }}>
              {ticket.externalTicketId}
            </Text>
          </YStack>
        </YStack>
      )}

      {/* ── QR toggle + cancel ── */}
      <YStack
        backgroundColor="white"
        paddingHorizontal="$4"
        paddingVertical="$3"
        gap="$2"
        borderTopWidth={1}
        borderTopColor={BORDER}
      >
        {/* QR toggle button */}
        {isValide && !isCancelling && !isConfirming && (
          <Button
            size="$4"
            borderRadius="$5"
            borderWidth={1.5}
            borderColor={showQR ? 'rgba(42,143,160,0.35)' : TEAL}
            backgroundColor={showQR ? 'rgba(42,143,160,0.07)' : 'white'}
            onPress={() => setShowQR((v) => !v)}
          >
            <Text
              color={TEAL}
              fontWeight="600"
              fontSize="$3"
            >
              {showQR ? '▲  Hide QR Code' : '▼  Show QR Code'}
            </Text>
          </Button>
        )}

        {/* Cancel button */}
        {isValide && !isCancelling && !isConfirming && (
          <Button
            size="$3"
            borderRadius="$4"
            borderWidth={1}
            borderColor="rgba(198,40,40,0.3)"
            backgroundColor="white"
            onPress={onConfirm}
          >
            <Text color={RED} fontWeight="500" fontSize="$3">Cancel booking</Text>
          </Button>
        )}

        {isConfirming && (
          <YStack gap="$2">
            <Text fontSize="$3" color={INK_LIGHT} style={{ textAlign: 'center' }}>
              Cancel? Tokens will be refunded.
            </Text>
            <XStack gap="$2">
              <Button
                flex={1} size="$3" borderRadius="$4"
                borderWidth={1} borderColor={BORDER}
                backgroundColor="white"
                onPress={onCancelConfirm}
              >
                <Text color={INK_LIGHT} fontWeight="600" fontSize="$3">Keep it</Text>
              </Button>
              <Button
                flex={1} size="$3" borderRadius="$4"
                backgroundColor={RED}
                onPress={onCancelDo}
              >
                <Text color="white" fontWeight="700" fontSize="$3">Yes, cancel</Text>
              </Button>
            </XStack>
          </YStack>
        )}

        {isCancelling && (
          <YStack style={{ alignItems: 'center' }} padding="$2" gap="$2">
            <Spinner size="small" color={RED} />
            <Text fontSize="$3" color={INK_LIGHT}>Cancelling...</Text>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}

function InfoCell({
  label, value, valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <YStack flex={1} gap="$1">
      <Text
        fontSize={10}
        fontWeight="600"
        color={INK_LIGHT}
        style={{ letterSpacing: 1, textTransform: 'uppercase' }}
      >
        {label}
      </Text>
      <Text
        fontSize="$4"
        fontWeight="600"
        color={valueColor ?? INK}
        style={{ lineHeight: 20 }}
      >
        {value}
      </Text>
    </YStack>
  )
}
