import { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import type { Id } from '../convex/_generated/dataModel'
import {
  Button,
  Card,
  H2,
  Paragraph,
  Spinner,
  Text,
  XStack,
  YStack,
} from 'tamagui'

const GREEN_DARK = '#1B5E20'
const GREEN_MID = '#2E7D32'
const GREEN_LIGHT = '#E8F5E9'
const RED = '#C62828'

type Step = 'confirm' | 'processing' | 'success' | 'error'

export default function BookOfferScreen() {
  const { offerId } = useLocalSearchParams<{ offerId: string }>()
  const user = useQuery(api.wallet.getUser)
  const offer = useQuery(
    api.wallet.getOffer,
    offerId ? { offerId: offerId as Id<'offers'> } : 'skip'
  )
  const bookOffer = useMutation(api.wallet.bookOffer)
  const [step, setStep] = useState<Step>('confirm')

  const handleBook = async () => {
    if (!user || !offer) return
    setStep('processing')
    await new Promise((r) => setTimeout(r, 2000))
    try {
      await bookOffer({ userId: user._id, offerId: offer._id })
      setStep('success')
    } catch {
      setStep('error')
    }
  }

  if (user === undefined || offer === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="large" color={GREEN_MID} />
      </YStack>
    )
  }

  const balance = user?.greenTokensBalance ?? 0
  const cost = offer?.tokenCost ?? 0
  const canAfford = balance >= cost

  return (
    <YStack style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <YStack backgroundColor={GREEN_DARK} padding="$5" paddingTop="$10" gap="$1">
        {(step === 'confirm' || step === 'error') && (
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
        <H2 color="white">Book an offer</H2>
        <Text color="rgba(255,255,255,0.65)" fontSize="$3">
          Balance: {balance} GT available
        </Text>
      </YStack>

      {/* Step 1: Confirmation */}
      {step === 'confirm' && offer && (
        <YStack padding="$4" gap="$4">
          <Card borderRadius="$5" borderWidth={1} borderColor="$color4" overflow="hidden">
            <YStack padding="$4" gap="$2">
              <Text fontWeight="700" fontSize="$5">{offer.title}</Text>
              {offer.description ? (
                <Text color="$gray10" fontSize="$3">{offer.description}</Text>
              ) : null}
            </YStack>
            <XStack
              backgroundColor={GREEN_LIGHT}
              padding="$4"
              justifyContent="space-between"
              style={{ alignItems: 'center' }}
            >
              <Text color={GREEN_DARK} fontWeight="600" fontSize="$3">
                Booking cost
              </Text>
              <XStack style={{ alignItems: 'baseline' }} gap="$1">
                <Text fontWeight="900" fontSize="$7" color={GREEN_DARK}>
                  {cost}
                </Text>
                <Text fontSize="$3" color={GREEN_MID} fontWeight="600"> GT</Text>
              </XStack>
            </XStack>
          </Card>

          {!canAfford && (
            <YStack
              backgroundColor="#FFEBEE"
              borderRadius="$4"
              padding="$3"
              gap="$1"
            >
              <Text color={RED} fontWeight="700" fontSize="$3">
                ⚠️ Insufficient balance
              </Text>
              <Text color={RED} fontSize="$2">
                You are {cost - balance} GT short for this offer.
              </Text>
            </YStack>
          )}

          <Button
            size="$5"
            backgroundColor={canAfford ? GREEN_MID : '$gray5'}
            borderRadius="$4"
            disabled={!canAfford}
            onPress={() => void handleBook()}
          >
            <Text
              color={canAfford ? 'white' : '$gray9'}
              fontWeight="bold"
              fontSize="$4"
            >
              {canAfford ? 'Confirm booking' : 'Insufficient balance'}
            </Text>
          </Button>

          {!canAfford && (
            <Button
              size="$4"
              borderRadius="$4"
              borderWidth={1}
              borderColor={GREEN_MID}
              backgroundColor="white"
              onPress={() => router.push('/buy-tokens')}
            >
              <Text color={GREEN_MID} fontWeight="600">💳 Buy tokens</Text>
            </Button>
          )}
        </YStack>
      )}

      {/* Step 2: Processing */}
      {step === 'processing' && (
        <YStack
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          gap="$4"
        >
          <Spinner size="large" color={GREEN_MID} />
          <Text color="$gray10" fontSize="$4">Booking in progress...</Text>
          <Text color="$gray8" fontSize="$2">Please wait</Text>
        </YStack>
      )}

      {/* Step 3: Success */}
      {step === 'success' && (
        <YStack
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          padding="$6"
          gap="$5"
        >
          <Text style={{ fontSize: 80 }}>✅</Text>
          <YStack gap="$2" style={{ alignItems: 'center' }}>
            <H2 style={{ textAlign: 'center' }}>Booking confirmed!</H2>
            <Paragraph style={{ textAlign: 'center' }} color="$gray10" fontSize="$4">
              Your ticket is ready. Show it to the inspector.
            </Paragraph>
          </YStack>
          <Button
            size="$5"
            backgroundColor={GREEN_MID}
            borderRadius="$4"
            width="100%"
            onPress={() => router.push('/(tabs)/tickets')}
          >
            <Text color="white" fontWeight="bold" fontSize="$4">
              View my tickets
            </Text>
          </Button>
          <Button
            size="$4"
            chromeless
            borderRadius="$4"
            onPress={() => router.back()}
          >
            <Text color="$gray10">← Back to offers</Text>
          </Button>
        </YStack>
      )}

      {/* Step 4: Insufficient balance */}
      {step === 'error' && (
        <YStack
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          padding="$6"
          gap="$5"
        >
          <Text style={{ fontSize: 80 }}>❌</Text>
          <YStack gap="$2" style={{ alignItems: 'center' }}>
            <H2 style={{ textAlign: 'center' }}>Insufficient balance</H2>
            <Paragraph style={{ textAlign: 'center' }} color="$gray10" fontSize="$4">
              You don't have enough Green Tokens to book this offer.
            </Paragraph>
          </YStack>
          <Button
            size="$5"
            backgroundColor={GREEN_MID}
            borderRadius="$4"
            width="100%"
            onPress={() => router.push('/buy-tokens')}
          >
            <Text color="white" fontWeight="bold" fontSize="$4">💳 Buy tokens</Text>
          </Button>
          <Button
            size="$4"
            chromeless
            borderRadius="$4"
            onPress={() => router.back()}
          >
            <Text color="$gray10">← Back to offers</Text>
          </Button>
        </YStack>
      )}
    </YStack>
  )
}
