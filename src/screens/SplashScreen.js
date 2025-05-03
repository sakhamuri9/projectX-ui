import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Pressable,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../styles/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import Fireworks from '../components/Fireworks';
import LightningAnimation from '../components/LightningAnimation';

const WeddingRingsIcon = ({ size = 48, color = 'white' }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <FontAwesome5 name="ring" size={size} color={color} />
    </View>
  );
};

const SplashScreen = ({ onSignIn, onSignUp }) => {
  const [showFireworks, setShowFireworks] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFireworks(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Clouds background image */}
      <View style={styles.cloudsContainer}>
        <Image 
          source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/f07a10185a-ae5c685f0dd9567bc83e.png' }} 
          style={styles.cloudsImage} 
          resizeMode="cover"
        />
      </View>
      
      {/* Lightning animation */}
      <LightningAnimation />
      {showFireworks && <Fireworks play={showFireworks} />}
      
      {/* Brand section with gradient background */}
      <View style={styles.brandSection}>
        {/* Gradient background */}
        <View style={styles.gradientBackground} />
        
        {/* Wedding rings icon above the logo */}
        <View style={styles.iconContainer}>
          <WeddingRingsIcon size={48} color="white" />
        </View>
        
        {/* App name with different styling for each part */}
        <Text style={styles.title}>
          <Text style={styles.titleSoul}>Soul</Text>
          <Text style={styles.titleNest}>Nest</Text>
        </Text>
        
        {/* Tagline with border */}
        <View style={styles.taglineContainer}>
          <Text style={styles.taglineText}>Where hearts meet, stories begin.</Text>
        </View>
      </View>
      
      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={onSignIn}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
        
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={onSignUp}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 64,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cloudsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
  },
  cloudsImage: {
    width: '100%',
    height: 200,
    opacity: 0.2,
  },
  brandSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
    zIndex: -1,
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    color: COLORS.SECONDARY,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  titleSoul: {
    fontFamily: 'serif',
    fontWeight: '400',
  },
  titleNest: {
    fontWeight: 'bold',
  },
  taglineContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  taglineText: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    textAlign: 'center',
  },
  actionButtons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    color: COLORS.SECONDARY,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SplashScreen;
