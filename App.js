import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import PersonalInfoScreen from './src/screens/signup/PersonalInfoScreen';
import MatchPreferencesScreen from './src/screens/signup/MatchPreferencesScreen';
import ProfileSetupScreen from './src/screens/signup/ProfileSetupScreen';
import { SignupProvider } from './src/context/SignupContext';
import Toast from 'react-native-toast-message';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState(false);

  const handleSignIn = () => {
    setCurrentScreen('login');
  };

  const handleSignUp = () => {
    setCurrentScreen('signup-step1');
  };

  const handleSendOTP = (number) => {
    setPhoneNumber(number);
    setCurrentScreen('otp');
  };

  const handleVerificationSuccess = () => {
    setVerifiedPhone(true);
    if (currentScreen === 'otp' && !verifiedPhone) {
      setCurrentScreen('signup-step1');
    } else {
      setCurrentScreen('splash');
    }
  };

  const handleSignupComplete = () => {
    setCurrentScreen('splash');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onSignIn={handleSignIn} onSignUp={handleSignUp} />;
      
      case 'login':
        return <LoginScreen onSendOTP={handleSendOTP} />;
      
      case 'otp':
        return (
          <OTPVerificationScreen 
            phoneNumber={phoneNumber} 
            onVerificationSuccess={handleVerificationSuccess} 
          />
        );
      
      case 'signup-step1':
        return (
          <SignupProvider>
            <PersonalInfoScreen 
              phoneNumber={phoneNumber}
              onComplete={() => setCurrentScreen('signup-step2')}
            />
          </SignupProvider>
        );
      
      case 'signup-step2':
        return (
          <SignupProvider>
            <MatchPreferencesScreen 
              onBack={() => setCurrentScreen('signup-step1')}
              onComplete={() => setCurrentScreen('signup-step3')}
            />
          </SignupProvider>
        );
      
      case 'signup-step3':
        return (
          <SignupProvider>
            <ProfileSetupScreen 
              onBack={() => setCurrentScreen('signup-step2')}
              onComplete={handleSignupComplete}
            />
          </SignupProvider>
        );
      
      default:
        return <SplashScreen onSignIn={handleSignIn} onSignUp={handleSignUp} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
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
