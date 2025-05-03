import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import Toast from 'react-native-toast-message';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSignIn = () => {
    setCurrentScreen('login');
  };

  const handleSignUp = () => {
    setCurrentScreen('login');
  };

  const handleSendOTP = (number) => {
    setPhoneNumber(number);
    setCurrentScreen('otp');
  };

  const handleVerificationSuccess = () => {
    setCurrentScreen('splash');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'splash' ? (
        <SplashScreen onSignIn={handleSignIn} onSignUp={handleSignUp} />
      ) : currentScreen === 'login' ? (
        <LoginScreen onSendOTP={handleSendOTP} />
      ) : currentScreen === 'otp' ? (
        <OTPVerificationScreen 
          phoneNumber={phoneNumber} 
          onVerificationSuccess={handleVerificationSuccess} 
        />
      ) : null}
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
