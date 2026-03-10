// ============================================================
// src/screens/LoginScreen.tsx
// Login screen with email/password authentication
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Button, Input } from '../components';
import { useAppDispatch, useAuth } from '../hooks';
import { loginAsync, clearError } from '../store/slices/authSlice';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ─── Validation ───────────────────────────────────────────
  const validate = (): boolean => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!email.includes('@')) {
      setEmailError('Enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    }

    return valid;
  };

  // ─── Submit ───────────────────────────────────────────────
  const handleLogin = async () => {
    if (!validate()) return;
    dispatch(clearError());
    const result = await dispatch(loginAsync({ email: email.trim(), password }));
    if (loginAsync.rejected.match(result)) {
      Alert.alert('Login Failed', result.payload as string);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoSymbol}>◈</Text>
          </View>
          <Text style={styles.appName}>NEXUS</Text>
          <Text style={styles.appTagline}>Task Operating System</Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to continue your workflow</Text>

          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="✉"
              error={emailError}
            />

            <Input
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="🔒"
              error={passwordError}
            />

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            )}

            <Button
              label="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              size="lg"
              style={{ marginTop: Spacing.md }}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register link */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Text style={styles.registerAction}>Create one →</Text>
          </TouchableOpacity>
        </View>

        {/* Decorative dots */}
        <View style={styles.decorRow}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={[styles.dot, { opacity: 0.2 + i * 0.15 }]} />
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    paddingBottom: Spacing.huge,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.huge,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.accent,
  },
  logoSymbol: { fontSize: 32, color: Colors.white },
  appName: {
    ...Typography.displayMD,
    color: Colors.textPrimary,
    letterSpacing: 6,
  },
  appTagline: {
    ...Typography.capsXS,
    color: Colors.textMuted,
    letterSpacing: 3,
    marginTop: Spacing.xs,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.lg,
  },
  cardTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    ...Typography.bodyMD,
    color: Colors.textMuted,
    marginBottom: Spacing.xxl,
  },
  form: {},
  errorBox: {
    backgroundColor: Colors.error + '15',
    borderWidth: 1,
    borderColor: Colors.error + '40',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodyMD,
    color: Colors.error,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  dividerText: {
    ...Typography.labelSM,
    color: Colors.textMuted,
    marginHorizontal: Spacing.md,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: { ...Typography.bodyMD, color: Colors.textMuted },
  registerAction: { ...Typography.bodyMD, color: Colors.accent, fontWeight: '600' },
  decorRow: {
    flexDirection: 'row',
    marginTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
});
