import { useState } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from 'convex/react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&q=80'

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

function dateToTimestamp(str: string): number {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

export default function BookActivityScreen() {
  const { top } = useSafeAreaInsets()
  const { activityId } = useLocalSearchParams<{ activityId: string }>()
  const user = useQuery(api.wallet.getUser)
  const activity = useQuery(
    api.activities.getActivityById,
    activityId ? { activityId: activityId as Id<'activities'> } : 'skip'
  )
  const bookActivity = useMutation(api.activities.bookActivity)
  const [step, setStep] = useState<Step>('confirm')
  const [validDate, setValidDate] = useState(todayStr)

  const handleBook = async () => {
    if (!user || !activity) return
    setStep('processing')
    await new Promise((r) => setTimeout(r, 2000))
    try {
      await bookActivity({
        userId: user._id,
        activityId: activity._id,
        scheduledAt: dateToTimestamp(validDate),
      })
      setStep('success')
    } catch {
      setStep('error')
    }
  }

  if (user === undefined || activity === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} backgroundColor={BG}>
        <Spinner size="large" color={TEAL} />
      </YStack>
    )
  }

  const balance   = user?.greenTokensBalance ?? 0
  const cost      = activity?.priceJF ?? 0
  const canAfford = balance >= cost
  const today     = todayStr()
  const isToday   = validDate === today
  const heroH     = Math.max(200, top + 160)
  const heroImage = activity?.imageUrl ?? FALLBACK_IMAGE

  const hours    = Math.floor((activity?.durationMinutes ?? 0) / 60)
  const mins     = (activity?.durationMinutes ?? 0) % 60
  const duration = hours > 0 ? (mins > 0 ? `${hours}h ${mins}min` : `${hours}h`) : `${mins}min`

  return (
    <YStack style={{ flex: 1, backgroundColor: BG }}>

      {/* ── Hero header ── */}
      <View style={{ height: heroH, position: 'relative', overflow: 'hidden' }}>
        <Image
          source={{ uri: heroImage }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.52)',
        }} />
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          backgroundColor: BG, opacity: 0.92,
        }} />
        <View style={{ position: 'absolute', top: top + 12, left: 20, right: 20, bottom: 0 }}>
          {(step === 'confirm' || step === 'error') && (
            <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 10, alignSelf: 'flex-start' }}>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3 }}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '400', color: 'white', letterSpacing: -0.5 }}>
            Book an activity
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
            Balance: {balance} LAKE available
          </Text>
        </View>
      </View>

      {/* ── Step 1: Confirmation ── */}
      {step === 'confirm' && activity && (
        <ScrollView>
          <YStack padding="$4" gap="$4" paddingBottom="$8">

            {/* Activity card */}
            <YStack
              backgroundColor="white"
              borderRadius="$5"
              borderWidth={1}
              borderColor={BORDER}
              overflow="hidden"
              style={{
                shadowColor: INK,
                shadowOpacity: 0.08,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <YStack padding="$4" gap="$2">
                <Text style={{ fontSize: 11, fontWeight: '600', color: INK_LIGHT, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Selected activity
                </Text>
                <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '400', color: INK, lineHeight: 26 }}>
                  {activity.title}
                </Text>
                {activity.description ? (
                  <Text style={{ fontSize: 13, color: INK_MID, lineHeight: 20 }}>{activity.description}</Text>
                ) : null}

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                    backgroundColor: 'rgba(13,148,136,0.07)',
                    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
                    borderWidth: 1, borderColor: 'rgba(13,148,136,0.18)',
                  }}>
                    <Text style={{ fontSize: 11 }}>⏱</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: TEAL }}>{duration}</Text>
                  </View>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                    backgroundColor: 'rgba(201,168,76,0.07)',
                    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
                    borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)',
                  }}>
                    <Text style={{ fontSize: 11 }}>1×</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#A07830' }}>Single use</Text>
                  </View>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                    backgroundColor: 'rgba(5,150,105,0.07)',
                    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
                    borderWidth: 1, borderColor: 'rgba(5,150,105,0.18)',
                  }}>
                    <Text style={{ fontSize: 11 }}>⚡</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#059669' }}>0% network fees</Text>
                  </View>
                </View>
              </YStack>

              <XStack
                backgroundColor="#111111"
                paddingHorizontal="$4"
                paddingVertical="$4"
                justifyContent="space-between"
                style={{ alignItems: 'center' }}
              >
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5 }}>
                  Activity cost
                </Text>
                <YStack style={{ alignItems: 'flex-end' }} gap={2}>
                  <XStack style={{ alignItems: 'baseline' }} gap="$1">
                    <Text style={{ fontFamily: 'Georgia', fontSize: 36, fontWeight: '500', color: GOLD, lineHeight: 40 }}>
                      {cost}
                    </Text>
                    <Text style={{ fontFamily: 'Georgia', fontSize: 16, color: 'rgba(201,168,76,0.5)' }}> LAKE</Text>
                  </XStack>
                  {activity.originalPriceCHF > 0 && (
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                      {activity.originalPriceCHF} CHF
                    </Text>
                  )}
                </YStack>
              </XStack>
            </YStack>

            {/* Date picker */}
            <YStack
              backgroundColor="white"
              borderRadius="$5"
              borderWidth={1}
              borderColor={BORDER}
              overflow="hidden"
              style={{
                shadowColor: INK,
                shadowOpacity: 0.06,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 3 },
              }}
            >
              <YStack padding="$4" paddingBottom="$3" gap="$1">
                <Text style={{ fontSize: 11, fontWeight: '600', color: INK_LIGHT, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Activity date
                </Text>
                <Text style={{ fontSize: 12, color: INK_LIGHT, lineHeight: 18 }}>
                  Your booking will be scheduled for this day.
                </Text>
              </YStack>

              <XStack paddingHorizontal="$4" paddingBottom="$4" style={{ alignItems: 'center' }} gap="$3">
                <TouchableOpacity
                  onPress={() => setValidDate((d) => shiftDate(d, -1))}
                  disabled={isToday}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    borderWidth: 1,
                    borderColor: isToday ? 'rgba(26,22,18,0.06)' : BORDER,
                    backgroundColor: isToday ? 'rgba(26,22,18,0.03)' : 'white',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18, color: isToday ? INK_LIGHT : INK, opacity: isToday ? 0.35 : 1 }}>‹</Text>
                </TouchableOpacity>

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

                <TouchableOpacity
                  onPress={() => setValidDate((d) => shiftDate(d, 1))}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    borderWidth: 1, borderColor: BORDER, backgroundColor: 'white',
                    alignItems: 'center', justifyContent: 'center',
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
                <Text style={{ fontSize: 14, color: INK_MID }}>{balance} LAKE</Text>
              </YStack>
              <YStack style={{ alignItems: 'flex-end' }} gap={2}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: canAfford ? TEAL : RED }}>
                  {canAfford ? `−${cost} LAKE` : `${cost - balance} LAKE missing`}
                </Text>
              </YStack>
            </XStack>

            {/* Fee advantage */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: 'rgba(5,150,105,0.07)',
              borderRadius: 10, padding: 10,
              borderWidth: 1, borderColor: 'rgba(5,150,105,0.15)',
            }}>
              <Text style={{ fontSize: 16 }}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#059669' }}>0% transaction fees</Text>
                <Text style={{ fontSize: 11, color: '#A89E92', marginTop: 1 }}>Save 3–4% vs foreign bank card · Gnosis Chain</Text>
              </View>
            </View>

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
                <Text style={{ fontSize: 13, fontWeight: '700', color: RED }}>⚠️  Insufficient balance</Text>
                <Text style={{ fontSize: 12, color: RED, opacity: 0.8 }}>
                  You need {cost - balance} more LAKE to book this activity.
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

            {!canAfford && (
              <TouchableOpacity
                onPress={() => router.push('/buy-tokens')}
                style={{
                  backgroundColor: 'white', borderRadius: 14,
                  borderWidth: 1, borderColor: BORDER,
                  paddingVertical: 14, alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: INK }}>💳  Buy LAKE</Text>
              </TouchableOpacity>
            )}
          </YStack>
        </ScrollView>
      )}

      {/* Processing */}
      {step === 'processing' && (
        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} gap="$4">
          <Spinner size="large" color={TEAL} />
          <Text style={{ fontSize: 16, color: INK }}>Booking in progress...</Text>
          <Text style={{ fontSize: 13, color: INK_LIGHT }}>Please wait</Text>
        </YStack>
      )}

      {/* Success */}
      {step === 'success' && (
        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} padding="$6" gap="$5">
          <Text style={{ fontSize: 72 }}>✅</Text>
          <YStack gap="$2" style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '400', color: INK, textAlign: 'center', letterSpacing: -0.5 }}>
              Activity booked!
            </Text>
            <Text style={{ fontSize: 15, color: INK_LIGHT, textAlign: 'center', lineHeight: 22 }}>
              Scheduled for {formatDate(validDate)}.{'\n'}Show your booking to the guide.
            </Text>
          </YStack>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/tickets')}
            style={{
              backgroundColor: INK, borderRadius: 14,
              paddingVertical: 16, paddingHorizontal: 32,
              width: '100%', alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>View my tickets</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, color: INK_LIGHT }}>← Back to activities</Text>
          </TouchableOpacity>
        </YStack>
      )}

      {/* Error */}
      {step === 'error' && (
        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} padding="$6" gap="$5">
          <Text style={{ fontSize: 72 }}>❌</Text>
          <YStack gap="$2" style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '400', color: INK, textAlign: 'center', letterSpacing: -0.5 }}>
              Booking failed
            </Text>
            <Text style={{ fontSize: 15, color: INK_LIGHT, textAlign: 'center', lineHeight: 22 }}>
              You don't have enough LAKE for this activity.
            </Text>
          </YStack>
          <TouchableOpacity
            onPress={() => router.push('/buy-tokens')}
            style={{
              backgroundColor: INK, borderRadius: 14,
              paddingVertical: 16, paddingHorizontal: 32,
              width: '100%', alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>💳  Buy LAKE</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, color: INK_LIGHT }}>← Back to activities</Text>
          </TouchableOpacity>
        </YStack>
      )}
    </YStack>
  )
}
