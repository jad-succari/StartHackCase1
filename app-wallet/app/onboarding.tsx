import React, { useRef, useState } from 'react'
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useMutation } from 'convex/react'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../convex/_generated/api'
import { setRole } from '../lib/roleStore'
import { Text, YStack } from 'tamagui'

const TEAL = '#2A8FA0'
const INK  = '#1A1612'
const INK_LIGHT = '#A89E92'
const BG        = '#FAF8F5'
const WHITE     = '#FFFFFF'

type Step = 1 | 2 | 3

type FormData = {
  name: string
  email: string
  phone: string
  hotelName: string
  stayStart: string
  stayEnd: string
  referralCodeEntered: string
}

export default function OnboardingScreen() {
  const { top, bottom } = useSafeAreaInsets()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    hotelName: '',
    stayStart: '',
    stayEnd: '',
    referralCodeEntered: '',
  })
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkScale = useRef(new Animated.Value(0)).current
  const notifY = useRef(new Animated.Value(-120)).current
  const notifOpacity = useRef(new Animated.Value(0)).current

  const createTourist = useMutation(api.auth.createTourist)

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Full name and email are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await createTourist({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        hotelName: form.hotelName.trim() || undefined,
        stayStart: form.stayStart.trim() || undefined,
        stayEnd: form.stayEnd.trim() || undefined,
        referralCodeEntered: form.referralCodeEntered.trim().toUpperCase() || undefined,
      })
      setReferralCode(result.referralCode)
      setStep(3)

      // Animate checkmark
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }).start()

      // Show notification banner after 2s
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(notifY, {
            toValue: 0,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(notifOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start()

        // Auto-dismiss after 3s
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(notifY, {
              toValue: -120,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(notifOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start()
        }, 3000)
      }, 2000)
    } catch (e: any) {
      setError(e.message ?? 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleEnter = () => {
    setRole('tourist')
    router.replace('/(tabs)')
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {step === 1 && <Step1 top={top} bottom={bottom} onNext={() => setStep(2)} />}
      {step === 2 && (
        <Step2
          top={top}
          bottom={bottom}
          form={form}
          setForm={setForm}
          error={error}
          loading={loading}
          onSubmit={handleCreate}
        />
      )}
      {step === 3 && (
        <Step3
          top={top}
          bottom={bottom}
          referralCode={referralCode}
          checkScale={checkScale}
          notifY={notifY}
          notifOpacity={notifOpacity}
          onEnter={handleEnter}
        />
      )}
    </View>
  )
}

/* ─── Step 1: Welcome ─── */
function Step1({ top, bottom, onNext }: { top: number; bottom: number; onNext: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      {/* Dark gradient hero */}
      <View style={{
        flex: 1,
        backgroundColor: '#0D1F1F',
        paddingTop: top + 24,
        paddingHorizontal: 32,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0,
      }}>
        {/* Logo mark */}
        <View style={{ marginBottom: 32, alignItems: 'center' }}>
          <View style={{
            width: 72, height: 72, borderRadius: 20,
            backgroundColor: 'rgba(42,143,160,0.18)',
            borderWidth: 1, borderColor: 'rgba(42,143,160,0.4)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 36 }}>🏔️</Text>
          </View>
        </View>

        <Text style={{
          fontSize: 32, fontWeight: '700', color: WHITE,
          textAlign: 'center', letterSpacing: -0.5, marginBottom: 8,
        }}>
          EtherLaken
        </Text>
        <Text style={{
          fontSize: 13, color: 'rgba(255,255,255,0.4)',
          letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', marginBottom: 32,
        }}>
          Sustainable tourism · Jungfrau
        </Text>

        <Text style={{
          fontSize: 17, color: 'rgba(255,255,255,0.75)',
          textAlign: 'center', lineHeight: 26, maxWidth: 280,
        }}>
          Earn LAKE tokens by choosing sustainable local experiences in the Jungfrau region.
        </Text>

        {/* Progress dots */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 48, marginBottom: 0 }}>
          <View style={{ width: 20, height: 4, borderRadius: 2, backgroundColor: TEAL }} />
          <View style={{ width: 8, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <View style={{ width: 8, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </View>
      </View>

      {/* CTA */}
      <View style={{ padding: 24, paddingBottom: bottom + 24, backgroundColor: '#0D1F1F' }}>
        <TouchableOpacity
          onPress={onNext}
          style={{
            backgroundColor: TEAL,
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            shadowColor: TEAL,
            shadowOpacity: 0.4,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
          }}
        >
          <Text style={{ color: WHITE, fontWeight: '700', fontSize: 17 }}>
            Create my free account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

/* ─── Step 2: Registration form ─── */
function Step2({
  top, bottom, form, setForm, error, loading, onSubmit,
}: {
  top: number
  bottom: number
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  error: string
  loading: boolean
  onSubmit: () => void
}) {
  const set = (key: keyof FormData) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: top + 24, paddingHorizontal: 24, paddingBottom: bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress dots */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
          <View style={{ width: 8, height: 4, borderRadius: 2, backgroundColor: 'rgba(42,143,160,0.3)' }} />
          <View style={{ width: 20, height: 4, borderRadius: 2, backgroundColor: TEAL }} />
          <View style={{ width: 8, height: 4, borderRadius: 2, backgroundColor: 'rgba(42,143,160,0.3)' }} />
        </View>

        <Text style={{ fontSize: 26, fontWeight: '700', color: INK, marginBottom: 4 }}>
          Your profile
        </Text>
        <Text style={{ fontSize: 14, color: INK_LIGHT, marginBottom: 28, lineHeight: 20 }}>
          This information helps us personalize your experience.
        </Text>

        <Field label="Full name *" value={form.name} onChange={set('name')} placeholder="Alex Schmidt" />
        <Field label="Email *" value={form.email} onChange={set('email')} placeholder="alex@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Phone" value={form.phone} onChange={set('phone')} placeholder="+41 79 123 45 67" keyboardType="phone-pad" />
        <Field label="Hotel / Accommodation" value={form.hotelName} onChange={set('hotelName')} placeholder="Hotel Eiger, Grindelwald" />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Check-in" value={form.stayStart} onChange={set('stayStart')} placeholder="2026-07-15" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Check-out" value={form.stayEnd} onChange={set('stayEnd')} placeholder="2026-07-20" />
          </View>
        </View>

        <View style={{
          backgroundColor: 'rgba(42,143,160,0.06)',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(42,143,160,0.15)',
          padding: 16,
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: TEAL, marginBottom: 8, letterSpacing: 0.5 }}>
            REFERRAL CODE (optional)
          </Text>
          <TextInput
            value={form.referralCodeEntered}
            onChangeText={set('referralCodeEntered')}
            placeholder="Ex: AB1C2D"
            placeholderTextColor="rgba(42,143,160,0.4)"
            autoCapitalize="characters"
            style={{
              fontSize: 16, fontWeight: '700', color: TEAL,
              letterSpacing: 2, paddingVertical: 4,
            }}
          />
          <Text style={{ fontSize: 11, color: INK_LIGHT, marginTop: 6 }}>
            Enter a friend's code to get 5 bonus LAKE each.
          </Text>
        </View>

        {error ? (
          <Text style={{ color: '#E05050', fontSize: 13, marginTop: 8, marginBottom: 4 }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={onSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading ? 'rgba(42,143,160,0.5)' : TEAL,
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            marginTop: 24,
            shadowColor: TEAL,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <Text style={{ color: WHITE, fontWeight: '700', fontSize: 17 }}>
            {loading ? 'Creating account…' : 'Create my account'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* ─── Step 3: Success ─── */
function Step3({
  top, bottom, referralCode, checkScale, notifY, notifOpacity, onEnter,
}: {
  top: number
  bottom: number
  referralCode: string
  checkScale: Animated.Value
  notifY: Animated.Value
  notifOpacity: Animated.Value
  onEnter: () => void
}) {
  return (
    <View style={{ flex: 1 }}>
      {/* iOS-style notification banner */}
      <Animated.View style={{
        position: 'absolute',
        top: top + 8,
        left: 16, right: 16,
        zIndex: 100,
        transform: [{ translateY: notifY }],
        opacity: notifOpacity,
      }}>
        <View style={{
          backgroundColor: 'rgba(28,28,30,0.92)',
          borderRadius: 16,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
          <View style={{
            width: 36, height: 36, borderRadius: 8,
            backgroundColor: TEAL,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18 }}>🍃</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: WHITE, fontWeight: '600', fontSize: 14 }}>EtherLaken</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 1 }}>
              Welcome! You have 5 LAKE tokens as a gift 🎉
            </Text>
          </View>
        </View>
      </Animated.View>

      <YStack style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} paddingHorizontal="$8" gap="$5">
        {/* Animated checkmark */}
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <View style={{
            width: 88, height: 88, borderRadius: 44,
            backgroundColor: 'rgba(42,143,160,0.12)',
            borderWidth: 2, borderColor: TEAL,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 40 }}>✓</Text>
          </View>
        </Animated.View>

        <YStack style={{ alignItems: 'center' }} gap="$2">
          <Text style={{ fontSize: 28, fontWeight: '700', color: INK, textAlign: 'center' }}>
            Account created!
          </Text>
          <Text style={{ fontSize: 15, color: INK_LIGHT, textAlign: 'center', lineHeight: 22 }}>
            You received 5 welcome LAKE tokens.{'\n'}Start exploring sustainable offers.
          </Text>
        </YStack>

        {/* Referral code badge */}
        <View style={{
          backgroundColor: 'rgba(42,143,160,0.08)',
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: 'rgba(42,143,160,0.25)',
          paddingHorizontal: 28,
          paddingVertical: 18,
          alignItems: 'center',
          width: '100%',
        }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: TEAL, letterSpacing: 1.5, marginBottom: 8 }}>
            YOUR REFERRAL CODE
          </Text>
          <Text style={{
            fontSize: 28, fontWeight: '800', color: TEAL,
            letterSpacing: 6, fontFamily: 'monospace',
          }}>
            {referralCode}
          </Text>
          <Text style={{ fontSize: 12, color: INK_LIGHT, marginTop: 8, textAlign: 'center' }}>
            Share this code and earn 10 LAKE per friend referred.
          </Text>
        </View>
      </YStack>

      {/* CTA */}
      <View style={{ padding: 24, paddingBottom: bottom + 24 }}>
        <TouchableOpacity
          onPress={onEnter}
          style={{
            backgroundColor: TEAL,
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            shadowColor: TEAL,
            shadowOpacity: 0.35,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 7 },
          }}
        >
          <Text style={{ color: WHITE, fontWeight: '700', fontSize: 17 }}>
            Explore offers →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

/* ─── Reusable field ─── */
function Field({
  label, value, onChange, placeholder, keyboardType, autoCapitalize,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'email-address' | 'phone-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: INK_LIGHT, marginBottom: 6, letterSpacing: 0.5 }}>
        {label.toUpperCase()}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(26,22,18,0.25)"
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'words'}
        style={{
          backgroundColor: WHITE,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(26,22,18,0.1)',
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          color: INK,
        }}
      />
    </View>
  )
}
