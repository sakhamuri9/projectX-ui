import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useSignup } from '../../context/SignupContext';
import ProgressBar from '../../components/signup/ProgressBar';
import { COLORS } from '../../styles/theme';

const PersonalInfoScreen = ({ phoneNumber }) => {
  const { formData, updateFormData, nextStep } = useSignup();
  
  const [fullName, setFullName] = useState(formData.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date());
  const [gender, setGender] = useState(formData.gender || '');
  const [location, setLocation] = useState(formData.location || { city: '', state: '', country: '' });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (phoneNumber && !formData.phoneNumber) {
      updateFormData({ phoneNumber });
    }
  }, [phoneNumber]);

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    setShowDatePickerModal(false);
  };

  const openDatePicker = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setShowDatePicker(true);
    } else {
      setShowDatePickerModal(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0)) {
      newErrors.dateOfBirth = 'You must be at least 18 years old';
    }
    
    if (!gender) {
      newErrors.gender = 'Gender is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      updateFormData({
        fullName,
        dateOfBirth: dateOfBirth.toISOString(),
        gender,
        location,
      });
      nextStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Create Your Profile</Text>
          
          <ProgressBar currentStep={1} totalSteps={3} />
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.PLACEHOLDER}
                value={fullName}
                onChangeText={setFullName}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput, errors.dateOfBirth && styles.inputError]}
                onPress={openDatePicker}
              >
                <Text style={styles.dateText}>
                  {formatDate(dateOfBirth)}
                </Text>
                <MaterialIcons name="date-range" size={20} color={COLORS.SECONDARY} />
              </TouchableOpacity>
              
              {/* Date picker for iOS and Android */}
              {showDatePicker && (Platform.OS === 'ios' || Platform.OS === 'android') && (
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
              
              {/* Modal date picker for web */}
              {showDatePickerModal && (
                <Modal
                  visible={showDatePickerModal}
                  transparent={true}
                  animationType="fade"
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Select Date of Birth</Text>
                      <DateTimePicker
                        value={dateOfBirth}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        textColor={COLORS.PRIMARY}
                      />
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={() => setShowDatePickerModal(false)}
                        >
                          <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.modalButtonConfirm]}
                          onPress={() => setShowDatePickerModal(false)}
                        >
                          <Text style={styles.modalButtonConfirmText}>Confirm</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              )}
              {errors.dateOfBirth && (
                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderOptions}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === 'Male' && styles.selectedGender,
                  ]}
                  onPress={() => setGender('Male')}
                >
                  <Text style={[
                    styles.genderText,
                    gender === 'Male' && styles.selectedGenderText,
                  ]}>
                    Male
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === 'Female' && styles.selectedGender,
                  ]}
                  onPress={() => setGender('Female')}
                >
                  <Text style={[
                    styles.genderText,
                    gender === 'Female' && styles.selectedGenderText,
                  ]}>
                    Female
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === 'Other' && styles.selectedGender,
                  ]}
                  onPress={() => setGender('Other')}
                >
                  <Text style={[
                    styles.genderText,
                    gender === 'Other' && styles.selectedGenderText,
                  ]}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={phoneNumber || formData.phoneNumber || ''}
                editable={false}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={COLORS.PLACEHOLDER}
                value={location.city}
                onChangeText={(text) => setLocation({ ...location, city: text })}
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="State"
                placeholderTextColor={COLORS.PLACEHOLDER}
                value={location.state}
                onChangeText={(text) => setLocation({ ...location, state: text })}
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="Country"
                placeholderTextColor={COLORS.PLACEHOLDER}
                value={location.country}
                onChangeText={(text) => setLocation({ ...location, country: text })}
              />
            </View>
            

          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.SECONDARY,
    marginBottom: 16,
    fontFamily: 'serif',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    marginBottom: 8,
    opacity: 0.9,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 12,
    color: COLORS.SECONDARY,
    fontSize: 16,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: COLORS.SECONDARY,
    fontSize: 16,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedGender: {
    backgroundColor: COLORS.SECONDARY,
  },
  genderText: {
    color: COLORS.SECONDARY,
    fontSize: 14,
  },
  selectedGenderText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  disabledInput: {
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.PRIMARY,
  },
  modalButtonConfirmText: {
    color: COLORS.SECONDARY,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  nextButton: {
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nextButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default PersonalInfoScreen;
