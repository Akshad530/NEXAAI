import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface NexaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  theme?: 'dark' | 'light';
  animated?: boolean;
}

export default function NexaLogo({
  size = 'md',
  layout = 'vertical',
  theme = 'light',
  animated = true,
}: NexaLogoProps) {
  const swirl = useRef(new Animated.Value(0)).current;
  const isHorizontal = layout === 'horizontal';

  const W = isHorizontal ? 48 : size === 'sm' ? 122 : size === 'md' ? 200 : 260;
  const H = isHorizontal ? 26 : size === 'sm' ? 42 : size === 'md' ? 72 : 96;
  const LINES = isHorizontal ? 12 : 20;
  const STEPS = 50;

  const wave = (offsetY: number, phase: number, amp: number) => {
    let d = '';
    for (let i = 0; i <= STEPS; i++) {
      const x = (i / STEPS) * 100;
      const env = Math.sin((i / STEPS) * Math.PI);
      const y = 25 + offsetY + Math.sin((i / STEPS) * Math.PI * 3.4 + phase) * amp * env;
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return d;
  };

  const paths = Array.from({ length: LINES }, (_, i) => {
    const phase = (i / LINES) * Math.PI * 0.85;
    const offsetY = (i - LINES / 2) * (isHorizontal ? 0.55 : 1.4);
    const amp = (isHorizontal ? 9 : 22) - Math.abs(i - LINES / 2) * (isHorizontal ? 0.35 : 0.9);
    return wave(offsetY, phase, amp);
  });

  useEffect(() => {
    if (!animated) return;

    const loop = Animated.loop(
      Animated.timing(swirl, {
        toValue: 1,
        duration: 6200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    );

    loop.start();
    return () => loop.stop();
  }, [animated, swirl]);

  const rotate = swirl.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const scale = swirl.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.98, 1.03, 0.98],
  });

  const icon = (
    <Animated.View style={{ width: W, height: H, transform: animated ? [{ rotate }, { scale }] : undefined }}>
      <Svg viewBox="0 0 100 50" width="100%" height="100%">
        <Defs>
          <LinearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#1a6fd4" stopOpacity="1" />
            <Stop offset="40%" stopColor="#4f9cf9" stopOpacity="0.8" />
            <Stop offset="68%" stopColor="#e85d3a" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#ff8c60" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {paths.map((d, i) => (
          <Path
            key={i}
            d={d}
            fill="none"
            stroke="url(#ng)"
            strokeWidth={i % 3 === 0 ? 0.9 : i % 2 === 0 ? 0.6 : 0.45}
            opacity={0.45 + (i / LINES) * 0.55}
          />
        ))}
      </Svg>
    </Animated.View>
  );

  const stack = (
    <View style={styles.vCol}>
      {icon}
      <View style={styles.vText}>
        <Text style={[styles.nexaV, styles.baseText, theme === 'dark' ? styles.nexaDark : styles.nexaLight]}>NEXA</Text>
        <Text style={[styles.pipeV, styles.baseText, theme === 'dark' ? styles.pipeDark : styles.pipeLight]}>|</Text>
        <Text style={[styles.aiV, styles.baseText, theme === 'dark' ? styles.aiDark : styles.aiLight]}>AI</Text>
      </View>
    </View>
  );

  if (isHorizontal) {
    return (
      <View style={styles.hRow}>
        {icon}
        <View style={styles.hText}>
          <Text style={[styles.nexaH, styles.baseText, theme === 'dark' ? styles.nexaDark : styles.nexaLight]}>NEXA</Text>
          <Text style={[styles.pipeH, styles.baseText, theme === 'dark' ? styles.pipeDark : styles.pipeLight]}>|</Text>
          <Text style={[styles.aiH, styles.baseText, theme === 'dark' ? styles.aiDark : styles.aiLight]}>AI</Text>
        </View>
      </View>
    );
  }

  const fs = size === 'sm' ? 15 : size === 'md' ? 22 : 28;
  const ls = size === 'sm' ? 2 : size === 'md' ? 4 : 5;
  const mx = size === 'sm' ? 8 : size === 'md' ? 12 : 14;

  return (
    <View style={styles.vCol}>
      {icon}
      <View style={styles.vText}>
        <Text style={[styles.nexaV, styles.baseText, { fontSize: fs, letterSpacing: ls }, theme === 'dark' ? styles.nexaDark : styles.nexaLight]}>NEXA</Text>
        <Text style={[styles.pipeV, styles.baseText, { fontSize: fs, marginHorizontal: mx }, theme === 'dark' ? styles.pipeDark : styles.pipeLight]}>|</Text>
        <Text style={[styles.aiV, styles.baseText, { fontSize: fs, letterSpacing: ls }, theme === 'dark' ? styles.aiDark : styles.aiLight]}>AI</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hRow: { flexDirection: 'row', alignItems: 'center' },
  hText: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  nexaH: { fontSize: 16, fontWeight: '800', letterSpacing: 1.8 },
  pipeH: { fontSize: 17, fontWeight: '200', marginHorizontal: 7 },
  aiH: { fontSize: 16, fontWeight: '800', letterSpacing: 1.8 },

  vCol: { alignItems: 'center' },
  vText: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  nexaV: { fontWeight: '800' },
  pipeV: { fontWeight: '200' },
  aiV: { fontWeight: '800' },
  baseText: { includeFontPadding: false },

  nexaLight: { color: '#1a6fd4' },
  pipeLight: { color: '#1a6fd4' },
  aiLight: { color: '#e85d3a' },

  nexaDark: { color: '#5BAAFF' },
  pipeDark: { color: '#5BAAFF' },
  aiDark: { color: '#FF9070' },
});
