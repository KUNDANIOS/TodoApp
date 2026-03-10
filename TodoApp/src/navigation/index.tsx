// ============================================================
// src/navigation/index.tsx
// Root navigation stack - handles auth flow vs main app flow
// ============================================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../hooks';
import { Colors, Spacing, Typography } from '../theme';
import { RootStackParamList, MainTabParamList } from '../types';

// ─── Screens ─────────────────────────────────────────────────
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TaskListScreen from '../screens/TaskListScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ─── Tab icons ────────────────────────────────────────────────
const TAB_ICONS: Record<string, string> = {
  Dashboard: '◈',
  Tasks: '◉',
  Profile: '◎',
};

/** Custom tab bar */
const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}>
            <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
              {TAB_ICONS[route.name] ?? '◎'}
            </Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {String(label)}
            </Text>
            {isFocused && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/** Main tab navigator */
const MainTabs: React.FC = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Tasks" component={TaskListScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

/** Root navigator - switches between auth and app */
const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isLoading ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="CreateTask"
            component={CreateTaskScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="EditTask"
            component={EditTaskScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

/** Navigation container wrapper */
const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
);

export default AppNavigator;

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: Spacing.xl,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIcon: {
    fontSize: 22,
    color: Colors.textMuted,
    marginBottom: 3,
  },
  tabIconActive: {
    color: Colors.accent,
  },
  tabLabel: {
    ...Typography.capsXS,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.accent,
  },
  tabIndicator: {
    position: 'absolute',
    top: -10,
    width: 24,
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
});
