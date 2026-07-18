import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

const HAND_STROKE = '#151515';
const ACCENT = '#ff6f61';
const MUTED = '#8f8f8f';
const FIELD_BG = '#f7f7f7';
const CARD_BG = '#ffffff';
const PAGE_BG = '#fbfbfb';
const GOOGLE = '#ecf2ff';
const APPLE = '#111111';

function AnimatedHandNetwork() {
  const float = useRef(new Animated.Value(0)).current;
  const dotA = useRef(new Animated.Value(0)).current;
  const dotB = useRef(new Animated.Value(0)).current;
  const dotC = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotA, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(dotA, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotB, { toValue: 1, duration: 2300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(dotB, { toValue: 0, duration: 2300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotC, { toValue: 1, duration: 2100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(dotC, { toValue: 0, duration: 2100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ),
    ];

    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [dotA, dotB, dotC, float]);

  const handY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const handRotate = float.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '1.5deg'] });

  const points = useMemo(
    () => [
      { x: 62, y: 80, size: 9, anim: dotA },
      { x: 112, y: 42, size: 7, anim: dotB },
      { x: 176, y: 68, size: 10, anim: dotC },
      { x: 224, y: 38, size: 6, anim: dotA },
      { x: 258, y: 95, size: 8, anim: dotB },
      { x: 201, y: 128, size: 7, anim: dotC },
    ],
    [dotA, dotB, dotC]
  );

  return (
    <View style={styles.illustrationWrap}>
      <Svg width="100%" height="100%" viewBox="0 0 320 260" style={StyleSheet.absoluteFill}>
        <Line x1="62" y1="80" x2="112" y2="42" stroke="#e9a099" strokeWidth="2" strokeDasharray="5 6" />
        <Line x1="112" y1="42" x2="176" y2="68" stroke="#e9a099" strokeWidth="2" strokeDasharray="5 6" />
        <Line x1="176" y1="68" x2="224" y2="38" stroke="#e9a099" strokeWidth="2" strokeDasharray="5 6" />
        <Line x1="176" y1="68" x2="258" y2="95" stroke="#e9a099" strokeWidth="2" strokeDasharray="5 6" />
        <Line x1="258" y1="95" x2="201" y2="128" stroke="#e9a099" strokeWidth="2" strokeDasharray="5 6" />
      </Svg>

      {points.map((point, index) => {
        const translateY = point.anim.interpolate({ inputRange: [0, 1], outputRange: [0, index % 2 === 0 ? -10 : 9] });
        const translateX = point.anim.interpolate({ inputRange: [0, 1], outputRange: [0, index % 2 === 0 ? 7 : -6] });
        const scale = point.anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.16] });
        return (
          <Animated.View
            key={`${point.x}-${point.y}`}
            style={[
              styles.dot,
              {
                width: point.size,
                height: point.size,
                borderRadius: point.size / 2,
                left: point.x,
                top: point.y,
                transform: [{ translateX }, { translateY }, { scale }],
              },
            ]}
          />
        );
      })}

      <Animated.View style={[styles.handLayer, { transform: [{ translateY: handY }, { rotate: handRotate }] }]}>
        <Svg width="286" height="206" viewBox="0 0 286 206">
          <Path
            d="M67 154c13 8 31 16 55 18 28 2 53-9 73-27l48-44c8-8 20-7 27 1 7 8 6 20-2 27l-61 54c-26 22-57 27-92 21-36-6-65-21-91-45-7-7-8-18-1-26 7-7 18-8 26-1l18 22Z"
            fill="none"
            stroke={HAND_STROKE}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M123 169 79 91c-4-8-1-18 7-22 8-4 18-1 23 7l35 62"
            fill="none"
            stroke={HAND_STROKE}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M146 139 111 69c-4-8 0-18 8-22 8-4 18 0 22 8l32 65" fill="none" stroke={HAND_STROKE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M174 121 150 60c-3-9 1-18 10-21 9-3 18 1 21 10l22 58" fill="none" stroke={HAND_STROKE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M203 107 192 62c-2-9 3-18 12-20 9-2 18 3 20 12l10 39" fill="none" stroke={HAND_STROKE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="78" cy="90" r="5" fill={ACCENT} />
          <Circle cx="113" cy="69" r="5" fill={ACCENT} />
          <Circle cx="151" cy="60" r="5" fill={ACCENT} />
          <Circle cx="193" cy="63" r="5" fill={ACCENT} />
        </Svg>
      </Animated.View>
    </View>
  );
}

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const isSignUp = mode === 'signup';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}>
        <View style={styles.card}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}><Text style={styles.logoText}>N</Text></View>
            <Text style={styles.brandText}>NEXA AI</Text>
          </View>

          <AnimatedHandNetwork />

          <View style={styles.copyBlock}>
            <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
            <Text style={styles.subtitle}>{isSignUp ? 'Start your AI journey with NEXA today.' : 'Welcome back, you have been missed.'}</Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputShell}>
                <Feather name="user" size={18} color={MUTED} />
                <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={MUTED} />
              </View>
            )}
            <View style={styles.inputShell}>
              <Feather name="mail" size={18} color={MUTED} />
              <TextInput style={styles.input} placeholder="Email address" placeholderTextColor={MUTED} autoCapitalize="none" keyboardType="email-address" />
            </View>
            <View style={styles.inputShell}>
              <Feather name="lock" size={18} color={MUTED} />
              <TextInput style={styles.input} placeholder="Password" placeholderTextColor={MUTED} secureTextEntry />
              <Feather name="eye-off" size={18} color={MUTED} />
            </View>
            {!isSignUp && <Text style={styles.forgot}>Forgot Password?</Text>}

            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            </Pressable>

            <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>or</Text><View style={styles.divider} /></View>

            <View style={styles.socialRow}>
              <Pressable style={[styles.socialButton, styles.googleButton]}><Text style={styles.googleG}>G</Text></Pressable>
              <Pressable style={[styles.socialButton, styles.appleButton]}><Feather name="smartphone" size={20} color="#fff" /></Pressable>
            </View>
          </View>

          <Pressable style={styles.switchRow} onPress={() => setMode(isSignUp ? 'signin' : 'signup')}>
            <Text style={styles.switchMuted}>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</Text>
            <Text style={styles.switchAccent}> {isSignUp ? 'Sign In' : 'Sign Up'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 22 },
  card: {
    width: '100%', maxWidth: 390, minHeight: 770, backgroundColor: CARD_BG, borderRadius: 42,
    paddingHorizontal: 28, paddingTop: 28, paddingBottom: 24, shadowColor: '#000', shadowOpacity: 0.12,
    shadowRadius: 28, shadowOffset: { width: 0, height: 18 }, elevation: 10,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: { width: 34, height: 34, borderRadius: 12, backgroundColor: HAND_STROKE, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  brandText: { color: HAND_STROKE, fontSize: 16, fontWeight: '800', letterSpacing: 1.5 },
  illustrationWrap: { height: 248, marginTop: 20, marginHorizontal: -8 },
  handLayer: { position: 'absolute', left: 10, right: 0, bottom: 4, alignItems: 'center' },
  dot: { position: 'absolute', backgroundColor: ACCENT, shadowColor: ACCENT, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  copyBlock: { alignItems: 'center', marginTop: 4 },
  title: { fontSize: 31, lineHeight: 37, fontWeight: '800', color: HAND_STROKE, letterSpacing: -0.7 },
  subtitle: { marginTop: 8, color: MUTED, fontSize: 15, lineHeight: 21, textAlign: 'center' },
  form: { marginTop: 26 },
  inputShell: { height: 58, borderRadius: 18, backgroundColor: FIELD_BG, paddingHorizontal: 18, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, color: HAND_STROKE, fontSize: 15, fontWeight: '500' },
  forgot: { color: ACCENT, fontSize: 14, fontWeight: '700', alignSelf: 'flex-end', marginBottom: 18, marginTop: -2 },
  primaryButton: { height: 58, borderRadius: 18, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', shadowColor: ACCENT, shadowOpacity: 0.32, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 24 },
  divider: { flex: 1, height: 1, backgroundColor: '#ededed' },
  dividerText: { color: MUTED, fontSize: 14, fontWeight: '600' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 18 },
  socialButton: { width: 64, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  googleButton: { backgroundColor: GOOGLE },
  appleButton: { backgroundColor: APPLE },
  googleG: { color: '#4285f4', fontSize: 22, fontWeight: '900' },
  switchRow: { marginTop: 'auto', paddingTop: 22, alignSelf: 'center', flexDirection: 'row' },
  switchMuted: { color: MUTED, fontSize: 14, fontWeight: '600' },
  switchAccent: { color: ACCENT, fontSize: 14, fontWeight: '800' },
});
