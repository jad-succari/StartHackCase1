import { useState } from 'react'
import { Alert, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { ScrollView, Spinner, Text, XStack, YStack } from 'tamagui'

const INK       = '#1A1612'
const INK_MID   = '#6B5E52'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const TEAL      = '#2A8FA0'
const GOLD      = '#C9A84C'
const BORDER    = 'rgba(26,22,18,0.08)'

const PACKAGES = [
  { tokens: 100,  priceCHF: 9.90,  label: 'Starter' },
  { tokens: 300,  priceCHF: 24.90, label: 'Explorer', popular: true },
  { tokens: 500,  priceCHF: 39.90, label: 'Adventure' },
]

type Step = 'select' | 'payment' | 'loading' | 'success'

export default function BuyTokensScreen() {
  const user = useQuery(api.wallet.getUser)
  const addTokens = useMutation(api.wallet.addTokens)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [step, setStep] = useState<Step>('select')

  const pkg = selectedIndex !== null ? PACKAGES[selectedIndex] : null

  const handlePay = async () => {
    if (!user || !pkg) return
    setStep('loading')
    await new Promise((r) => setTimeout(r, 1800))
    try {
      await addTokens({ userId: user._id, amount: pkg.tokens })
      setStep('success')
    } catch {
      setStep('payment')
      Alert.alert('Error', 'Payment failed. Please try again.')
    }
  }

  if (user === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} backgroundColor={BG}>
        <Spinner size="large" color={TEAL} />
      </YStack>
    )
  }

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
        {step !== 'success' && (
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8, alignSelf: 'flex-start' }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3 }}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '400', color: GOLD, letterSpacing: -0.5 }}>
          Acheter des LAKE
        </Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
          Solde : {user?.greenTokensBalance ?? 0} LAKE
        </Text>
      </YStack>

      {/* ── Step 1: Package selection ── */}
      {step === 'select' && (
        <ScrollView>
          <YStack padding="$4" gap="$3" paddingBottom="$8">
            <Text style={{ fontSize: 11, fontWeight: '600', color: INK_LIGHT, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Choose a package
            </Text>

            {PACKAGES.map((p, i) => {
              const selected = selectedIndex === i
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedIndex(i)}
                  style={{
                    backgroundColor: selected ? '#111111' : 'white',
                    borderRadius: 16,
                    borderWidth: selected ? 1 : 1,
                    borderColor: selected ? GOLD : BORDER,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOpacity: selected ? 0.18 : 0.04,
                    shadowRadius: selected ? 16 : 6,
                    shadowOffset: { width: 0, height: selected ? 6 : 2 },
                  }}
                >
                  <XStack padding="$4" style={{ alignItems: 'center' }} gap="$4">
                    <YStack flex={1} gap="$1">
                      <XStack style={{ alignItems: 'center' }} gap="$2">
                        <Text style={{
                          fontFamily: 'Georgia',
                          fontSize: 32, fontWeight: '500',
                          color: selected ? GOLD : INK,
                          lineHeight: 36,
                        }}>
                          {p.tokens}
                          <Text style={{ fontFamily: 'Georgia', fontSize: 16, color: selected ? 'rgba(201,168,76,0.5)' : INK_LIGHT }}> LAKE</Text>
                        </Text>
                        {p.popular && (
                          <View style={{
                            backgroundColor: selected ? GOLD : TEAL,
                            borderRadius: 6,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: 'white', letterSpacing: 1 }}>
                              POPULAR
                            </Text>
                          </View>
                        )}
                      </XStack>
                      <Text style={{ fontSize: 12, color: selected ? 'rgba(201,168,76,0.5)' : INK_LIGHT }}>
                        {p.label} pack
                      </Text>
                    </YStack>

                    <YStack style={{ alignItems: 'flex-end' }} gap="$1">
                      <Text style={{ fontSize: 22, fontWeight: '700', color: selected ? GOLD : INK }}>
                        {p.priceCHF.toFixed(2)}
                        <Text style={{ fontSize: 14, fontWeight: '400', color: selected ? 'rgba(201,168,76,0.6)' : INK_LIGHT }}> CHF</Text>
                      </Text>
                      <Text style={{ fontSize: 11, color: selected ? 'rgba(201,168,76,0.4)' : INK_LIGHT }}>
                        {((p.priceCHF / p.tokens) * 100).toFixed(1)} ct/LAKE
                      </Text>
                    </YStack>
                  </XStack>
                </TouchableOpacity>
              )
            })}

            <TouchableOpacity
              onPress={() => selectedIndex !== null && setStep('payment')}
              style={{
                marginTop: 8,
                backgroundColor: selectedIndex !== null ? TEAL : 'rgba(26,22,18,0.08)',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: selectedIndex !== null ? 'white' : INK_LIGHT }}>
                Continue →
              </Text>
            </TouchableOpacity>
          </YStack>
        </ScrollView>
      )}

      {/* ── Step 2: Payment ── */}
      {step === 'payment' && pkg && (
        <ScrollView>
          <YStack padding="$4" gap="$4" paddingBottom="$8">

            {/* Summary row */}
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
                <Text style={{ fontSize: 11, fontWeight: '600', color: INK_LIGHT, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Summary
                </Text>
                <Text style={{ fontSize: 14, color: INK_MID }}>
                  {pkg.tokens} LAKE · {pkg.label}
                </Text>
              </YStack>
              <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '500', color: INK }}>
                {pkg.priceCHF.toFixed(2)}
                <Text style={{ fontFamily: 'Georgia', fontSize: 14, color: INK_LIGHT }}> CHF</Text>
              </Text>
            </XStack>

            {/* Mock payment card — same style as wallet black card */}
            <YStack
              backgroundColor="#111111"
              borderRadius="$6"
              padding="$5"
              gap="$4"
              style={{
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                shadowColor: '#000',
                shadowOpacity: 0.3,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
              }}
            >
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />

              <XStack justifyContent="space-between" style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Payment card
                </Text>
                <Text style={{ fontSize: 18 }}>💳</Text>
              </XStack>

              <Text style={{ fontSize: 20, fontWeight: '600', color: 'white', letterSpacing: 4 }}>
                •••• •••• •••• 4242
              </Text>

              <XStack justifyContent="space-between">
                <YStack gap="$1">
                  <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>CARDHOLDER</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>JOHN TOURIST</Text>
                </YStack>
                <YStack gap="$1" style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>EXPIRES</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>12/26</Text>
                </YStack>
              </XStack>
            </YStack>

            <Text style={{ fontSize: 11, color: INK_LIGHT, textAlign: 'center' }}>
              🔒 Secure simulation — no real payment
            </Text>

            <TouchableOpacity
              onPress={() => void handlePay()}
              style={{
                backgroundColor: INK,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>
                Pay {pkg.priceCHF.toFixed(2)} CHF
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('select')} style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontSize: 13, color: INK_LIGHT }}>← Change package</Text>
            </TouchableOpacity>
          </YStack>
        </ScrollView>
      )}

      {/* ── Step 3: Processing ── */}
      {step === 'loading' && (
        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} gap="$4">
          <Spinner size="large" color={TEAL} />
          <Text style={{ fontSize: 16, color: INK }}>Processing payment...</Text>
          <Text style={{ fontSize: 13, color: INK_LIGHT }}>Please wait</Text>
        </YStack>
      )}

      {/* ── Step 4: Success ── */}
      {step === 'success' && pkg && (
        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} padding="$6" gap="$5">
          <Text style={{ fontSize: 72 }}>✅</Text>
          <YStack gap="$2" style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '400', color: INK, textAlign: 'center', letterSpacing: -0.5 }}>
              Payment successful
            </Text>
            <Text style={{ fontSize: 15, color: INK_LIGHT, textAlign: 'center', lineHeight: 22 }}>
              {pkg.tokens} LAKE ont été ajoutés à votre wallet.
            </Text>
          </YStack>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: INK,
              borderRadius: 14,
              paddingVertical: 16,
              paddingHorizontal: 32,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>Back to wallet</Text>
          </TouchableOpacity>
        </YStack>
      )}
    </YStack>
  )
}
