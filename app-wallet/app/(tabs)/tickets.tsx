import { useState } from 'react'
import { Alert, View } from 'react-native'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Button, Card, H2, Paragraph, ScrollView, Spinner, Text, YStack } from 'tamagui'

const GREEN_DARK = '#1B5E20'
const GREEN_MID = '#2E7D32'
const GREEN_LIGHT = '#E8F5E9'
const RED = '#C62828'

export default function TicketsScreen() {
  const user = useQuery(api.wallet.getUser)
  const tickets = useQuery(
    api.wallet.getUserTickets,
    user ? { userId: user._id } : 'skip'
  )
  const cancelTicket = useMutation(api.wallet.cancelTicket)
  const [cancellingId, setCancellingId] = useState<Id<'tickets'> | null>(null)

  const doCancel = async (ticketId: Id<'tickets'>) => {
    setCancellingId(ticketId)
    try {
      await cancelTicket({ ticketId })
      Alert.alert('Réservation annulée', 'Vos tokens ont été remboursés.')
    } catch (err) {
      Alert.alert('Erreur', (err as Error).message)
    } finally {
      setCancellingId(null)
    }
  }

  const handleCancel = (ticketId: Id<'tickets'>, offerTitle: string) => {
    Alert.alert(
      'Annuler la réservation',
      `Voulez-vous annuler "${offerTitle}" ?\nVos tokens vous seront remboursés.`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => void doCancel(ticketId),
        },
      ]
    )
  }

  if (user === undefined || tickets === undefined) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} gap="$3">
        <Spinner size="large" color={GREEN_MID} />
        <Text color="$gray10">Chargement...</Text>
      </YStack>
    )
  }

  if (!user || !tickets || tickets.length === 0) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} padding="$6" gap="$3">
        <Text style={{ fontSize: 48 }}>🎫</Text>
        <Paragraph style={{ textAlign: 'center' }} color="$gray10">
          Vous n'avez aucune réservation en cours
        </Paragraph>
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$4" paddingBottom="$8">
        <H2>Mes Billets</H2>

        {tickets.map((ticket) => {
          const isValide = ticket.status === 'valide'
          const isCancelling = cancellingId === ticket._id

          return (
            <Card
              key={ticket._id}
              elevation={isValide ? 2 : 0}
              borderRadius="$5"
              borderWidth={1}
              borderColor={isValide ? '$color4' : '$color3'}
              overflow="hidden"
              opacity={isValide ? 1 : 0.6}
            >
              {/* En-tête */}
              <YStack
                backgroundColor={isValide ? GREEN_DARK : '#757575'}
                padding="$4"
                gap="$1"
              >
                <Text color="white" fontWeight="700" fontSize="$5">
                  {ticket.offerTitle}
                </Text>
                <Text color="rgba(255,255,255,0.7)" fontSize="$2">
                  ID Partenaire : {ticket.externalTicketId}
                </Text>
              </YStack>

              {/* QR Code simulé — uniquement si valide */}
              {isValide && (
                <YStack
                  backgroundColor={GREEN_LIGHT}
                  padding="$5"
                  style={{ alignItems: 'center' }}
                >
                  <View
                    style={{
                      width: 140,
                      height: 140,
                      backgroundColor: '#9E9E9E',
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 13,
                        textAlign: 'center',
                        fontWeight: '700',
                      }}
                    >
                      {'█ █ █\n█   █\n█ █ █\n\nQR CODE'}
                    </Text>
                  </View>
                </YStack>
              )}

              {/* Infos + actions */}
              <YStack padding="$4" gap="$3">
                <YStack gap="$1">
                  <Text fontSize="$3" color="$gray10">
                    Date d'achat :{' '}
                    {new Date(ticket.purchasedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text
                    fontSize="$3"
                    fontWeight="700"
                    color={isValide ? GREEN_MID : '$gray10'}
                  >
                    Statut : {ticket.status.toUpperCase()}
                  </Text>
                </YStack>

                {isValide && (
                  <Button
                    size="$3"
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor={isCancelling ? '$gray5' : RED}
                    backgroundColor="white"
                    disabled={isCancelling}
                    onPress={() => handleCancel(ticket._id, ticket.offerTitle)}
                  >
                    {isCancelling ? (
                      <Spinner size="small" color={RED} />
                    ) : (
                      <Text color={RED} fontWeight="600" fontSize="$3">
                        Annuler la réservation
                      </Text>
                    )}
                  </Button>
                )}
              </YStack>
            </Card>
          )
        })}
      </YStack>
    </ScrollView>
  )
}
