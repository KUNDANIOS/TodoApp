// ============================================================
// src/screens/RegisterScreen.tsx
// New user registration with validation
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
import { registerAsync, clearError } from '../store/slices/authSlice';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Validation ───────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!displayName.trim()) newErrors.displayName = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;
    dispatch(clearError());
    const result = await dispatch(registerAsync({
      email: email.trim(),
      password,
      displayName: displayName.trim(),
    }));
    if (registerAsync.rejected.match(result)) {
      Alert.alert('Registration Failed', result.payload as string);
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

        {/* ── Back button ── */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Nexus and take control of your tasks</Text>
        </View>

        {/* ── Form card ── */}
        <View style={styles.card}>
          <Input
            label="Full Name"
            placeholder="Jane Doe"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            leftIcon="👤"
            error={errors.displayName}
          />

          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="✉"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Min. 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="🔒"
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon="🔑"
            error={errors.confirmPassword}
          />

          {/* Password strength indicator */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthLabel}>Password strength: </Text>
              <Text style={[styles.strengthValue, { color: password.length >= 8 ? Colors.success : password.length >= 6 ? Colors.warning : Colors.error }]}>
                {password.length >= 8 ? 'Strong' : password.length >= 6 ? 'Medium' : 'Weak'}
              </Text>
              <View style={styles.strengthBar}>
                <View style={[
                  styles.strengthFill,
                  {
                    width: `${Math.min((password.length / 12) * 100, 100)}%`,
                    backgroundColor: password.length >= 8 ? Colors.success : password.length >= 6 ? Colors.warning : Colors.error,
                  },
                ]} />
              </View>
            </View>
          )}

          <Button
            label="Create Account"
            onPress={handleRegister}
            isLoading={isLoading}
            size="lg"
            style={{ marginTop: Spacing.md }}
          />
        </View>

        {/* ── Sign in link ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerAction}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.huge,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  backIcon: { fontSize: 20, color: Colors.textSecondary, marginRight: Spacing.xs },
  backLabel: { ...Typography.bodyMD, color: Colors.textSecondary },
  header: { marginBottom: Spacing.xxl },
  title: { ...Typography.displayMD, color: Colors.textPrimary, marginBottom: Spacing.xs },
  subtitle: { ...Typography.bodyLG, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.md,
  },
  strengthContainer: {
    marginTop: -Spacing.md,
    marginBottom: Spacing.lg,
  },
  strengthLabel: { ...Typography.bodySM, color: Colors.textMuted },
  strengthValue: { ...Typography.labelMD },
  strengthBar: {
    marginTop: Spacing.xs,
    height: 3,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: { ...Typography.bodyMD, color: Colors.textMuted },
  footerAction: { ...Typography.bodyMD, color: Colors.accent, fontWeight: '600' },
});
