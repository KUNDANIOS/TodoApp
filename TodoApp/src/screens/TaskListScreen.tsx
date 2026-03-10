// ============================================================
// src/screens/TaskListScreen.tsx
// Full task list with search, filter, sort, and task cards
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, parseISO } from 'date-fns';
import {
  Colors, Typography, Spacing, Radius, Shadows,
  getPriorityColor, getCategoryColor,
} from '../theme';
import { useAuth, useAppDispatch, useFilteredTasks, useAppSelector } from '../hooks';
import { fetchTasksAsync, setFilter, setSortBy, deleteTaskAsync, toggleTaskAsync } from '../store/slices/taskSlice';
import { PriorityBadge, CategoryBadge, EmptyState, TagChip } from '../components';
import { Task, RootStackParamList, Priority, Category, SortOption } from '../types';
import { isOverdue, isDueSoon, getUrgencyLabel } from '../utils/sortAlgorithm';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Sort options ─────────────────────────────────────────────
const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'smart', label: '◈ Smart' },
  { key: 'deadline', label: '📅 Deadline' },
  { key: 'priority', label: '🔥 Priority' },
  { key: 'createdAt', label: '🕐 Recent' },
  { key: 'title', label: '🔤 A–Z' },
];

// ─── Filter chips ─────────────────────────────────────────────
const STATUS_FILTERS = ['all', 'active', 'completed'] as const;
const PRIORITY_FILTERS: Array<Priority | 'all'> = ['all', 'critical', 'high', 'medium', 'low'];
const CATEGORY_FILTERS: Array<Category | 'all'> = ['all', 'work', 'personal', 'health', 'finance', 'study', 'shopping', 'other'];

// ─── Task card ────────────────────────────────────────────────
const TaskCard: React.FC<{
  task: Task;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
}> = ({ task, onPress, onToggle, onDelete }) => {
  const overdue = isOverdue(task);
  const urgency = getUrgencyLabel(task);
  const priorityColor = getPriorityColor(task.priority);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        task.completed && styles.cardCompleted,
        overdue && styles.cardOverdue,
      ]}
      onPress={onPress}
      activeOpacity={0.8}>

      {/* Priority left border */}
      <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

      <View style={styles.cardBody}>
        {/* Top row */}
        <View style={styles.cardTop}>
          {/* Checkbox */}
          <TouchableOpacity
            style={[styles.checkbox, task.completed && styles.checkboxDone]}
            onPress={onToggle}
            activeOpacity={0.8}>
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <View style={styles.cardTitleWrapper}>
            <Text
              style={[styles.cardTitle, task.completed && styles.cardTitleDone]}
              numberOfLines={2}>
              {task.title}
            </Text>
          </View>

          {/* Delete */}
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} activeOpacity={0.7}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        {task.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{task.description}</Text>
        ) : null}

        {/* Meta row */}
        <View style={styles.cardMeta}>
          <View style={styles.cardMetaLeft}>
            <PriorityBadge priority={task.priority} small />
            <View style={{ width: Spacing.xs }} />
            <CategoryBadge category={task.category} small />
          </View>

          <View style={styles.cardMetaRight}>
            {urgency ? (
              <View style={[styles.urgencyBadge, overdue && styles.urgencyBadgeOverdue]}>
                <Text style={[styles.urgencyText, overdue && styles.urgencyTextOverdue]}>
                  {urgency}
                </Text>
              </View>
            ) : (
              <Text style={styles.cardDate}>
                {format(parseISO(task.deadline), 'MMM d, HH:mm')}
              </Text>
            )}
          </View>
        </View>

        {/* Tags */}
        {task.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {task.tags.slice(0, 3).map(tag => (
              <TagChip key={tag} tag={tag} />
            ))}
            {task.tags.length > 3 && (
              <Text style={styles.tagsMore}>+{task.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Filter pill ──────────────────────────────────────────────
const FilterPill: React.FC<{ label: string; active: boolean; onPress: () => void; color?: string }> = ({
  label, active, onPress, color,
}) => (
  <TouchableOpacity
    style={[styles.pill, active && styles.pillActive, active && color ? { borderColor: color, backgroundColor: color + '20' } : null]}
    onPress={onPress}
    activeOpacity={0.7}>
    <Text style={[styles.pillLabel, active && styles.pillLabelActive, active && color ? { color } : null]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────
const TaskListScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const filteredTasks = useFilteredTasks();
  const { filter, sortBy, isLoading } = useAppSelector(s => s.tasks);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user?.uid) dispatch(fetchTasksAsync(user.uid));
  }, [user?.uid]);

  const handleDelete = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Delete "${task.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteTaskAsync(task.id)) },
      ],
    );
  };

  const handleToggle = (taskId: string) => {
    dispatch(toggleTaskAsync(taskId));
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Tasks</Text>
          <Text style={styles.headerCount}>{filteredTasks.length} tasks</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateTask')}
          activeOpacity={0.8}>
          <Text style={styles.addBtnLabel}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={Colors.textMuted}
          value={filter.searchQuery}
          onChangeText={q => dispatch(setFilter({ searchQuery: q }))}
        />
        {filter.searchQuery ? (
          <TouchableOpacity onPress={() => dispatch(setFilter({ searchQuery: '' }))}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}>
          <Text style={[styles.filterToggleLabel, showFilters && { color: Colors.accent }]}>
            {showFilters ? '▲' : '▼'} Filter
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Filters ── */}
      {showFilters && (
        <View style={styles.filtersSection}>
          {/* Status */}
          <Text style={styles.filterGroupLabel}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {STATUS_FILTERS.map(s => (
              <FilterPill
                key={s}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
                active={filter.status === s}
                onPress={() => dispatch(setFilter({ status: s }))}
              />
            ))}
          </ScrollView>

          {/* Priority */}
          <Text style={styles.filterGroupLabel}>Priority</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {PRIORITY_FILTERS.map(p => (
              <FilterPill
                key={p}
                label={p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                active={filter.priority === p}
                onPress={() => dispatch(setFilter({ priority: p }))}
                color={p !== 'all' ? getPriorityColor(p) : undefined}
              />
            ))}
          </ScrollView>

          {/* Category */}
          <Text style={styles.filterGroupLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {CATEGORY_FILTERS.map(c => (
              <FilterPill
                key={c}
                label={c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                active={filter.category === c}
                onPress={() => dispatch(setFilter({ category: c }))}
                color={c !== 'all' ? getCategoryColor(c) : undefined}
              />
            ))}
          </ScrollView>

          {/* Sort */}
          <Text style={styles.filterGroupLabel}>Sort By</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {SORT_OPTIONS.map(opt => (
              <FilterPill
                key={opt.key}
                label={opt.label}
                active={sortBy === opt.key}
                onPress={() => dispatch(setSortBy(opt.key))}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Task list ── */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="No tasks found"
            message={filter.searchQuery ? 'No tasks match your search.' : 'Add your first task to get started.'}
            action={{ label: '+ Add Task', onPress: () => navigation.navigate('CreateTask') }}
          />
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            onToggle={() => handleToggle(item.id)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
    </View>
  );
};

export default TaskListScreen;

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
  },
  headerTitle: { ...Typography.h1, color: Colors.textPrimary },
  headerCount: { ...Typography.bodySM, color: Colors.textMuted, marginTop: 2 },
  addBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    ...Shadows.accent,
  },
  addBtnLabel: { ...Typography.labelMD, color: Colors.white },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, ...Typography.bodyMD, color: Colors.textPrimary },
  searchClear: { fontSize: 16, color: Colors.textMuted, padding: Spacing.xs },
  filterToggle: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginLeft: Spacing.sm,
  },
  filterToggleActive: { borderColor: Colors.accent },
  filterToggleLabel: { ...Typography.labelSM, color: Colors.textMuted },

  // Filters
  filtersSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  filterGroupLabel: { ...Typography.capsXS, color: Colors.textMuted, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  pillRow: { marginBottom: Spacing.xs },
  pill: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: Spacing.xs,
  },
  pillActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '20' },
  pillLabel: { ...Typography.labelSM, color: Colors.textMuted },
  pillLabelActive: { color: Colors.accent },

  // List
  listContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 120 },

  // Task card
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.sm,
  },
  cardCompleted: { opacity: 0.65 },
  cardOverdue: { borderColor: Colors.error + '50' },
  priorityBar: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: Spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.xs },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  checkmark: { fontSize: 13, color: Colors.white, fontWeight: '700' },
  cardTitleWrapper: { flex: 1 },
  cardTitle: { ...Typography.h4, color: Colors.textPrimary },
  cardTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  deleteBtn: { padding: Spacing.xs, marginLeft: Spacing.xs },
  deleteIcon: { fontSize: 16 },
  cardDesc: { ...Typography.bodyMD, color: Colors.textMuted, marginBottom: Spacing.sm },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMetaLeft: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 },
  cardMetaRight: {},
  cardDate: { ...Typography.bodySM, color: Colors.textMuted },
  urgencyBadge: {
    backgroundColor: Colors.warning + '20',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.warning + '50',
  },
  urgencyBadgeOverdue: { backgroundColor: Colors.error + '20', borderColor: Colors.error + '50' },
  urgencyText: { ...Typography.capsXS, color: Colors.warning, fontSize: 9 },
  urgencyTextOverdue: { color: Colors.error },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm },
  tagsMore: { ...Typography.bodySM, color: Colors.textMuted, alignSelf: 'center' },
});
