// ============================================================
// src/screens/TaskDetailScreen.tsx
// Full task detail view with all metadata and actions
// ============================================================

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, parseISO } from 'date-fns';
import { Colors, Typography, Spacing, Radius, Shadows, getPriorityColor, getCategoryColor } from '../theme';
import { PriorityBadge, CategoryBadge, Button, TagChip } from '../components';
import { useAppDispatch, useTask } from '../hooks';
import { toggleTaskAsync, deleteTaskAsync } from '../store/slices/taskSlice';
import { RootStackParamList } from '../types';
import { isOverdue, isDueSoon, getUrgencyLabel } from '../utils/sortAlgorithm';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'TaskDetail'>;

// ─── Info row ─────────────────────────────────────────────────
const InfoRow: React.FC<{ label: string; value: string; icon?: string; color?: string }> = ({
  label, value, icon, color,
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueRow}>
      {icon && <Text style={styles.infoIcon}>{icon}</Text>}
      <Text style={[styles.infoValue, color ? { color } : null]}>{value}</Text>
    </View>
  </View>
);

const TaskDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const dispatch = useAppDispatch();
  const task = useTask(route.params.taskId);

  if (!task) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Task not found</Text>
        <Button label="Go Back" onPress={() => navigation.goBack()} variant="ghost" fullWidth={false} />
      </View>
    );
  }

  const overdue = isOverdue(task);
  const urgency = getUrgencyLabel(task);
  const priorityColor = getPriorityColor(task.priority);

  const handleToggle = () => dispatch(toggleTaskAsync(task.id));

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'This task will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteTaskAsync(task.id));
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Nav ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBack} onPress={() => navigation.goBack()}>
          <Text style={styles.navBackLabel}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditTask', { taskId: task.id })}>
          <Text style={styles.editBtnLabel}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* ── Header ── */}
        <View style={[styles.header, { borderLeftColor: priorityColor }]}>
          {urgency && (
            <View style={[styles.urgencyPill, overdue && styles.urgencyPillOverdue]}>
              <Text style={[styles.urgencyText, overdue && styles.urgencyTextOverdue]}>{urgency}</Text>
            </View>
          )}

          <Text style={[styles.title, task.completed && styles.titleDone]}>
            {task.title}
          </Text>

          <View style={styles.badgeRow}>
            <PriorityBadge priority={task.priority} />
            <View style={{ width: Spacing.sm }} />
            <CategoryBadge category={task.category} />
            {task.completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeLabel}>✓ Completed</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Description ── */}
        {task.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        ) : null}

        {/* ── Dates ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.infoCard}>
            <InfoRow
              label="Scheduled For"
              value={format(parseISO(task.dateTime), 'EEEE, MMMM d yyyy · HH:mm')}
              icon="📌"
            />
            <View style={styles.divider} />
            <InfoRow
              label="Deadline"
              value={format(parseISO(task.deadline), 'EEEE, MMMM d yyyy · HH:mm')}
              icon="⏰"
              color={overdue ? Colors.error : undefined}
            />
            <View style={styles.divider} />
            <InfoRow
              label="Created"
              value={format(parseISO(task.createdAt), 'MMM d yyyy · HH:mm')}
              icon="📋"
            />
            {task.completedAt && (
              <>
                <View style={styles.divider} />
                <InfoRow
                  label="Completed"
                  value={format(parseISO(task.completedAt), 'MMM d yyyy · HH:mm')}
                  icon="✅"
                  color={Colors.success}
                />
              </>
            )}
          </View>
        </View>

        {/* ── Tags ── */}
        {task.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsRow}>
              {task.tags.map(tag => <TagChip key={tag} tag={tag} />)}
            </View>
          </View>
        )}

        {/* ── Actions ── */}
        <View style={styles.actionsSection}>
          <Button
            label={task.completed ? '↩ Mark as Active' : '✓ Mark as Complete'}
            onPress={handleToggle}
            variant={task.completed ? 'secondary' : 'primary'}
            size="lg"
            style={{ marginBottom: Spacing.md }}
          />
          <Button
            label="🗑 Delete Task"
            onPress={handleDelete}
            variant="danger"
            size="md"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { ...Typography.h3, color: Colors.textMuted, marginBottom: Spacing.lg },

  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
  },
  navBack: {},
  navBackLabel: { ...Typography.bodyMD, color: Colors.accent },
  editBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  editBtnLabel: { ...Typography.labelMD, color: Colors.textSecondary },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 60 },

  header: {
    borderLeftWidth: 4,
    paddingLeft: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  urgencyPill: {
    backgroundColor: Colors.warning + '20',
    borderWidth: 1,
    borderColor: Colors.warning + '50',
    borderRadius: Radius.full,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  urgencyPillOverdue: { backgroundColor: Colors.error + '20', borderColor: Colors.error + '50' },
  urgencyText: { ...Typography.capsXS, color: Colors.warning },
  urgencyTextOverdue: { color: Colors.error },
  title: { ...Typography.h1, color: Colors.textPrimary, marginBottom: Spacing.md },
  titleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.sm },
  completedBadge: {
    backgroundColor: Colors.success + '20',
    borderWidth: 1,
    borderColor: Colors.success + '50',
    borderRadius: Radius.full,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  completedBadgeLabel: { ...Typography.capsXS, color: Colors.success },

  section: { marginBottom: Spacing.xxl },
  sectionTitle: { ...Typography.labelLG, color: Colors.textSecondary, marginBottom: Spacing.md },
  description: { ...Typography.bodyLG, color: Colors.textPrimary, lineHeight: 26 },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  infoLabel: { ...Typography.labelMD, color: Colors.textMuted },
  infoValueRow: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: { fontSize: 14, marginRight: Spacing.xs },
  infoValue: { ...Typography.bodyMD, color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.surfaceBorder, marginHorizontal: Spacing.lg },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },

  actionsSection: { marginBottom: Spacing.xl },
});
