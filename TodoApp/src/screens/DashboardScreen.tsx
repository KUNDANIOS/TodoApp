// ============================================================
// src/screens/DashboardScreen.tsx
// Dashboard with task stats, insights, and quick-access tasks
// ============================================================

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, parseISO } from 'date-fns';
import { Colors, Typography, Spacing, Radius, Shadows, getPriorityColor } from '../theme';
import { useAuth, useAppDispatch, useTaskStats, useAppSelector, useFilteredTasks } from '../hooks';
import { fetchTasksAsync } from '../store/slices/taskSlice';
import { SectionHeader, PriorityBadge, CategoryBadge, EmptyState } from '../components';
import { Task, RootStackParamList } from '../types';
import { isOverdue, isDueSoon } from '../utils/sortAlgorithm';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Stat card ────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: string;
  color?: string;
  small?: boolean;
}> = ({ label, value, icon, color = Colors.accent, small }) => (
  <View style={[styles.statCard, small && styles.statCardSmall]}>
    <Text style={[styles.statIcon, { color }]}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Task row (compact) ───────────────────────────────────────
const TaskRow: React.FC<{ task: Task; onPress: () => void }> = ({ task, onPress }) => {
  const overdue = isOverdue(task);
  const dueSoon = isDueSoon(task);

  return (
    <TouchableOpacity style={styles.taskRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.taskPriorityStripe, { backgroundColor: getPriorityColor(task.priority) }]} />
      <View style={styles.taskRowContent}>
        <View style={styles.taskRowTop}>
          <Text style={styles.taskRowTitle} numberOfLines={1}>{task.title}</Text>
          <PriorityBadge priority={task.priority} small />
        </View>
        <View style={styles.taskRowMeta}>
          <Text style={[styles.taskRowDate, overdue && styles.overdueText, dueSoon && styles.dueSoonText]}>
            {overdue ? '⚠ Overdue' : dueSoon ? '⏰ Due soon' : `📅 ${format(parseISO(task.deadline), 'MMM d')}`}
          </Text>
          <CategoryBadge category={task.category} small />
        </View>
      </View>
      <Text style={styles.taskRowArrow}>›</Text>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────
const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const stats = useTaskStats();
  const { isLoading } = useAppSelector(s => s.tasks);

  // For urgent tasks display: unfiltered, smart sorted
  const allTasks = useAppSelector(s => s.tasks.tasks);
  const urgentTasks = allTasks
    .filter(t => !t.completed && (isOverdue(t) || isDueSoon(t)))
    .slice(0, 5);
  const upcomingTasks = allTasks
    .filter(t => !t.completed && !isOverdue(t))
    .slice(0, 4);

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchTasksAsync(user.uid));
    }
  }, [user?.uid]);

  const onRefresh = () => {
    if (user?.uid) dispatch(fetchTasksAsync(user.uid));
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.accent} />
      }>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{firstName} 👋</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
        </View>
        <TouchableOpacity
          style={styles.addFab}
          onPress={() => navigation.navigate('CreateTask')}
          activeOpacity={0.85}>
          <Text style={styles.addFabIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* ── Completion banner ── */}
      <View style={styles.completionBanner}>
        <View style={styles.completionLeft}>
          <Text style={styles.completionRate}>{stats.completionRate}%</Text>
          <Text style={styles.completionLabel}>Overall completion rate</Text>
          <View style={styles.completionBar}>
            <View style={[styles.completionFill, { width: `${stats.completionRate}%` }]} />
          </View>
        </View>
        <View style={styles.completionRight}>
          <Text style={styles.completionEmoji}>
            {stats.completionRate >= 80 ? '🏆' : stats.completionRate >= 50 ? '💪' : '🚀'}
          </Text>
        </View>
      </View>

      {/* ── Stats grid ── */}
      <View style={styles.statsGrid}>
        <StatCard label="Total" value={stats.total} icon="◈" color={Colors.accent} />
        <StatCard label="Active" value={stats.active} icon="◉" color={Colors.info} />
        <StatCard label="Done" value={stats.completed} icon="✓" color={Colors.success} />
        <StatCard label="Overdue" value={stats.overdue} icon="⚠" color={Colors.error} />
      </View>

      {/* ── Today's tasks ── */}
      {stats.todayTasks.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Due Today"
            subtitle={`${stats.todayTasks.length} task${stats.todayTasks.length !== 1 ? 's' : ''}`}
            action={{ label: 'See all', onPress: () => navigation.navigate('Main', { screen: 'Tasks' } as any) }}
          />
          {stats.todayTasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            />
          ))}
        </View>
      )}

      {/* ── Urgent tasks ── */}
      {urgentTasks.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Needs Attention" subtitle="Overdue or due soon" />
          {urgentTasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            />
          ))}
        </View>
      )}

      {/* ── Upcoming tasks ── */}
      <View style={styles.section}>
        <SectionHeader
          title="Upcoming Tasks"
          action={{ label: 'View all', onPress: () => navigation.navigate('Main', { screen: 'Tasks' } as any) }}
        />
        {upcomingTasks.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="All clear!"
            message="No upcoming tasks. Add one to stay organized."
            action={{ label: '+ Add Task', onPress: () => navigation.navigate('CreateTask') }}
          />
        ) : (
          upcomingTasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            />
          ))
        )}
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
};

export default DashboardScreen;

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: { paddingHorizontal: Spacing.xl, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xxl,
  },
  greeting: { ...Typography.bodyLG, color: Colors.textMuted },
  name: { ...Typography.displayMD, color: Colors.textPrimary, marginVertical: Spacing.xs },
  date: { ...Typography.bodyMD, color: Colors.textMuted },
  addFab: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.accent,
  },
  addFabIcon: { fontSize: 28, color: Colors.white, lineHeight: 32, marginBottom: 2 },

  // Completion banner
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLighter + '15',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryLighter + '30',
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  completionLeft: { flex: 1 },
  completionRate: { ...Typography.displayLG, color: Colors.accent },
  completionLabel: { ...Typography.bodyMD, color: Colors.textMuted, marginVertical: Spacing.xs },
  completionBar: {
    height: 4,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  completionFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  completionRight: { marginLeft: Spacing.lg },
  completionEmoji: { fontSize: 40 },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statCardSmall: { paddingVertical: Spacing.sm },
  statIcon: { fontSize: 16, marginBottom: 4 },
  statValue: { ...Typography.h2, marginBottom: 2 },
  statLabel: { ...Typography.capsXS, color: Colors.textMuted, textAlign: 'center' },

  // Section
  section: { marginBottom: Spacing.xxl },

  // Task row
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.sm,
  },
  taskPriorityStripe: { width: 3, alignSelf: 'stretch' },
  taskRowContent: { flex: 1, padding: Spacing.md },
  taskRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  taskRowTitle: { ...Typography.h4, color: Colors.textPrimary, flex: 1, marginRight: Spacing.sm },
  taskRowMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskRowDate: { ...Typography.bodySM, color: Colors.textMuted },
  taskRowArrow: { fontSize: 20, color: Colors.textMuted, paddingRight: Spacing.md },
  overdueText: { color: Colors.error },
  dueSoonText: { color: Colors.warning },

  bottomPad: { height: 100 },
});
