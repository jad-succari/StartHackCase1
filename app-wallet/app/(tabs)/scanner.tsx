import { useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Spinner, Text, YStack } from 'tamagui'

const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const TEAL      = '#2A8FA0'
const RED       = '#B8362A'

type Banner = { success: boolean; message: string } | null

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const validateTicket = useMutation(api.wallet.validateTicket)
  const isProcessing = useRef(false)
  const [scanning, setScanning] = useState(true)
  const [banner, setBanner] = useState<Banner>(null)
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showBanner = (result: { success: boolean; message: string }) => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current)
    setBanner(result)
    bannerTimer.current = setTimeout(() => {
      setBanner(null)
      isProcessing.current = false
      setScanning(true)
    }, 2500)
  }

  if (!permission) {
    return (
      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} backgroundColor={BG}>
        <Spinner size="large" color={TEAL} />
      </YStack>
    )
  }

  if (!permission.granted) {
    return (
      <YStack style={{ flex: 1, backgroundColor: BG }}>
        <YStack
          backgroundColor="#111111"
          paddingTop="$12"
          paddingBottom="$5"
          paddingHorizontal="$5"
          gap="$1"
        >
          <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '400', color: 'white', letterSpacing: -0.5 }}>
            Scanner
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Partner mode
          </Text>
        </YStack>

        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} padding="$6" gap="$5">
          <Text style={{ fontSize: 52 }}>📷</Text>
          <YStack gap="$2" style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1612', textAlign: 'center' }}>
              Camera access required
            </Text>
            <Text style={{ fontSize: 14, color: INK_LIGHT, textAlign: 'center', lineHeight: 20 }}>
              The ticket scanner requires access to your camera to read QR codes.
            </Text>
          </YStack>
          <TouchableOpacity
            onPress={requestPermission}
            style={{
              backgroundColor: TEAL,
              borderRadius: 14,
              paddingVertical: 16,
              paddingHorizontal: 32,
              width: '100%',
              alignItems: 'center',
              shadowColor: TEAL,
              shadowOpacity: 0.25,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>
              Allow camera access
            </Text>
          </TouchableOpacity>
        </YStack>
      </YStack>
    )
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (isProcessing.current || !scanning) return
    isProcessing.current = true
    setScanning(false)

    try {
      const result = await validateTicket({ externalTicketId: data })
      showBanner(result)
    } catch {
      showBanner({ success: false, message: 'Unable to validate the ticket.' })
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
        {/* Top bar */}
        <YStack
          style={{ backgroundColor: 'rgba(10,8,6,0.72)', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, alignItems: 'center', gap: 2 }}
        >
          <Text style={{ fontFamily: 'Georgia', fontSize: 22, fontWeight: '400', color: 'white' }}>
            Valider un avantage
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase' }}>
            Mode Partenaire · EtherLaken
          </Text>
        </YStack>

        {/* Viewfinder */}
        <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} gap="$3">
          <View style={[
            styles.scanFrame,
            banner !== null && { borderColor: banner.success ? 'rgba(42,143,160,0.9)' : 'rgba(184,54,42,0.9)' },
          ]} />
          {scanning && (
            <View style={{
              backgroundColor: 'rgba(10,8,6,0.55)',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Alignez le QR code dans le cadre · Usage unique
              </Text>
            </View>
          )}
        </YStack>

        {/* Bottom bar */}
        <YStack
          style={{ backgroundColor: 'rgba(10,8,6,0.72)', padding: 24, alignItems: 'center', gap: 8, minHeight: 90 }}
        >
          {scanning && !banner && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: TEAL }} />
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                Prêt à scanner…
              </Text>
            </View>
          )}

          {!scanning && !banner && (
            <YStack style={{ alignItems: 'center' }} gap="$2">
              <Spinner color="white" size="small" />
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                Validating ticket…
              </Text>
            </YStack>
          )}

          {banner && (
            <YStack style={{ alignItems: 'center' }} gap="$2">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{
                  width: 32, height: 32,
                  borderRadius: 16,
                  backgroundColor: banner.success ? TEAL : RED,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 16, color: 'white', fontWeight: '700', lineHeight: 18 }}>
                    {banner.success ? '✓' : '✕'}
                  </Text>
                </View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: banner.success ? TEAL : RED,
                  letterSpacing: 0.3,
                }}>
                  {banner.success ? 'Avantage validé ✓' : 'Billet invalide'}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
                {banner.message}
              </Text>
              {banner.success && (
                <View style={{
                  flexDirection: 'row',
                  gap: 12,
                  marginTop: 4,
                  backgroundColor: 'rgba(42,143,160,0.15)',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(42,143,160,0.3)',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}>
                  {[
                    { label: 'Ancrage', value: '1 LAKE = 1 CHF' },
                    { label: 'Règlement', value: 'Mensuel auto' },
                    { label: 'Frais', value: '0%' },
                  ].map((item, i) => (
                    <View key={i} style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' }}>{item.label}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: TEAL, marginTop: 1 }}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              )}
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
    width: 230,
    height: 230,
    borderWidth: 2,
    borderColor: 'rgba(42,143,160,0.9)',
    borderRadius: 20,
    shadowColor: '#2A8FA0',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
})
