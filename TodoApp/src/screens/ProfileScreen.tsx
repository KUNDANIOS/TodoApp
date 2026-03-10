// ============================================================
// src/screens/ProfileScreen.tsx
// User profile: account info, stats, app settings, logout
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Button } from '../components';
import { useAuth, useAppDispatch, useTaskStats } from '../hooks';
import { logoutAsync, updateDisplayNameAsync } from '../store/slices/authSlice';
import { clearTasks } from '../store/slices/taskSlice';
import { format, parseISO } from 'date-fns';

// ─── Menu item ────────────────────────────────────────────────
const MenuItem: React.FC<{
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}> = ({ icon, label, value, onPress, danger }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={onPress ? 0.75 : 1}
    disabled={!onPress}>
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
    {value && <Text style={styles.menuValue}>{value}</Text>}
    {onPress && <Text style={styles.menuArrow}>›</Text>}
  </TouchableOpacity>
);

// ─── Stat pill ────────────────────────────────────────────────
const StatPill: React.FC<{ value: number | string; label: string; color?: string }> = ({
  value, label, color = Colors.accent,
}) => (
  <View style={styles.statPill}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────
const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const stats = useTaskStats();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.displayName || '');

  const initials = (user?.displayName ?? user?.email ?? '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logoutAsync());
            dispatch(clearTasks());
          },
        },
      ],
    );
  };

  const handleSaveName = async () => {
    if (!user?.uid || !nameInput.trim()) return;
    await dispatch(updateDisplayNameAsync({ uid: user.uid, displayName: nameInput.trim() }));
    setEditingName(false);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* ── Avatar + name ── */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>

        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity style={styles.saveNameBtn} onPress={handleSaveName}>
              <Text style={styles.saveNameLabel}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelNameBtn} onPress={() => setEditingName(false)}>
              <Text style={styles.cancelNameLabel}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => { setNameInput(user?.displayName ?? ''); setEditingName(true); }}>
            <Text style={styles.profileName}>
              {user?.displayName || 'Set your name'} ✏️
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.profileEmail}>{user?.email}</Text>
        {user?.createdAt && (
          <Text style={styles.profileJoined}>
            Member since {format(parseISO(user.createdAt), 'MMMM yyyy')}
          </Text>
        )}
      </View>

      {/* ── Task stats ── */}
      <View style={styles.statsRow}>
        <StatPill value={stats.total} label="Total" />
        <StatPill value={stats.completed} label="Done" color={Colors.success} />
        <StatPill value={stats.active} label="Active" color={Colors.info} />
        <StatPill value={`${stats.completionRate}%`} label="Rate" color={Colors.accent} />
      </View>

      {/* ── Account section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="✉️" label="Email" value={user?.email} />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="✏️"
            label="Edit Display Name"
            onPress={() => { setNameInput(user?.displayName ?? ''); setEditingName(true); }}
          />
        </View>
      </View>

      {/* ── Task summary ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Task Overview</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="📋" label="Total Tasks" value={String(stats.total)} />
          <View style={styles.menuDivider} />
          <MenuItem icon="✅" label="Completed" value={String(stats.completed)} />
          <View style={styles.menuDivider} />
          <MenuItem icon="⚡" label="Active" value={String(stats.active)} />
          <View style={styles.menuDivider} />
          <MenuItem icon="⚠️" label="Overdue" value={String(stats.overdue)} />
          <View style={styles.menuDivider} />
          <MenuItem icon="📅" label="Due Today" value={String(stats.todayTasks.length)} />
        </View>
      </View>

      {/* ── About ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="◈" label="Nexus Task OS" value="v1.0.0" />
          <View style={styles.menuDivider} />
          <MenuItem icon="⚡" label="Built with React Native + TypeScript" />
          <View style={styles.menuDivider} />
          <MenuItem icon="🔒" label="Local storage (AsyncStorage)" />
        </View>
      </View>

      {/* ── Logout ── */}
      <View style={styles.logoutSection}>
        <Button
          label="Sign Out"
          onPress={handleLogout}
          variant="danger"
          size="lg"
        />
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: { paddingTop: 56, paddingHorizontal: Spacing.xl },

  // Profile header
  profileHeader: { alignItems: 'center', marginBottom: Spacing.xl },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.accent,
  },
  avatarInitials: { ...Typography.displayMD, color: Colors.white },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  nameInput: {
    flex: 1,
    ...Typography.h3,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
    paddingVertical: Spacing.xs,
  },
  saveNameBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  saveNameLabel: { ...Typography.labelMD, color: Colors.white },
  cancelNameBtn: { padding: Spacing.xs },
  cancelNameLabel: { fontSize: 16, color: Colors.textMuted },
  profileName: { ...Typography.h2, color: Colors.textPrimary, marginBottom: Spacing.xs },
  profileEmail: { ...Typography.bodyMD, color: Colors.textMuted, marginBottom: Spacing.xs },
  profileJoined: { ...Typography.bodySM, color: Colors.textMuted },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  statPill: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statValue: { ...Typography.h2 },
  statLabel: { ...Typography.capsXS, color: Colors.textMuted, marginTop: 2 },

  // Section
  section: { marginBottom: Spacing.xl },
  sectionLabel: { ...Typography.capsXS, color: Colors.textMuted, marginBottom: Spacing.sm, paddingLeft: Spacing.xs },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuIcon: { fontSize: 18, width: 28 },
  menuLabel: { ...Typography.bodyMD, color: Colors.textPrimary, flex: 1 },
  menuValue: { ...Typography.bodyMD, color: Colors.textMuted },
  menuArrow: { fontSize: 18, color: Colors.textMuted, marginLeft: Spacing.sm },
  menuDivider: { height: 1, backgroundColor: Colors.surfaceBorder, marginLeft: Spacing.xl + 28 },

  // Logout
  logoutSection: { marginBottom: Spacing.xl },
});
