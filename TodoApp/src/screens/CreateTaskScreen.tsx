// ============================================================
// src/screens/CreateTaskScreen.tsx
// Task creation form with all required fields + tag support
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Platform, Alert, KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { Colors, Typography, Spacing, Radius, Shadows, getPriorityColor, getCategoryColor } from '../theme';
import { Button, Input, TagChip, SectionHeader } from '../components';
import { useAuth, useAppDispatch } from '../hooks';
import { createTaskAsync } from '../store/slices/taskSlice';
import { Priority, Category, RootStackParamList, CreateTaskInput } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Options ──────────────────────────────────────────────────
const PRIORITIES: Array<{ key: Priority; label: string; icon: string }> = [
  { key: 'critical', label: 'Critical', icon: '🔴' },
  { key: 'high', label: 'High', icon: '🟠' },
  { key: 'medium', label: 'Medium', icon: '🟡' },
  { key: 'low', label: 'Low', icon: '🟢' },
];

const CATEGORIES: Array<{ key: Category; label: string; icon: string }> = [
  { key: 'work', label: 'Work', icon: '💼' },
  { key: 'personal', label: 'Personal', icon: '👤' },
  { key: 'health', label: 'Health', icon: '💚' },
  { key: 'finance', label: 'Finance', icon: '💰' },
  { key: 'study', label: 'Study', icon: '📚' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️' },
  { key: 'other', label: 'Other', icon: '⭐' },
];

// ─── Selector chip ────────────────────────────────────────────
const SelectorChip: React.FC<{
  label: string;
  icon: string;
  active: boolean;
  color: string;
  onPress: () => void;
}> = ({ label, icon, active, color, onPress }) => (
  <TouchableOpacity
    style={[
      styles.chip,
      active ? { borderColor: color, backgroundColor: color + '20' } : null,
    ]}
    onPress={onPress}
    activeOpacity={0.75}>
    <Text style={styles.chipIcon}>{icon}</Text>
    <Text style={[styles.chipLabel, active ? { color } : null]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Date picker row ──────────────────────────────────────────
const DateRow: React.FC<{
  label: string;
  value: Date;
  onChange: (d: Date) => void;
}> = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.dateRow}>
      <Text style={styles.dateLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.datePicker}
        onPress={() => {
          // In a real app: open DateTimePicker modal
          // Here we'll advance by 1 day as demo interaction
          setShow(true);
          const next = new Date(value);
          next.setDate(next.getDate() + 1);
          onChange(next);
        }}
        activeOpacity={0.8}>
        <Text style={styles.datePickerIcon}>📅</Text>
        <Text style={styles.datePickerValue}>{format(value, 'EEE, MMM d yyyy  HH:mm')}</Text>
        <Text style={styles.datePickerEdit}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────
const CreateTaskScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Tag management ──────────────────────────────────────
  const addTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean && !tags.includes(clean) && tags.length < 8) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  // ─── Validation ──────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Task title is required';
    if (title.trim().length > 100) errs.title = 'Title must be under 100 characters';
    if (deadline <= new Date()) errs.deadline = 'Deadline must be in the future';
    if (deadline <= dateTime) errs.deadline = 'Deadline must be after scheduled date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit ──────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validate()) return;
    if (!user?.uid) return;
    setIsSubmitting(true);

    const input: CreateTaskInput = {
      title: title.trim(),
      description: description.trim(),
      dateTime: dateTime.toISOString(),
      deadline: deadline.toISOString(),
      priority,
      category,
      tags,
      completed: false,
    };

    const result = await dispatch(createTaskAsync({ input, userId: user.uid }));
    setIsSubmitting(false);

    if (createTaskAsync.fulfilled.match(result)) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}>
      <View style={styles.container}>
        {/* ── Nav bar ── */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBack}>
            <Text style={styles.navBackIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>New Task</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ── Title ── */}
          <Input
            label="Task Title *"
            placeholder="What needs to be done?"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            containerStyle={styles.titleInput}
          />

          {/* ── Description ── */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Add details, notes, or context..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* ── Dates ── */}
          <View style={styles.fieldGroup}>
            <SectionHeader title="Schedule" />
            <DateRow label="📌 Scheduled For" value={dateTime} onChange={setDateTime} />
            {errors.deadline ? null : null}
            <DateRow label="⏰ Deadline" value={deadline} onChange={setDeadline} />
            {errors.deadline && <Text style={styles.fieldError}>{errors.deadline}</Text>}
          </View>

          {/* ── Priority ── */}
          <View style={styles.fieldGroup}>
            <SectionHeader title="Priority" subtitle="How urgent is this task?" />
            <View style={styles.chipRow}>
              {PRIORITIES.map(p => (
                <SelectorChip
                  key={p.key}
                  label={p.label}
                  icon={p.icon}
                  active={priority === p.key}
                  color={getPriorityColor(p.key)}
                  onPress={() => setPriority(p.key)}
                />
              ))}
            </View>
          </View>

          {/* ── Category ── */}
          <View style={styles.fieldGroup}>
            <SectionHeader title="Category" />
            <View style={styles.chipGrid}>
              {CATEGORIES.map(c => (
                <SelectorChip
                  key={c.key}
                  label={c.label}
                  icon={c.icon}
                  active={category === c.key}
                  color={getCategoryColor(c.key)}
                  onPress={() => setCategory(c.key)}
                />
              ))}
            </View>
          </View>

          {/* ── Tags ── */}
          <View style={styles.fieldGroup}>
            <SectionHeader title="Tags" subtitle="Add up to 8 tags" />
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a tag..."
                placeholderTextColor={Colors.textMuted}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.tagAddBtn} onPress={addTag} activeOpacity={0.8}>
                <Text style={styles.tagAddLabel}>Add</Text>
              </TouchableOpacity>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsDisplay}>
                {tags.map(tag => (
                  <TagChip key={tag} tag={tag} onRemove={() => removeTag(tag)} />
                ))}
              </View>
            )}
          </View>

          {/* ── Submit ── */}
          <Button
            label="Create Task"
            onPress={handleCreate}
            isLoading={isSubmitting}
            size="lg"
            style={styles.submitBtn}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateTaskScreen;

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  navBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  navBackIcon: { fontSize: 16, color: Colors.textSecondary },
  navTitle: { ...Typography.h3, color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  titleInput: { marginBottom: Spacing.xl },
  fieldGroup: { marginBottom: Spacing.xl },
  fieldLabel: { ...Typography.labelMD, color: Colors.textSecondary, marginBottom: Spacing.sm },
  fieldError: { ...Typography.bodySM, color: Colors.error, marginTop: Spacing.xs },

  // Textarea
  textarea: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    ...Typography.bodyMD,
    color: Colors.textPrimary,
    minHeight: 100,
  },

  // Date rows
  dateRow: { marginBottom: Spacing.sm },
  dateLabel: { ...Typography.labelSM, color: Colors.textMuted, marginBottom: Spacing.xs },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
  },
  datePickerIcon: { fontSize: 16, marginRight: Spacing.sm },
  datePickerValue: { flex: 1, ...Typography.bodyMD, color: Colors.textPrimary },
  datePickerEdit: { ...Typography.labelSM, color: Colors.accent },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },
  chipIcon: { fontSize: 14, marginRight: 6 },
  chipLabel: { ...Typography.labelMD, color: Colors.textSecondary },

  // Tags
  tagInputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.bodyMD,
    color: Colors.textPrimary,
  },
  tagAddBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagAddLabel: { ...Typography.labelMD, color: Colors.textSecondary },
  tagsDisplay: { flexDirection: 'row', flexWrap: 'wrap' },

  submitBtn: { marginTop: Spacing.md },
});
