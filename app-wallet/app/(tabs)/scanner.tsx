import { useRef, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button, Spinner, Text, YStack } from 'tamagui'

const GREEN_DARK = '#1B5E20'
const GREEN_MID = '#2E7D32'

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const validateTicket = useMutation(api.wallet.validateTicket)
  const isProcessing = useRef(false)
  const [scanning, setScanning] = useState(true)

  if (!permission) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="large" color={GREEN_MID} />
      </YStack>
    )
  }

  if (!permission.granted) {
    return (
      <YStack
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        padding="$6"
        gap="$5"
      >
        <Text style={{ fontSize: 48 }}>📷</Text>
        <Text fontWeight="700" fontSize="$5" style={{ textAlign: 'center' }}>
          Camera access required
        </Text>
        <Text color="$gray10" fontSize="$3" style={{ textAlign: 'center' }}>
          The ticket scanner requires access to your camera.
        </Text>
        <Button
          size="$5"
          backgroundColor={GREEN_MID}
          borderRadius="$4"
          width="100%"
          onPress={requestPermission}
        >
          <Text color="white" fontWeight="bold" fontSize="$4">
            Allow camera access
          </Text>
        </Button>
      </YStack>
    )
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (isProcessing.current || !scanning) return
    isProcessing.current = true
    setScanning(false)

    try {
      const result = await validateTicket({ externalTicketId: data })

      Alert.alert(
        result.success ? '✅ Valid ticket' : '❌ Invalid ticket',
        result.message,
        [
          {
            text: 'Scan another ticket',
            onPress: () => {
              isProcessing.current = false
              setScanning(true)
            },
          },
        ]
      )
    } catch {
      Alert.alert('Error', 'Unable to validate the ticket.', [
        {
          text: 'Try again',
          onPress: () => {
            isProcessing.current = false
            setScanning(true)
          },
        },
      ])
    }
  }

  return (
    <YStack style={{ flex: 1 }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
      />

      {/* Overlay */}
      <YStack style={styles.overlay}>
        <YStack backgroundColor={GREEN_DARK} padding="$4" style={{ alignItems: 'center' }}>
          <Text color="white" fontWeight="700" fontSize="$5">
            Scan a ticket
          </Text>
          <Text color="rgba(255,255,255,0.7)" fontSize="$2">
            Partner Mode
          </Text>
        </YStack>

        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <YStack style={styles.scanFrame} />
        </YStack>

        <YStack
          backgroundColor="rgba(0,0,0,0.6)"
          padding="$4"
          style={{ alignItems: 'center' }}
        >
          {scanning ? (
            <Text color="white" fontSize="$3">
              Point the camera at the ticket QR code
            </Text>
          ) : (
            <YStack style={{ alignItems: 'center' }} gap="$2">
              <Spinner color="white" />
              <Text color="white" fontSize="$3">Validating...</Text>
            </YStack>
          )}
        </YStack>
      </YStack>
    </YStack>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
})
