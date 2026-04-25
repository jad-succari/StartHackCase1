import { useState } from 'react'
import { Alert } from 'react-native'
import { router } from 'expo-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import {
  Button,
  Card,
  H2,
  Paragraph,
  ScrollView,
  Spinner,
  Text,
  XStack,
  YStack,
} from 'tamagui'

const GREEN_DARK = '#1B5E20'
const GREEN_MID = '#2E7D32'
const GREEN_LIGHT = '#E8F5E9'
const GREEN_ACCENT = '#4CAF50'

const PACKAGES = [
  { tokens: 100, priceCHF: 9.9, label: 'Starter' },
  { tokens: 300, priceCHF: 24.9, label: 'Explorer', popular: true },
  { tokens: 500, priceCHF: 39.9, label: 'Adventure' },
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
    await new Promise((r) => setTimeout(r, 2000))
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
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="large" color={GREEN_MID} />
      </YStack>
    )
  }

  return (
    <YStack style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <YStack backgroundColor={GREEN_DARK} padding="$5" paddingTop="$10" gap="$1">
        {step !== 'success' && (
          <Button
            size="$3"
            chromeless
            onPress={() => router.back()}
            alignSelf="flex-start"
            marginBottom="$1"
          >
            <Text color="rgba(255,255,255,0.85)" fontSize="$4">← Back</Text>
          </Button>
        )}
        <H2 color="white">Buy Tokens</H2>
        <Text color="rgba(255,255,255,0.65)" fontSize="$3">
          Current balance: {user?.greenTokensBalance ?? 0} GT
        </Text>
      </YStack>

      {/* Step 1: Package selection */}
      {step === 'select' && (
        <ScrollView>
          <YStack padding="$4" gap="$3">
            <Text color="$gray10" fontSize="$3" marginBottom="$1">
              Choose a package:
            </Text>

            {PACKAGES.map((p, i) => (
              <Card
                key={i}
                pressStyle={{ scale: 0.98 }}
                onPress={() => setSelectedIndex(i)}
                borderWidth={2}
                borderColor={selectedIndex === i ? GREEN_MID : '$color4'}
                borderRadius="$5"
                backgroundColor={selectedIndex === i ? GREEN_LIGHT : 'white'}
                elevation={selectedIndex === i ? 2 : 0}
              >
                <XStack padding="$4" style={{ alignItems: 'center' }} gap="$4">
                  <YStack flex={1} gap="$2">
                    <XStack style={{ alignItems: 'center' }} gap="$2">
                      <Text fontWeight="900" fontSize="$7" color={GREEN_DARK}>
                        {p.tokens} GT
                      </Text>
                      {p.popular && (
                        <Text
                          fontSize="$1"
                          fontWeight="700"
                          color="white"
                          backgroundColor={GREEN_ACCENT}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius="$2"
                        >
                          POPULAR
                        </Text>
                      )}
                    </XStack>
                    <Text color="$gray10" fontSize="$3">{p.label}</Text>
                  </YStack>
                  <YStack style={{ alignItems: 'flex-end' }} gap="$1">
                    <Text fontWeight="700" fontSize="$5" color={GREEN_DARK}>
                      {p.priceCHF.toFixed(2)} CHF
                    </Text>
                    <Text fontSize="$2" color="$gray9">
                      {((p.priceCHF / p.tokens) * 100).toFixed(1)} ct/GT
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            ))}

            <Button
              size="$5"
              backgroundColor={selectedIndex !== null ? GREEN_MID : '$gray5'}
              borderRadius="$4"
              marginTop="$2"
              disabled={selectedIndex === null}
              onPress={() => setStep('payment')}
            >
              <Text
                color={selectedIndex !== null ? 'white' : '$gray9'}
                fontWeight="bold"
                fontSize="$4"
              >
                Continue →
              </Text>
            </Button>
          </YStack>
        </ScrollView>
      )}

      {/* Step 2: Payment confirmation */}
      {step === 'payment' && pkg && (
        <ScrollView>
          <YStack padding="$4" gap="$4">
            <Card borderRadius="$5" borderWidth={1} borderColor="$color4" padding="$4">
              <YStack gap="$2">
                <Text fontWeight="700" fontSize="$4">Summary</Text>
                <XStack justifyContent="space-between" style={{ alignItems: 'center' }}>
                  <Text color="$gray10">{pkg.tokens} Green Tokens ({pkg.label})</Text>
                  <Text fontWeight="800" fontSize="$5" color={GREEN_DARK}>
                    {pkg.priceCHF.toFixed(2)} CHF
                  </Text>
                </XStack>
              </YStack>
            </Card>

            <Card borderRadius="$5" overflow="hidden" elevation={3}>
              <YStack backgroundColor={GREEN_DARK} padding="$5" gap="$4">
                <XStack justifyContent="space-between" style={{ alignItems: 'center' }}>
                  <Text color="rgba(255,255,255,0.6)" fontSize="$2" fontWeight="600">
                    PAYMENT CARD
                  </Text>
                  <Text color="white" fontSize="$5">💳</Text>
                </XStack>
                <Text color="white" fontWeight="700" fontSize="$6" letterSpacing={3}>
                  •••• •••• •••• 4242
                </Text>
                <XStack justifyContent="space-between">
                  <YStack gap="$1">
                    <Text color="rgba(255,255,255,0.5)" fontSize="$1">CARDHOLDER</Text>
                    <Text color="white" fontWeight="600" fontSize="$3">JOHN TOURIST</Text>
                  </YStack>
                  <YStack gap="$1" style={{ alignItems: 'flex-end' }}>
                    <Text color="rgba(255,255,255,0.5)" fontSize="$1">EXPIRES</Text>
                    <Text color="white" fontWeight="600" fontSize="$3">12/26</Text>
                  </YStack>
                </XStack>
              </YStack>
              <XStack
                backgroundColor={GREEN_LIGHT}
                padding="$3"
                justifyContent="center"
                gap="$2"
                style={{ alignItems: 'center' }}
              >
                <Text fontSize="$2" color={GREEN_MID}>🔒 Secure payment — Simulation only</Text>
              </XStack>
            </Card>

            <Button
              size="$5"
              backgroundColor={GREEN_MID}
              borderRadius="$4"
              onPress={() => void handlePay()}
            >
              <Text color="white" fontWeight="bold" fontSize="$4">
                Pay {pkg.priceCHF.toFixed(2)} CHF
              </Text>
            </Button>

            <Button size="$4" chromeless borderRadius="$4" onPress={() => setStep('select')}>
              <Text color="$gray10">← Change package</Text>
            </Button>
          </YStack>
        </ScrollView>
      )}

      {/* Step 3: Processing */}
      {step === 'loading' && (
        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} gap="$4">
          <Spinner size="large" color={GREEN_MID} />
          <Text color="$gray10" fontSize="$4">Processing payment...</Text>
          <Text color="$gray8" fontSize="$2">Please wait</Text>
        </YStack>
      )}

      {/* Step 4: Success */}
      {step === 'success' && pkg && (
        <YStack
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          padding="$6"
          gap="$5"
        >
          <Text style={{ fontSize: 80 }}>✅</Text>
          <YStack gap="$2" style={{ alignItems: 'center' }}>
            <H2 style={{ textAlign: 'center' }}>Payment successful!</H2>
            <Paragraph style={{ textAlign: 'center' }} color="$gray10" fontSize="$4">
              {pkg.tokens} Green Tokens have been added to your account.
            </Paragraph>
          </YStack>
          <Button
            size="$5"
            backgroundColor={GREEN_MID}
            borderRadius="$4"
            width="100%"
            onPress={() => router.back()}
          >
            <Text color="white" fontWeight="bold" fontSize="$4">
              Back to home
            </Text>
          </Button>
        </YStack>
      )}
    </YStack>
  )
}
