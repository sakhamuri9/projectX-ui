import React from 'react';
import { View, StyleSheet } from 'react-native';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';

export default function TestDashboard() {
  return (
    <View style={styles.container}>
      <DashboardScreen relationshipIntent="Dating" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
