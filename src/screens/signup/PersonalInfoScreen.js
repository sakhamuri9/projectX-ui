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
  const [manualDateInput, setManualDateInput] = useState('');
  const [errors, setErrors] = useState({});
  
  const generateCalendarDays = () => {
    const year = dateOfBirth.getFullYear();
    const month = dateOfBirth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        currentMonth: false
      });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        currentMonth: true
      });
    }
    
    const remainingDays = 42 - days.length; // 6 rows x 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        currentMonth: false
      });
    }
    
    return days;
  };
  
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
      setManualDateInput(''); // Reset manual input when opening modal
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
                      
                      {/* Custom calendar for web with manual input option */}
                      <View style={styles.customCalendarContainer}>
                        {/* Manual date input field */}
                        <View style={styles.manualDateInputContainer}>
                          <Text style={styles.manualDateInputLabel}>Enter date manually:</Text>
                          <View style={styles.dateInputRow}>
                            {Platform.OS === 'web' ? (
                              <input
                                style={{
                                  flex: 1,
                                  height: 40,
                                  borderWidth: 1,
                                  borderColor: 'white',
                                  borderRadius: 8,
                                  paddingLeft: 12,
                                  paddingRight: 12,
                                  color: 'white',
                                  fontSize: 16,
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                }}
                                placeholder="MM/DD/YYYY"
                                type="text"
                                value={manualDateInput}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setManualDateInput(text);
                                  
                                  const parts = text.split('/');
                                  if (parts.length === 3 && parts[2].length === 4) {
                                    const month = parseInt(parts[0]) - 1;
                                    const day = parseInt(parts[1]);
                                    const year = parseInt(parts[2]);
                                    
                                    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                                      const newDate = new Date(year, month, day);
                                      if (!isNaN(newDate.getTime()) && newDate <= new Date()) {
                                        setDateOfBirth(newDate);
                                      }
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <TextInput
                                style={styles.manualDateInput}
                                placeholder="MM/DD/YYYY"
                                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                value={formatDate(dateOfBirth)}
                                onChangeText={(text) => {
                                  const parts = text.split('/');
                                  if (parts.length === 3) {
                                    const month = parseInt(parts[0]) - 1;
                                    const day = parseInt(parts[1]);
                                    const year = parseInt(parts[2]);
                                    
                                    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                                      const newDate = new Date(year, month, day);
                                      if (!isNaN(newDate.getTime()) && newDate <= new Date()) {
                                        setDateOfBirth(newDate);
                                      }
                                    }
                                  }
                                }}
                                keyboardType="numeric"
                              />
                            )}
                            <TouchableOpacity 
                              style={styles.todayButton}
                              onPress={() => setDateOfBirth(new Date())}
                            >
                              <Text style={styles.todayButtonText}>Today</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        
                        <View style={styles.calendarHeader}>
                          <Text style={styles.calendarTitle}>
                            {dateOfBirth.toLocaleString('default', { month: 'long' })} {dateOfBirth.getFullYear()}
                          </Text>
                          <View style={styles.calendarNavigation}>
                            <TouchableOpacity 
                              style={styles.calendarNavButton}
                              onPress={() => {
                                const prevMonth = new Date(dateOfBirth);
                                prevMonth.setMonth(prevMonth.getMonth() - 1);
                                setDateOfBirth(prevMonth);
                              }}
                            >
                              <Text style={styles.calendarNavButtonText}>◀</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.calendarNavButton}
                              onPress={() => {
                                const nextMonth = new Date(dateOfBirth);
                                nextMonth.setMonth(nextMonth.getMonth() + 1);
                                if (nextMonth <= new Date()) {
                                  setDateOfBirth(nextMonth);
                                }
                              }}
                            >
                              <Text style={styles.calendarNavButtonText}>▶</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        
                        <View style={styles.calendarDaysHeader}>
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                            <Text key={index} style={styles.calendarDayHeaderText}>{day}</Text>
                          ))}
                        </View>
                        
                        <View style={styles.calendarDaysGrid}>
                          {generateCalendarDays().map((day, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.calendarDay,
                                day.currentMonth && styles.currentMonthDay,
                                day.date.getDate() === dateOfBirth.getDate() && 
                                day.date.getMonth() === dateOfBirth.getMonth() && 
                                day.date.getFullYear() === dateOfBirth.getFullYear() && 
                                styles.selectedDay,
                                day.date > new Date() && styles.disabledDay
                              ]}
                              disabled={day.date > new Date()}
                              onPress={() => {
                                if (day.date <= new Date()) {
                                  setDateOfBirth(day.date);
                                }
                              }}
                            >
                              <Text style={[
                                styles.calendarDayText,
                                day.currentMonth && styles.currentMonthDayText,
                                day.date.getDate() === dateOfBirth.getDate() && 
                                day.date.getMonth() === dateOfBirth.getMonth() && 
                                day.date.getFullYear() === dateOfBirth.getFullYear() && 
                                styles.selectedDayText,
                                day.date > new Date() && styles.disabledDayText
                              ]}>
                                {day.date.getDate()}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={() => setShowDatePickerModal(false)}
                        >
                          <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.modalButtonConfirm]}
                          onPress={() => {
                            if (manualDateInput) {
                              const parts = manualDateInput.split('/');
                              if (parts.length === 3) {
                                const month = parseInt(parts[0]) - 1;
                                const day = parseInt(parts[1]);
                                const year = parseInt(parts[2]);
                                
                                if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                                  const newDate = new Date(year, month, day);
                                  if (!isNaN(newDate.getTime()) && newDate <= new Date()) {
                                    setDateOfBirth(newDate);
                                  }
                                }
                              }
                            }
                            setManualDateInput('');
                            setShowDatePickerModal(false);
                          }}
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
  webDatePickerContainer: {
    width: '100%',
    marginBottom: 10,
  },
  customCalendarContainer: {
    width: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.SECONDARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    fontFamily: 'serif',
    letterSpacing: 1,
  },
  calendarNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  calendarNavButtonText: {
    color: COLORS.SECONDARY,
    fontSize: 16,
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  calendarDayHeaderText: {
    width: 36,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 18,
  },
  calendarDayText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  currentMonthDay: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  currentMonthDayText: {
    color: COLORS.SECONDARY,
  },
  selectedDay: {
    backgroundColor: COLORS.SECONDARY,
    borderWidth: 0,
    transform: [{ scale: 1.1 }],
    elevation: 3,
  },
  selectedDayText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  manualDateInputContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 16,
  },
  manualDateInputLabel: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  manualDateInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.SECONDARY,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  todayButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
  },
  todayButtonText: {
    color: COLORS.SECONDARY,
    fontSize: 14,
    fontWeight: '500',
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
