import { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import type { Id } from '../convex/_generated/dataModel'
import { ScrollView, Spinner, Text, XStack, YStack } from 'tamagui'

const INK       = '#1A1612'
const INK_MID   = '#6B5E52'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const TEAL      = '#2A8FA0'
const GOLD      = '#C9A84C'
const BORDER    = 'rgba(26,22,18,0.08)'
const RED       = '#B8362A'

type Step = 'confirm' | 'processing' | 'success' | 'error'

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shiftDate(str: string, days: number): string {
  const [y, m, d] = str.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDate(str: string): string {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'long', year: 'numeric',
  })
}

export default function BookOfferScreen() {
  const { offerId } = useLocalSearchParams<{ offerId: string }>()
  const user = useQuery(api.wallet.getUser)
  const offer = useQuery(
    api.wallet.getOffer,
    offerId ? { offerId: offerId as Id<'offers'> } : 'skip'
  )
  const bookOffer = useMutation(api.wallet.bookOffer)
  const [step, setStep] = useState<Step>('confirm')
  const [validDate, setValidDate] = useState(todayStr)

  const handleBook = async () => {
    if (!user || !offer) return
    setStep('processing')
    await new Promise((r) => setTimeout(r, 2000))
    try {
      await bookOffer({ userId: user._id, offerId: offer._id, validDate })
      setStep('success')
    } catch {
      setStep('error')
    }
  }

  if (user === undefined || offer === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} backgroundColor={BG}>
        <Spinner size="large" color={TEAL} />
      </YStack>
    )
  }

  const balance = user?.greenTokensBalance ?? 0
  const cost = offer?.tokenCost ?? 0
  const canAfford = balance >= cost
  const today = todayStr()
  const isToday = validDate === today

  return (
    <YStack style={{ flex: 1, backgroundColor: BG }}>

      {/* ── Header ── */}
      <YStack
        backgroundColor="#111111"
        paddingHorizontal="$5"
        paddingTop="$12"
        paddingBottom="$5"
        gap="$1"
      >
        {(step === 'confirm' || step === 'error') && (
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8, alignSelf: 'flex-start' }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3 }}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '400', color: 'white', letterSpacing: -0.5 }}>
          Book an offer
        </Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
          Balance: {balance} GT available
        </Text>
      </YStack>

      {/* ── Step 1: Confirmation ── */}
      {step === 'confirm' && offer && (
        <ScrollView>
          <YStack padding="$4" gap="$4" paddingBottom="$8">

            {/* Offer card */}
            <YStack
              backgroundColor="white"
              borderRadius="$5"
              borderWidth={1}
              borderColor={BORDER}
              overflow="hidden"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 3 },
              }}
            >
              <YStack padding="$4" gap="$2">
                <Text style={{ fontSize: 11, fontWeight: '600', color: INK_LIGHT, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Selected offer
                </Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: INK, lineHeight: 26 }}>
                  {offer.title}
                </Text>
                {offer.description ? (
                  <Text style={{ fontSize: 13, color: INK_MID, lineHeight: 20 }}>{offer.description}</Text>
                ) : null}
              </YStack>

              <XStack
                backgroundColor="#111111"
                paddingHorizontal="$4"
                paddingVertical="$4"
                justifyContent="space-between"
                style={{ alignItems: 'center' }}
              >
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5 }}>
                  Booking cost
                </Text>
                <YStack style={{ alignItems: 'flex-end' }} gap={2}>
                  <XStack style={{ alignItems: 'baseline' }} gap="$1">
                    <Text style={{ fontFamily: 'Georgia', fontSize: 36, fontWeight: '500', color: GOLD, lineHeight: 40 }}>
                      {cost}
                    </Text>
                    <Text style={{ fontFamily: 'Georgia', fontSize: 16, color: 'rgba(201,168,76,0.5)' }}> GT</Text>
                  </XStack>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    {(cost - 0.01).toFixed(2)} CHF
                  </Text>
                </YStack>
              </XStack>
            </YStack>

            {/* ── Date picker ── */}
            <YStack
              backgroundColor="white"
              borderRadius="$5"
              borderWidth={1}
              borderColor={BORDER}
              overflow="hidden"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <YStack padding="$4" paddingBottom="$3" gap="$1">
                <Text style={{ fontSize: 11, fontWeight: '600', color: INK_LIGHT, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Activity date
                </Text>
                <Text style={{ fontSize: 12, color: INK_LIGHT, lineHeight: 18 }}>
                  Your ticket will only be valid on this day.
                </Text>
              </YStack>

              <XStack
                paddingHorizontal="$4"
                paddingBottom="$4"
                style={{ alignItems: 'center' }}
                gap="$3"
              >
                {/* Previous day */}
                <TouchableOpacity
                  onPress={() => setValidDate((d) => shiftDate(d, -1))}
                  disabled={isToday}
                  style={{
                    width: 40, height: 40,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: isToday ? 'rgba(26,22,18,0.06)' : BORDER,
                    backgroundColor: isToday ? 'rgba(26,22,18,0.03)' : 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18, color: isToday ? INK_LIGHT : INK, opacity: isToday ? 0.35 : 1 }}>‹</Text>
                </TouchableOpacity>

                {/* Date display */}
                <YStack flex={1} style={{ alignItems: 'center' }} gap="$1">
                  <Text style={{ fontSize: 16, fontWeight: '700', color: INK, textAlign: 'center' }}>
                    {formatDate(validDate)}
                  </Text>
                  {isToday && (
                    <Text style={{ fontSize: 10, fontWeight: '600', color: TEAL, letterSpacing: 1, textTransform: 'uppercase' }}>
                      Today
                    </Text>
                  )}
                </YStack>

                {/* Next day */}
                <TouchableOpacity
                  onPress={() => setValidDate((d) => shiftDate(d, 1))}
                  style={{
                    width: 40, height: 40,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: BORDER,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18, color: INK }}>›</Text>
                </TouchableOpacity>
              </XStack>
            </YStack>

            {/* Balance summary */}
            <XStack
              backgroundColor="white"
              borderRadius="$4"
              borderWidth={1}
              borderColor={BORDER}
              padding="$4"
              justifyContent="space-between"
              style={{ alignItems: 'center' }}
            >
              <YStack gap="$1">
                <Text style={{ fontSize: 10, fontWeight: '600', color: INK_LIGHT, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Your balance
                </Text>
                <Text style={{ fontSize: 14, color: INK_MID }}>{balance} GT · {(balance - 0.01).toFixed(2)} CHF</Text>
              </YStack>
              <YStack style={{ alignItems: 'flex-end' }} gap={2}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: canAfford ? TEAL : RED }}>
                  {canAfford ? `−${cost} GT` : `${cost - balance} GT short`}
                </Text>
                <Text style={{ fontSize: 11, color: INK_LIGHT }}>
                  {(cost - 0.01).toFixed(2)} CHF
                </Text>
              </YStack>
            </XStack>

            {/* Insufficient balance warning */}
            {!canAfford && (
              <YStack
                backgroundColor="rgba(184,54,42,0.07)"
                borderRadius="$4"
                borderWidth={1}
                borderColor="rgba(184,54,42,0.2)"
                padding="$3"
                gap="$1"
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: RED }}>
                  ⚠️  Insufficient balance
                </Text>
                <Text style={{ fontSize: 12, color: RED, opacity: 0.8 }}>
                  You need {cost - balance} more GT to book this offer.
                </Text>
              </YStack>
            )}

            {/* Confirm button */}
            <TouchableOpacity
              onPress={() => void handleBook()}
              disabled={!canAfford}
              style={{
                backgroundColor: canAfford ? TEAL : 'rgba(26,22,18,0.08)',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: canAfford ? TEAL : 'transparent',
                shadowOpacity: 0.25,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: canAfford ? 'white' : INK_LIGHT }}>
                {canAfford ? `Confirm for ${formatDate(validDate)}` : 'Insufficient balance'}
              </Text>
            </TouchableOpacity>

            {/* Buy tokens link if can't afford */}
            {!canAfford && (
              <TouchableOpacity
                onPress={() => router.push('/buy-tokens')}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: BORDER,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: INK }}>💳  Buy tokens</Text>
              </TouchableOpacity>
            )}
          </YStack>
        </ScrollView>
      )}

      {/* ── Step 2: Processing ── */}
      {step === 'processing' && (
        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} gap="$4">
          <Spinner size="large" color={TEAL} />
          <Text style={{ fontSize: 16, color: INK }}>Booking in progress...</Text>
          <Text style={{ fontSize: 13, color: INK_LIGHT }}>Please wait</Text>
        </YStack>
      )}

      {/* ── Step 3: Success ── */}
      {step === 'success' && (
        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} padding="$6" gap="$5">
          <Text style={{ fontSize: 72 }}>✅</Text>
          <YStack gap="$2" style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '400', color: INK, textAlign: 'center', letterSpacing: -0.5 }}>
              Booking confirmed!
            </Text>
            <Text style={{ fontSize: 15, color: INK_LIGHT, textAlign: 'center', lineHeight: 22 }}>
              Valid on {formatDate(validDate)}.{'\n'}Show your ticket to the inspector.
            </Text>
          </YStack>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/tickets')}
            style={{
              backgroundColor: INK,
              borderRadius: 14,
              paddingVertical: 16,
              paddingHorizontal: 32,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>View my tickets</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, color: INK_LIGHT }}>← Back to offers</Text>
          </TouchableOpacity>
        </YStack>
      )}

      {/* ── Step 4: Error ── */}
      {step === 'error' && (
        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} padding="$6" gap="$5">
          <Text style={{ fontSize: 72 }}>❌</Text>
          <YStack gap="$2" style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '400', color: INK, textAlign: 'center', letterSpacing: -0.5 }}>
              Booking failed
            </Text>
            <Text style={{ fontSize: 15, color: INK_LIGHT, textAlign: 'center', lineHeight: 22 }}>
              You don't have enough Green Tokens for this offer.
            </Text>
          </YStack>
          <TouchableOpacity
            onPress={() => router.push('/buy-tokens')}
            style={{
              backgroundColor: INK,
              borderRadius: 14,
              paddingVertical: 16,
              paddingHorizontal: 32,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>💳  Buy tokens</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, color: INK_LIGHT }}>← Back to offers</Text>
          </TouchableOpacity>
        </YStack>
      )}
    </YStack>
  )
}
