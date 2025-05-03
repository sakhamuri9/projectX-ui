import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');

  const handleSignIn = () => {
    setCurrentScreen('login');
  };

  const handleSignUp = () => {
    setCurrentScreen('login');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'splash' ? (
        <SplashScreen onSignIn={handleSignIn} onSignUp={handleSignUp} />
      ) : (
        <LoginScreen />
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
