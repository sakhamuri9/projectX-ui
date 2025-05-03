import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <View style={styles.container}>
      <DashboardScreen relationshipIntent="Dating" />
      <StatusBar style="light" />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
