// ============================================================
// src/screens/EditTaskScreen.tsx
// Edit existing task - pre-fills form with current task data
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Platform, Alert, KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, parseISO } from 'date-fns';
import { Colors, Typography, Spacing, Radius, getPriorityColor, getCategoryColor } from '../theme';
import { Button, Input, TagChip, SectionHeader } from '../components';
import { useAppDispatch, useTask } from '../hooks';
import { updateTaskAsync } from '../store/slices/taskSlice';
import { Priority, Category, RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'EditTask'>;

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

const SelectorChip: React.FC<{
  label: string; icon: string; active: boolean; color: string; onPress: () => void;
}> = ({ label, icon, active, color, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, active && { borderColor: color, backgroundColor: color + '20' }]}
    onPress={onPress} activeOpacity={0.75}>
    <Text style={styles.chipIcon}>{icon}</Text>
    <Text style={[styles.chipLabel, active && { color }]}>{label}</Text>
  </TouchableOpacity>
);

const EditTaskScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const dispatch = useAppDispatch();
  const task = useTask(route.params.taskId);

  // Pre-fill form with existing data
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [dateTime, setDateTime] = useState(task ? parseISO(task.dateTime) : new Date());
  const [deadline, setDeadline] = useState(task ? parseISO(task.deadline) : new Date());
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [category, setCategory] = useState<Category>(task?.category ?? 'work');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(task?.tags ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!task) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Task not found</Text>
      </View>
    );
  }

  const addTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean && !tags.includes(clean) && tags.length < 8) setTags([...tags, clean]);
    setTagInput('');
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Task title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const result = await dispatch(updateTaskAsync({
      taskId: task.id,
      input: {
        title: title.trim(),
        description: description.trim(),
        dateTime: dateTime.toISOString(),
        deadline: deadline.toISOString(),
        priority,
        category,
        tags,
      },
    }));

    setIsSubmitting(false);
    if (updateTaskAsync.fulfilled.match(result)) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to update task.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
      <View style={styles.container}>
        {/* Nav */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navBack} onPress={() => navigation.goBack()}>
            <Text style={styles.navBackIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Edit Task</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Input
            label="Task Title *"
            placeholder="What needs to be done?"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            containerStyle={{ marginBottom: Spacing.xl }}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Add details..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline numberOfLines={4} textAlignVertical="top"
            />
          </View>

          {/* Dates */}
          <View style={styles.fieldGroup}>
            <SectionHeader title="Schedule" />
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>📌 Scheduled For</Text>
              <Text style={styles.dateValue}>{format(dateTime, 'EEE, MMM d yyyy · HH:mm')}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>⏰ Deadline</Text>
              <Text style={styles.dateValue}>{format(deadline, 'EEE, MMM d yyyy · HH:mm')}</Text>
            </View>
            <Text style={styles.dateNote}>
              ℹ Tap + Save Task to update. Date picker integrates with @react-native-community/datetimepicker in production.
            </Text>
          </View>

          {/* Priority */}
          <View style={styles.fieldGroup}>
            <SectionHeader title="Priority" />
            <View style={styles.chipRow}>
              {PRIORITIES.map(p => (
                <SelectorChip key={p.key} label={p.label} icon={p.icon}
                  active={priority === p.key} color={getPriorityColor(p.key)}
                  onPress={() => setPriority(p.key)} />
              ))}
            </View>
          </View>

          {/* Category */}
          <View style={styles.fieldGroup}>
            <SectionHeader title="Category" />
            <View style={styles.chipRow}>
              {CATEGORIES.map(c => (
                <SelectorChip key={c.key} label={c.label} icon={c.icon}
                  active={category === c.key} color={getCategoryColor(c.key)}
                  onPress={() => setCategory(c.key)} />
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.fieldGroup}>
            <SectionHeader title="Tags" />
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add tag..."
                placeholderTextColor={Colors.textMuted}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.tagAddBtn} onPress={addTag}>
                <Text style={styles.tagAddLabel}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsDisplay}>
              {tags.map(tag => <TagChip key={tag} tag={tag} onRemove={() => setTags(tags.filter(t => t !== tag))} />)}
            </View>
          </View>

          <Button label="Save Changes" onPress={handleSave} isLoading={isSubmitting} size="lg" style={{ marginTop: Spacing.md }} />
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditTaskScreen;

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  notFoundText: { ...Typography.h3, color: Colors.textMuted },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  navBack: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.surfaceBorder },
  navBackIcon: { fontSize: 16, color: Colors.textSecondary },
  navTitle: { ...Typography.h3, color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  fieldGroup: { marginBottom: Spacing.xl },
  fieldLabel: { ...Typography.labelMD, color: Colors.textSecondary, marginBottom: Spacing.sm },
  textarea: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md, padding: Spacing.lg, ...Typography.bodyMD,
    color: Colors.textPrimary, minHeight: 100,
  },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder },
  dateLabel: { ...Typography.bodyMD, color: Colors.textMuted },
  dateValue: { ...Typography.bodyMD, color: Colors.textPrimary },
  dateNote: { ...Typography.bodySM, color: Colors.textMuted, fontStyle: 'italic', marginTop: Spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.surfaceBorder, backgroundColor: Colors.surface },
  chipIcon: { fontSize: 14, marginRight: 6 },
  chipLabel: { ...Typography.labelMD, color: Colors.textSecondary },
  tagInputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  tagInput: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, ...Typography.bodyMD, color: Colors.textPrimary },
  tagAddBtn: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center' },
  tagAddLabel: { ...Typography.labelMD, color: Colors.textSecondary },
  tagsDisplay: { flexDirection: 'row', flexWrap: 'wrap' },
});
