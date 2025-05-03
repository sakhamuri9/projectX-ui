import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';
import ProgressBar from '../../components/signup/ProgressBar';
import { useSignup } from '../../context/SignupContext';
import Toast from 'react-native-toast-message';

const OTPInput = ({ length = 6, value, onChange, autoFocus = false, error }) => {
  const inputRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(Array(length).fill(''));
  
  useEffect(() => {
    if (value) {
      const valueArray = value.split('').slice(0, length);
      setOtpValues([...valueArray, ...Array(length - valueArray.length).fill('')]);
    }
  }, [value, length]);
  
  const handleChange = (text, index) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = text;
    setOtpValues(newOtpValues);
    
    onChange(newOtpValues.join(''));
    
    if (text && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  
  return (
    <View style={styles.otpContainer}>
      {Array(length).fill(0).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[styles.otpInput, error && styles.otpInputError]}
          value={otpValues[index]}
          onChangeText={(text) => handleChange(text.replace(/[^0-9]/g, ''), index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="numeric"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const VerificationScreen = ({ phoneNumber, email, onComplete, onBack }) => {
  const { formData, updateFormData } = useSignup();
  
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [phoneTimer, setPhoneTimer] = useState(60);
  const [emailTimer, setEmailTimer] = useState(60);
  const [phoneResendActive, setPhoneResendActive] = useState(false);
  const [emailResendActive, setEmailResendActive] = useState(false);
  
  const phoneVerifyAnim = useRef(new Animated.Value(0)).current;
  const emailVerifyAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const phoneInterval = setInterval(() => {
      setPhoneTimer((prev) => {
        if (prev <= 1) {
          clearInterval(phoneInterval);
          setPhoneResendActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const emailInterval = setInterval(() => {
      setEmailTimer((prev) => {
        if (prev <= 1) {
          clearInterval(emailInterval);
          setEmailResendActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(phoneInterval);
      clearInterval(emailInterval);
    };
  }, []);
  
  const handlePhoneVerify = () => {
    if (phoneOtp.length !== 6) {
      setErrors({ ...errors, phoneOtp: 'Please enter a valid 6-digit OTP' });
      return;
    }
    
    setIsLoading(true);
    setErrors({ ...errors, phoneOtp: null });
    
    setTimeout(() => {
      setIsLoading(false);
      setPhoneVerified(true);
      
      Animated.sequence([
        Animated.timing(phoneVerifyAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(phoneVerifyAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(phoneVerifyAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      Toast.show({
        type: 'success',
        text1: 'Phone Verified',
        text2: 'Your phone number has been verified successfully',
      });
      
      if (emailVerified) {
        handleBothVerified();
      }
    }, 1500);
  };
  
  const handleEmailVerify = () => {
    if (emailOtp.length !== 6) {
      setErrors({ ...errors, emailOtp: 'Please enter a valid 6-digit OTP' });
      return;
    }
    
    setIsLoading(true);
    setErrors({ ...errors, emailOtp: null });
    
    setTimeout(() => {
      setIsLoading(false);
      setEmailVerified(true);
      
      Animated.sequence([
        Animated.timing(emailVerifyAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(emailVerifyAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(emailVerifyAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      Toast.show({
        type: 'success',
        text1: 'Email Verified',
        text2: 'Your email address has been verified successfully',
      });
      
      if (phoneVerified) {
        handleBothVerified();
      }
    }, 1500);
  };
  
  const handleResendPhoneOtp = () => {
    setPhoneResendActive(false);
    setPhoneTimer(60);
    
    const phoneInterval = setInterval(() => {
      setPhoneTimer((prev) => {
        if (prev <= 1) {
          clearInterval(phoneInterval);
          setPhoneResendActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    Toast.show({
      type: 'info',
      text1: 'OTP Resent',
      text2: 'A new OTP has been sent to your phone',
    });
  };
  
  const handleResendEmailOtp = () => {
    setEmailResendActive(false);
    setEmailTimer(60);
    
    const emailInterval = setInterval(() => {
      setEmailTimer((prev) => {
        if (prev <= 1) {
          clearInterval(emailInterval);
          setEmailResendActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    Toast.show({
      type: 'info',
      text1: 'OTP Resent',
      text2: 'A new OTP has been sent to your email',
    });
  };
  
  const handleBothVerified = () => {
    updateFormData({
      phoneVerified: true,
      emailVerified: true,
    });
    
    setTimeout(() => {
      onComplete();
    }, 1000);
  };
  
  const handleContinue = () => {
    const newErrors = {};
    
    if (!phoneVerified) {
      newErrors.phoneOtp = 'Phone verification is required';
    }
    
    if (!emailVerified) {
      newErrors.emailOtp = 'Email verification is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      Toast.show({
        type: 'error',
        text1: 'Verification Required',
        text2: 'Please verify both your phone and email',
      });
      
      return;
    }
    
    handleBothVerified();
  };
  
  const phoneCheckmarkStyle = {
    opacity: phoneVerifyAnim,
    transform: [
      {
        scale: phoneVerifyAnim,
      },
    ],
  };
  
  const emailCheckmarkStyle = {
    opacity: emailVerifyAnim,
    transform: [
      {
        scale: emailVerifyAnim,
      },
    ],
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Your Profile</Text>
        
        <ProgressBar currentStep={2} totalSteps={5} />
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Verification</Text>
          
          <View style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <Text style={styles.verificationTitle}>Phone Verification</Text>
              {phoneVerified && (
                <Animated.View style={[styles.verifiedBadge, phoneCheckmarkStyle]}>
                  <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                </Animated.View>
              )}
            </View>
            
            <Text style={styles.verificationSubtitle}>
              Enter the 6-digit code sent to {phoneNumber}
            </Text>
            
            <OTPInput
              length={6}
              value={phoneOtp}
              onChange={setPhoneOtp}
              autoFocus={true}
              error={errors.phoneOtp}
            />
            
            {errors.phoneOtp && (
              <Text style={styles.errorText}>{errors.phoneOtp}</Text>
            )}
            
            <View style={styles.verificationActions}>
              <TouchableOpacity 
                style={[
                  styles.resendButton, 
                  !phoneResendActive && styles.disabledButton
                ]}
                onPress={handleResendPhoneOtp}
                disabled={!phoneResendActive || isLoading}
              >
                <Text style={styles.resendButtonText}>
                  {phoneResendActive ? 'Resend OTP' : `Resend in ${phoneTimer}s`}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.verifyButton, 
                  (phoneVerified || isLoading) && styles.disabledButton
                ]}
                onPress={handlePhoneVerify}
                disabled={phoneVerified || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.PRIMARY} size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>
                    {phoneVerified ? 'Verified' : 'Verify'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.verificationCard, styles.marginTop]}>
            <View style={styles.verificationHeader}>
              <Text style={styles.verificationTitle}>Email Verification</Text>
              {emailVerified && (
                <Animated.View style={[styles.verifiedBadge, emailCheckmarkStyle]}>
                  <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                </Animated.View>
              )}
            </View>
            
            <Text style={styles.verificationSubtitle}>
              Enter the 6-digit code sent to {email}
            </Text>
            
            <OTPInput
              length={6}
              value={emailOtp}
              onChange={setEmailOtp}
              error={errors.emailOtp}
            />
            
            {errors.emailOtp && (
              <Text style={styles.errorText}>{errors.emailOtp}</Text>
            )}
            
            <View style={styles.verificationActions}>
              <TouchableOpacity 
                style={[
                  styles.resendButton, 
                  !emailResendActive && styles.disabledButton
                ]}
                onPress={handleResendEmailOtp}
                disabled={!emailResendActive || isLoading}
              >
                <Text style={styles.resendButtonText}>
                  {emailResendActive ? 'Resend OTP' : `Resend in ${emailTimer}s`}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.verifyButton, 
                  (emailVerified || isLoading) && styles.disabledButton
                ]}
                onPress={handleEmailVerify}
                disabled={emailVerified || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.PRIMARY} size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>
                    {emailVerified ? 'Verified' : 'Verify'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity style={styles.supportLink}>
            <Text style={styles.supportLinkText}>Didn't receive code? Contact support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        {onBack && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.SECONDARY} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            (!phoneVerified || !emailVerified) && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!phoneVerified || !emailVerified}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 20,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 16,
  },
  verificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  marginTop: {
    marginTop: 24,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    color: COLORS.SECONDARY,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  otpInputError: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  verificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resendButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  verifyButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  supportLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  supportLinkText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
  },
  continueButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 8,
  },
  continueButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerificationScreen;
