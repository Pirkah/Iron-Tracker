import React from 'react';
import { StyleSheet, View, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GymProvider } from './src/context/GymContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/theme';

export default function App() {
  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaProvider>
      <View style={styles.outerBackground}>
        <View style={styles.webContainer}>
          <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar style="light" backgroundColor={Colors.background} />
            <GymProvider>
              <AppNavigator />
            </GymProvider>
          </SafeAreaView>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerBackground: {
    flex: 1,
    backgroundColor: '#07070A',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh' as any,
      width: '100vw' as any,
    }),
  },
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    backgroundColor: Colors.background,
    ...(Platform.OS === 'web' && {
      maxHeight: '100vh' as any,
      boxShadow: '0 0 40px rgba(51, 255, 85, 0.08), 0 0 20px rgba(0, 0, 0, 0.95)' as any,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    }),
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
