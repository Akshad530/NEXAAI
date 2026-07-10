import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface NexaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  theme?: 'dark' | 'light';
  showText?: boolean;
}

export default function NexaLogo({
  size = 'md',
  layout = 'vertical',
  theme = 'light',
  showText = true,
}: NexaLogoProps) {
  const isHorizontal = layout === 'horizontal';
  
  const imgSize = size === 'sm' ? 24 : size === 'md' ? 60 : 100;
  const fontSize = size === 'sm' ? 12 : size === 'md' ? 20 : 28;
  const spacing = size === 'sm' ? 6 : size === 'md' ? 10 : 16;

  const logoImg = (
    <Image 
      source={require('@assets/logo.jpg')} 
      style={{ width: imgSize, height: imgSize }}
      resizeMode="contain"
    />
  );

  if (isHorizontal) {
    return (
      <View style={styles.hRow}>
        {logoImg}
        {showText && (
          <View style={[styles.hText, { marginLeft: spacing }]}>
            <Text style={[styles.nexaText, { fontSize }, theme === 'dark' ? styles.textDark : styles.textLight]}>
              NEXA AI
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.vCol}>
      {logoImg}
      {showText && (
        <View style={[styles.vText, { marginTop: spacing }]}>
          <Text style={[styles.nexaText, { fontSize }, theme === 'dark' ? styles.textDark : styles.textLight]}>
            NEXA AI
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  hText: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  vCol: { 
    alignItems: 'center',
  },
  vText: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  nexaText: { 
    fontWeight: '700', 
    letterSpacing: -0.5,
    fontFamily: 'System',
  },
  textLight: { color: '#1D1D1D' },
  textDark: { color: '#FFFFFF' },
});
