// ============================================================
// src/screens/SplashScreen.tsx
// App launch screen - restores session then redirects
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
import { useAppDispatch } from '../hooks';
import { restoreSessionAsync } from '../store/slices/authSlice';

const SplashScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.8);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: false }),
    ]).start();

    // Restore session from AsyncStorage
    dispatch(restoreSessionAsync());
  }, []);

  return (
    <View style={styles.container}>
      {/* Background grid pattern */}
      <View style={styles.gridOverlay} />

      <Animated.View style={[styles.logoContainer, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoSymbol}>◈</Text>
        </View>
        <Text style={styles.logoText}>NEXUS</Text>
        <Text style={styles.logoSubtext}>TASK OS</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity }]}>
        <Text style={styles.loadingText}>Initializing...</Text>
        <View style={styles.loadingBar}>
          <Animated.View style={styles.loadingFill} />
        </View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    opacity: 0.03,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  logoSymbol: {
    fontSize: 40,
    color: Colors.white,
  },
  logoText: {
    ...Typography.displayLG,
    color: Colors.textPrimary,
    letterSpacing: 8,
  },
  logoSubtext: {
    ...Typography.capsXS,
    color: Colors.accent,
    letterSpacing: 6,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    ...Typography.labelSM,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    letterSpacing: 2,
  },
  loadingBar: {
    width: 120,
    height: 2,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 1,
    overflow: 'hidden',
  },
  loadingFill: {
    width: '70%',
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },
});
