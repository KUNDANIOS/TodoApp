// ============================================================
// src/components/index.tsx
// Shared UI component library for the app
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows, getPriorityColor, getCategoryColor } from '../theme';
import { Priority, Category } from '../types';

// ─── Button ───────────────────────────────────────────────────

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  label, onPress, variant = 'primary', isLoading, disabled, style, fullWidth = true, size = 'md',
}) => {
  const isDisabled = disabled || isLoading;

  const containerStyle = [
    styles.btn,
    styles[`btn_${variant}`],
    styles[`btn_${size}`],
    fullWidth && { width: '100%' as const },
    isDisabled && styles.btn_disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}>
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.accent} size="small" />
      ) : (
        <Text style={[styles.btnLabel, styles[`btnLabel_${variant}`], styles[`btnLabel_${size}`]]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ─── Input ────────────────────────────────────────────────────

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label, error, leftIcon, containerStyle, ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused, error ? styles.inputWrapperError : null]}>
        {leftIcon && <Text style={styles.inputIcon}>{leftIcon}</Text>}
        <TextInput
          style={[styles.input, leftIcon ? { paddingLeft: 8 } : null]}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
};

// ─── Priority Badge ───────────────────────────────────────────

export const PriorityBadge: React.FC<{ priority: Priority; small?: boolean }> = ({ priority, small }) => {
  const color = getPriorityColor(priority);
  const icons: Record<Priority, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };

  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: color + '20' }]}>
      {!small && <Text style={styles.badgeIcon}>{icons[priority]}</Text>}
      <Text style={[styles.badgeLabel, { color }, small && styles.badgeLabelSm]}>
        {priority.toUpperCase()}
      </Text>
    </View>
  );
};

// ─── Category Badge ───────────────────────────────────────────

const CATEGORY_ICONS: Record<Category, string> = {
  work: '💼',
  personal: '👤',
  health: '💚',
  finance: '💰',
  study: '📚',
  shopping: '🛍️',
  other: '⭐',
};

export const CategoryBadge: React.FC<{ category: Category; small?: boolean }> = ({ category, small }) => {
  const color = getCategoryColor(category);
  return (
    <View style={[styles.badge, { borderColor: color + '60', backgroundColor: color + '15' }]}>
      {!small && <Text style={styles.badgeIcon}>{CATEGORY_ICONS[category]}</Text>}
      <Text style={[styles.badgeLabel, { color }, small && styles.badgeLabelSm]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
    </View>
  );
};

// ─── Section Header ───────────────────────────────────────────

export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}> = ({ title, subtitle, action }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderLeft}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {action && (
      <TouchableOpacity onPress={action.onPress}>
        <Text style={styles.sectionAction}>{action.label}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Empty State ──────────────────────────────────────────────

export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
}> = ({ icon = '◎', title, message, action }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    {action && (
      <Button label={action.label} onPress={action.onPress} variant="primary" fullWidth={false} style={{ marginTop: Spacing.lg, paddingHorizontal: Spacing.xxl }} />
    )}
  </View>
);

// ─── Progress Ring ────────────────────────────────────────────

export const ProgressRing: React.FC<{ percent: number; size?: number }> = ({ percent, size = 80 }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const stroke = (circ * (100 - percent)) / 100;

  return (
    <View style={[styles.progressRing, { width: size, height: size }]}>
      <Text style={styles.progressText}>{percent}%</Text>
    </View>
  );
};

// ─── Tag chip ─────────────────────────────────────────────────

export const TagChip: React.FC<{ tag: string; onRemove?: () => void }> = ({ tag, onRemove }) => (
  <View style={styles.tag}>
    <Text style={styles.tagLabel}>#{tag}</Text>
    {onRemove && (
      <TouchableOpacity onPress={onRemove} style={styles.tagRemove}>
        <Text style={styles.tagRemoveIcon}>×</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Button
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  btn_primary: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    ...Shadows.accent,
  },
  btn_secondary: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.surfaceBorder,
  },
  btn_ghost: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.surfaceBorder,
  },
  btn_danger: {
    backgroundColor: Colors.error + '20',
    borderColor: Colors.error,
  },
  btn_disabled: { opacity: 0.5 },
  btn_sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, minHeight: 36 },
  btn_md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, minHeight: 48 },
  btn_lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, minHeight: 56 },

  btnLabel: { ...Typography.labelLG },
  btnLabel_primary: { color: Colors.white },
  btnLabel_secondary: { color: Colors.textPrimary },
  btnLabel_ghost: { color: Colors.textSecondary },
  btnLabel_danger: { color: Colors.error },
  btnLabel_sm: { ...Typography.labelMD },
  btnLabel_md: { ...Typography.labelLG },
  btnLabel_lg: { ...Typography.h4 },

  // Input
  inputContainer: { marginBottom: Spacing.lg },
  inputLabel: { ...Typography.labelMD, color: Colors.textSecondary, marginBottom: Spacing.xs },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },
  inputWrapperFocused: { borderColor: Colors.accent, backgroundColor: Colors.surfaceElevated },
  inputWrapperError: { borderColor: Colors.error },
  inputIcon: { fontSize: 18, marginRight: Spacing.sm, color: Colors.textMuted },
  input: {
    flex: 1,
    ...Typography.bodyMD,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  inputError: { ...Typography.bodySM, color: Colors.error, marginTop: Spacing.xs },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeIcon: { fontSize: 10, marginRight: 4 },
  badgeLabel: { ...Typography.capsXS, fontSize: 9 },
  badgeLabelSm: { fontSize: 8 },

  // Section header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.md },
  sectionHeaderLeft: {},
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary },
  sectionSubtitle: { ...Typography.bodySM, color: Colors.textMuted, marginTop: 2 },
  sectionAction: { ...Typography.labelMD, color: Colors.accent },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.lg, opacity: 0.5 },
  emptyTitle: { ...Typography.h3, color: Colors.textSecondary, marginBottom: Spacing.sm },
  emptyMessage: { ...Typography.bodyMD, color: Colors.textMuted, textAlign: 'center', maxWidth: 260 },

  // Progress ring placeholder
  progressRing: {
    borderRadius: Radius.full,
    borderWidth: 4,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent + '15',
  },
  progressText: { ...Typography.h4, color: Colors.textPrimary },

  // Tag
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.accentLight + '40',
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tagLabel: { ...Typography.capsXS, color: Colors.accentLight, fontSize: 9 },
  tagRemove: { marginLeft: 4 },
  tagRemoveIcon: { fontSize: 14, color: Colors.textMuted, lineHeight: 16 },
});
