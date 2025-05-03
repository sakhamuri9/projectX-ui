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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import PhoneInput from 'react-native-phone-number-input';
import { COLORS } from '../../styles/theme';
import ProgressBar from '../../components/signup/ProgressBar';
import { useSignup } from '../../context/SignupContext';

const ContactDetailsScreen = ({ phoneNumber: initialPhoneNumber, onComplete, onBack }) => {
  const { formData, updateFormData } = useSignup();
  
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || formData.phoneNumber || '');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [email, setEmail] = useState(formData.email || '');
  const [city, setCity] = useState(formData.location?.city || '');
  const [state, setState] = useState(formData.location?.state || '');
  const [country, setCountry] = useState(formData.location?.country || '');
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const phoneInputRef = useRef(null);
  
  useEffect(() => {
    if (initialPhoneNumber && initialPhoneNumber !== phoneNumber) {
      setPhoneNumber(initialPhoneNumber);
    }
  }, [initialPhoneNumber]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (phoneNumber.trim().length < 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleContinue = () => {
    if (validateForm()) {
      setIsLoading(true);
      
      updateFormData({
        phoneNumber,
        email,
        location: {
          city,
          state,
          country,
        },
      });
      
      setTimeout(() => {
        setIsLoading(false);
        onComplete(phoneNumber, email);
      }, 500);
    }
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
        
        <ProgressBar currentStep={1} totalSteps={5} />
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <PhoneInput
              ref={phoneInputRef}
              defaultValue={phoneNumber}
              defaultCode="US"
              layout="first"
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (errors.phoneNumber) {
                  setErrors({ ...errors, phoneNumber: null });
                }
              }}
              onChangeFormattedText={setFormattedPhoneNumber}
              withDarkTheme
              withShadow={false}
              containerStyle={styles.phoneInputContainer}
              textContainerStyle={styles.textInput}
              textInputStyle={styles.phoneInputText}
              codeTextStyle={styles.codeTextStyle}
              countryPickerButtonStyle={styles.countryPickerButton}
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email address"
              placeholderTextColor={COLORS.PLACEHOLDER}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: null });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="City"
              placeholderTextColor={COLORS.PLACEHOLDER}
              value={city}
              onChangeText={(text) => {
                setCity(text);
                if (errors.city) {
                  setErrors({ ...errors, city: null });
                }
              }}
            />
            {errors.city && (
              <Text style={styles.errorText}>{errors.city}</Text>
            )}
            
            <TextInput
              style={[styles.input, styles.marginTop, errors.state && styles.inputError]}
              placeholder="State (optional)"
              placeholderTextColor={COLORS.PLACEHOLDER}
              value={state}
              onChangeText={setState}
            />
            
            <TextInput
              style={[styles.input, styles.marginTop, errors.country && styles.inputError]}
              placeholder="Country"
              placeholderTextColor={COLORS.PLACEHOLDER}
              value={country}
              onChangeText={(text) => {
                setCountry(text);
                if (errors.country) {
                  setErrors({ ...errors, country: null });
                }
              }}
            />
            {errors.country && (
              <Text style={styles.errorText}>{errors.country}</Text>
            )}
          </View>
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
          style={[styles.continueButton, isLoading && styles.disabledButton]}
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.PRIMARY} />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: COLORS.SECONDARY,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: COLORS.SECONDARY,
    backgroundColor: 'transparent',
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  marginTop: {
    marginTop: 12,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 14,
    marginTop: 4,
  },
  phoneInputContainer: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
  },
  textInput: {
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  phoneInputText: {
    color: COLORS.SECONDARY,
  },
  codeTextStyle: {
    color: COLORS.SECONDARY,
  },
  countryPickerButton: {
    backgroundColor: 'transparent',
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
  disabledButton: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContactDetailsScreen;
