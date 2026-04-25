import { Alert } from 'react-native'
import { useMutation, useQuery } from 'convex/react'
import { router } from 'expo-router'
import { api } from '../../convex/_generated/api'
import {
  Button,
  Card,
  H2,
  Paragraph,
  ScrollView,
  Separator,
  Spinner,
  Text,
  XStack,
  YStack,
} from 'tamagui'

const GREEN_DARK = '#1B5E20'
const GREEN_MID = '#2E7D32'
const GREEN_LIGHT = '#E8F5E9'
const GREEN_ACCENT = '#4CAF50'

function GreenButton({
  children,
  onPress,
  width,
}: {
  children: string
  onPress: () => void
  width?: string
}) {
  return (
    <Button
      size="$5"
      backgroundColor={GREEN_MID}
      borderRadius="$4"
      width={width}
      onPress={onPress}
    >
      <Text color="white" fontWeight="bold" fontSize="$4">
        {children}
      </Text>
    </Button>
  )
}

export default function WalletScreen() {
  const user = useQuery(api.wallet.getUser)
  const offers = useQuery(api.wallet.getOffers)
  const populateData = useMutation(api.seed.populateData)

  if (user === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} gap="$3">
        <Spinner size="large" color={GREEN_MID} />
        <Text color="$gray10">Loading...</Text>
      </YStack>
    )
  }

  if (user === null) {
    return (
      <YStack
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        padding="$6"
        gap="$5"
      >
        <Text style={{ fontSize: 64 }}>🏔️</Text>
        <YStack gap="$2" style={{ alignItems: 'center' }}>
          <H2 style={{ textAlign: 'center' }}>JungfrauWallet</H2>
          <Paragraph style={{ textAlign: 'center' }} color="$gray10">
            Start by loading the demo data to explore the sustainable tourism experience.
          </Paragraph>
        </YStack>
        <GreenButton width="100%" onPress={() => void populateData({})}>
          Load test data
        </GreenButton>
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$5" paddingBottom="$8">
        {/* Header */}
        <YStack marginTop="$2" gap="$1">
          <Text color="$gray10" fontSize="$3">
            Welcome,
          </Text>
          <H2>{user.name}</H2>
        </YStack>

        {/* Balance card */}
        <Card elevation={4} borderRadius="$6" overflow="hidden">
          <YStack backgroundColor={GREEN_DARK} padding="$5" gap="$2">
            <Text color="rgba(255,255,255,0.65)" fontSize="$2">
              CURRENT BALANCE
            </Text>
            <XStack style={{ alignItems: 'baseline' }} gap="$2">
              <Text color="white" fontWeight="900" style={{ fontSize: 60, lineHeight: 68 }}>
                {user.greenTokensBalance}
              </Text>
              <Text color="rgba(255,255,255,0.75)" fontSize="$5" fontWeight="700">
                GT
              </Text>
            </XStack>
            <Text color="rgba(255,255,255,0.65)" fontSize="$3">
              Green Tokens available
            </Text>
          </YStack>
          <YStack backgroundColor={GREEN_MID} padding="$3">
            <Text
              color="rgba(255,255,255,0.85)"
              fontSize="$2"
              style={{ textAlign: 'center' }}
            >
              🌿 Sustainable Tourism Programme · Jungfrau Region
            </Text>
          </YStack>
        </Card>

        {/* Buy tokens */}
        <GreenButton onPress={() => router.push('/buy-tokens')}>
          💳 Buy Green Tokens
        </GreenButton>

        {/* QR Code button */}
        <GreenButton
          onPress={() =>
            Alert.alert(
              '🎫 QR Code',
              'Your personal QR Code will be generated here.\nFeature coming soon.',
              [{ text: 'OK', style: 'default' }]
            )
          }
        >
          🎫 Generate my QR Code
        </GreenButton>

        <Separator />

        {/* Offers list */}
        <YStack gap="$3">
          <H2 fontSize="$6">Available Offers</H2>

          {offers === undefined ? (
            <YStack style={{ alignItems: 'center' }} padding="$4">
              <Spinner color={GREEN_MID} />
            </YStack>
          ) : offers.length === 0 ? (
            <Text color="$gray10">No offers available at the moment.</Text>
          ) : (
            offers.map((offer) => (
              <Card
                key={offer._id}
                elevation={1}
                borderWidth={1}
                borderColor="$color4"
                borderRadius="$5"
              >
                <XStack padding="$4" gap="$4" style={{ alignItems: 'center' }}>
                  {/* Offer info */}
                  <YStack flex={1} gap="$1">
                    <Text fontWeight="700" fontSize="$4">
                      {offer.title}
                    </Text>
                    <Paragraph color="$gray10" fontSize="$3">
                      {offer.description}
                    </Paragraph>
                    {offer.originalPriceCHF != null && (
                      <Text fontSize="$2" color="$gray9" fontWeight="500">
                        Original price: {offer.originalPriceCHF} CHF
                      </Text>
                    )}
                    {offer.discountPercentage != null && offer.discountPercentage > 0 && offer.discountPercentage < 100 && (
                      <Text fontSize="$2" color={GREEN_ACCENT} fontWeight="600">
                        −{offer.discountPercentage}% discount
                      </Text>
                    )}
                    {offer.discountPercentage === 100 && (
                      <Text fontSize="$2" color={GREEN_ACCENT} fontWeight="600">
                        Free with your tokens 🎁
                      </Text>
                    )}
                  </YStack>

                  {/* Token cost badge */}
                  <YStack
                    backgroundColor={GREEN_LIGHT}
                    borderRadius="$4"
                    padding="$3"
                    style={{ alignItems: 'center', minWidth: 72 }}
                  >
                    <Text fontWeight="900" color={GREEN_DARK} fontSize="$6">
                      {offer.tokenCost}
                    </Text>
                    <Text fontSize="$1" color={GREEN_ACCENT} fontWeight="600">
                      tokens
                    </Text>
                  </YStack>
                </XStack>

                {/* Book button */}
                <YStack paddingHorizontal="$4" paddingBottom="$4">
                  <Button
                    backgroundColor={GREEN_MID}
                    borderRadius="$4"
                    onPress={() =>
                      router.push({
                        pathname: '/book-offer',
                        params: { offerId: offer._id },
                      })
                    }
                  >
                    <Text color="white" fontWeight="bold" fontSize="$4">
                      Book
                    </Text>
                  </Button>
                </YStack>
              </Card>
            ))
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
