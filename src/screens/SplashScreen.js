import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../styles/theme';

const SplashScreen = ({ onSignIn, onSignUp }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.flex1} />
      
      <View style={styles.brandSection}>
        <Text style={styles.title}>SoulNest</Text>
        <Text style={styles.subtitle}>Where hearts meet, stories begin.</Text>
      </View>
      
      <View style={styles.flex1} />
      
      <View style={styles.actionButtons}>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={onSignIn}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={onSignUp}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  brandSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 8,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  actionButtons: {
    width: '100%',
    marginTop: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  signInButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    backgroundColor: COLORS.SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: COLORS.SECONDARY,
    fontSize: 16,
    fontWeight: '500',
  },
  signUpButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SplashScreen;
