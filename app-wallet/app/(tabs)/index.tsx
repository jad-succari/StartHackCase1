import { Alert } from 'react-native'
import { useMutation, useQuery } from 'convex/react'
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
        <Text color="$gray10">Chargement...</Text>
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
            Commencez par initialiser les données de démonstration pour explorer l'expérience
            touristique durable.
          </Paragraph>
        </YStack>
        <GreenButton width="100%" onPress={() => void populateData({})}>
          Initialiser les données de test
        </GreenButton>
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$5" paddingBottom="$8">
        {/* ── Header ── */}
        <YStack marginTop="$2" gap="$1">
          <Text color="$gray10" fontSize="$3">
            Bienvenue,
          </Text>
          <H2>{user.name}</H2>
        </YStack>

        {/* ── Carte de solde ── */}
        <Card elevation={4} borderRadius="$6" overflow="hidden">
          <YStack backgroundColor={GREEN_DARK} padding="$5" gap="$2">
            <Text color="rgba(255,255,255,0.65)" fontSize="$2">
              SOLDE ACTUEL
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
              Green Tokens disponibles
            </Text>
          </YStack>
          <YStack backgroundColor={GREEN_MID} padding="$3">
            <Text
              color="rgba(255,255,255,0.85)"
              fontSize="$2"
              style={{ textAlign: 'center' }}
            >
              🌿 Programme Tourisme Durable · Région Jungfrau
            </Text>
          </YStack>
        </Card>

        {/* ── Bouton QR Code ── */}
        <GreenButton
          onPress={() =>
            Alert.alert(
              '🎫 QR Code',
              'Votre QR Code personnel sera généré ici.\nFonctionnalité en cours de développement.',
              [{ text: 'OK', style: 'default' }]
            )
          }
        >
          🎫 Générer mon QR Code
        </GreenButton>

        <Separator />

        {/* ── Liste des offres ── */}
        <YStack gap="$3">
          <H2 fontSize="$6">Offres disponibles</H2>

          {offers === undefined ? (
            <YStack style={{ alignItems: 'center' }} padding="$4">
              <Spinner color={GREEN_MID} />
            </YStack>
          ) : offers.length === 0 ? (
            <Text color="$gray10">Aucune offre disponible pour le moment.</Text>
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
                  {/* Infos de l'offre */}
                  <YStack flex={1} gap="$1">
                    <Text fontWeight="700" fontSize="$4">
                      {offer.title}
                    </Text>
                    <Paragraph color="$gray10" fontSize="$3">
                      {offer.description}
                    </Paragraph>
                    {offer.discountPercentage > 0 && offer.discountPercentage < 100 && (
                      <Text fontSize="$2" color={GREEN_ACCENT} fontWeight="600">
                        −{offer.discountPercentage}% de réduction
                      </Text>
                    )}
                    {offer.discountPercentage === 100 && (
                      <Text fontSize="$2" color={GREEN_ACCENT} fontWeight="600">
                        Offert avec vos tokens 🎁
                      </Text>
                    )}
                  </YStack>

                  {/* Badge coût tokens */}
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
              </Card>
            ))
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
