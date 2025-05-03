import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../styles/theme';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const phoneInputRef = useRef(null);

  const validatePhoneNumber = () => {
    const phoneRegex = /^\d{10}$/;
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const isValidNumber = phoneRegex.test(cleanNumber);
    
    setIsValid(isValidNumber);
    if (!isValidNumber) {
      setErrorMessage('Please enter a valid phone number');
    } else {
      setErrorMessage('');
    }
    return isValidNumber;
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber()) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const random = Math.random();
      if (random < 0.8) {
        Alert.alert(
          'OTP Sent',
          `OTP has been sent to ${formattedPhoneNumber}`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Network error');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>SoulNext</Text>
        <Text style={styles.subtitle}>Sign in with your phone number</Text>
        
        <View style={styles.inputContainer}>
          <PhoneInput
            ref={phoneInputRef}
            defaultValue={phoneNumber}
            defaultCode="US"
            layout="first"
            onChangeText={(text) => {
              setPhoneNumber(text);
              setIsValid(true);
              setErrorMessage('');
            }}
            onChangeFormattedText={setFormattedPhoneNumber}
            withDarkTheme
            withShadow={false}
            autoFocus
            containerStyle={styles.phoneInputContainer}
            textContainerStyle={styles.textInput}
            textInputStyle={styles.phoneInputText}
            codeTextStyle={styles.codeTextStyle}
            countryPickerButtonStyle={styles.countryPickerButton}
          />
          {!isValid && (
            <Text style={styles.errorText}>
              {errorMessage || 'Please enter a valid phone number'}
            </Text>
          )}
          {errorMessage && isValid && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.PRIMARY} />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.SECONDARY,
    marginBottom: 40,
    opacity: 0.8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  phoneInputContainer: {
    width: '100%',
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 8,
  },
  textInput: {
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 8,
  },
  phoneInputText: {
    color: COLORS.PRIMARY,
  },
  codeTextStyle: {
    color: COLORS.PRIMARY,
  },
  countryPickerButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  errorText: {
    color: COLORS.ERROR,
    marginTop: 8,
    fontSize: 14,
  },
  button: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  buttonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
