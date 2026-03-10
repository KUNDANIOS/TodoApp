// ============================================================
// App.tsx
// Root component - sets up Redux Provider, PersistGate, Navigation
// ============================================================

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation';
import { Colors } from './src/theme';

// Suppress known development warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

/**
 * Root App component.
 * Wraps the entire app in necessary context providers:
 * - GestureHandlerRootView: required by react-native-gesture-handler
 * - SafeAreaProvider: safe area insets for notched devices
 * - Redux Provider: global state management
 * - PersistGate: waits for persisted state to be rehydrated
 */
const App = (): React.JSX.Element => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <StatusBar
              barStyle="light-content"
              backgroundColor={Colors.background}
              translucent={false}
            />
            <AppNavigator />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
