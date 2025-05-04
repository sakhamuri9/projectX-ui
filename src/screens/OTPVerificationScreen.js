import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../styles/theme';
import OtpInputs from 'react-native-otp-inputs';
import Toast from 'react-native-toast-message';
import Clipboard from '../utils/ClipboardManager';

const OTPVerificationScreen = ({ phoneNumber, onVerificationSuccess }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter a valid 6-digit OTP',
        position: 'bottom',
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      if (otp.length === 6) {
        Toast.show({
          type: 'success',
          text1: 'OTP Verified',
          text2: 'You have successfully verified your phone number',
          position: 'bottom',
        });
        
        if (onVerificationSuccess) {
          setTimeout(() => {
            onVerificationSuccess();
          }, 1000);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP',
          text2: 'The OTP you entered is incorrect',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: 'Please try again later',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(30);
    
    Toast.show({
      type: 'info',
      text1: 'OTP Resent',
      text2: `A new OTP has been sent to ${phoneNumber}`,
      position: 'bottom',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Animated.View 
        style={[
          styles.contentContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.title}>SoulNest</Text>
        <Text style={styles.subtitle}>Enter verification code</Text>
        
        <Text style={styles.description}>
          We've sent a 6-digit code to {phoneNumber}
        </Text>
        
        <View style={styles.otpContainer}>
          <OtpInputs
            handleChange={(code) => setOtp(code)}
            numberOfInputs={6}
            autofillFromClipboard={false}
            inputStyles={styles.otpInput}
            inputContainerStyles={styles.otpInputContainer}
            focusStyles={styles.otpInputFocused}
          />
        </View>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.PRIMARY} />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive the code?
          </Text>
          <TouchableOpacity 
            onPress={handleResendOTP}
            disabled={!canResend}
          >
            <Text 
              style={[
                styles.resendButton,
                !canResend && styles.resendButtonDisabled
              ]}
            >
              {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <Toast ref={(ref) => Toast.setRef(ref)} />
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
    fontSize: 20,
    color: COLORS.SECONDARY,
    marginBottom: 16,
    opacity: 0.9,
  },
  description: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    marginBottom: 32,
    opacity: 0.7,
    textAlign: 'center',
  },
  otpContainer: {
    width: '100%',
    marginBottom: 32,
  },
  otpInputContainer: {
    height: 50,
    width: 45,
    borderRadius: 8,
    backgroundColor: COLORS.SECONDARY,
    marginHorizontal: 5,
  },
  otpInput: {
    color: COLORS.PRIMARY,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  otpInputFocused: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
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
    marginBottom: 20,
  },
  buttonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  resendText: {
    color: COLORS.SECONDARY,
    opacity: 0.7,
    marginRight: 8,
  },
  resendButton: {
    color: COLORS.SECONDARY,
    fontWeight: 'bold',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
});

export default OTPVerificationScreen;
