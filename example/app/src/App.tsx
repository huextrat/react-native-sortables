import { PortalProvider } from '@gorhom/portal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationState } from '@react-navigation/native';
import {
  getPathFromState,
  NavigationContainer
} from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ExamplesStackNavigator } from './examples';
import { noop } from './utils';

const PERSISTENCE_KEY = 'NAVIGATION_STATE';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [navigationState, setNavigationState] = useState<NavigationState>();

  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
        const state = savedStateString
          ? (JSON.parse(savedStateString) as NavigationState)
          : undefined;

        if (state !== undefined) {
          setNavigationState(state);
        }
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState().catch(noop);
    }
  }, [isReady]);

  const persistNavigationState = useCallback((state?: NavigationState) => {
    AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state)).catch(noop);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer
          initialState={navigationState}
          linking={{
            getPathFromState: (state, options) =>
              getPathFromState(state, options).replace(/%2F/g, '/'),
            getStateFromPath: path => {
              const chunks = path.split('/').filter(Boolean);
              return {
                routes: chunks.map((_, index, array) => ({
                  name: array.slice(0, index + 1).join('/')
                }))
              };
            },
            prefixes: []
          }}
          onStateChange={persistNavigationState}>
          <PortalProvider>
            <ExamplesStackNavigator />
          </PortalProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
