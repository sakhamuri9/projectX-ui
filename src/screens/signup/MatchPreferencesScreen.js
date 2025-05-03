import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useSignup } from '../../context/SignupContext';
import ProgressBar from '../../components/signup/ProgressBar';
import { COLORS } from '../../styles/theme';

const MatchPreferencesScreen = (props) => {
  const { formData, updateFormData, nextStep, prevStep } = useSignup();
  
  const [lookingFor, setLookingFor] = useState(formData.lookingFor || '');
  const [ageRange, setAgeRange] = useState(formData.ageRange || { min: 18, max: 60 });
  const [relationshipIntent, setRelationshipIntent] = useState(formData.relationshipIntent || '');
  const [religion, setReligion] = useState(formData.religion || '');
  const [caste, setCaste] = useState(formData.caste || '');
  const [preferredLanguages, setPreferredLanguages] = useState(formData.preferredLanguages || []);
  const [interests, setInterests] = useState(formData.interests || []);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const availableLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 
    'Portuguese', 'Russian', 'Japanese', 'Chinese', 'Korean',
    'Hindi', 'Arabic', 'Bengali', 'Telugu', 'Tamil'
  ];
  
  const availableInterests = [
    'Travel', 'Cooking', 'Reading', 'Movies', 'Music',
    'Sports', 'Fitness', 'Photography', 'Art', 'Dancing',
    'Writing', 'Hiking', 'Gaming', 'Technology', 'Fashion',
    'Yoga', 'Meditation', 'Pets', 'Gardening', 'Volunteering'
  ];
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!lookingFor) {
      newErrors.lookingFor = 'Please select who you are looking for';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const showReligionCaste = relationshipIntent === 'Marriage';
  
  const toggleLanguage = (language) => {
    if (preferredLanguages.includes(language)) {
      setPreferredLanguages(preferredLanguages.filter(lang => lang !== language));
    } else {
      setPreferredLanguages([...preferredLanguages, language]);
    }
  };
  
  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(item => item !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };
  
  const handleNext = () => {
    if (validateForm()) {
      setLoading(true);
      
      setTimeout(() => {
        updateFormData({
          lookingFor,
          ageRange,
          relationshipIntent,
          religion: showReligionCaste ? religion : '',
          caste: showReligionCaste ? caste : '',
          preferredLanguages,
          interests,
        });
        setLoading(false);
        nextStep();
        if (props.onComplete) {
          props.onComplete(relationshipIntent);
        }
      }, 500);
    }
  };
  
  const handleBack = () => {
    updateFormData({
      lookingFor,
      ageRange,
      relationshipIntent,
      religion: showReligionCaste ? religion : '',
      caste: showReligionCaste ? caste : '',
      preferredLanguages,
      interests,
    });
    prevStep();
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
        
        <ProgressBar currentStep={4} totalSteps={5} />
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Match Preferences</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Looking For</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  lookingFor === 'Male' && styles.selectedOption,
                ]}
                onPress={() => setLookingFor('Male')}
              >
                <FontAwesome5 
                  name="mars" 
                  size={20} 
                  color={lookingFor === 'Male' ? COLORS.PRIMARY : COLORS.SECONDARY} 
                />
                <Text style={[
                  styles.optionText,
                  lookingFor === 'Male' && styles.selectedOptionText,
                ]}>
                  Male
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  lookingFor === 'Female' && styles.selectedOption,
                ]}
                onPress={() => setLookingFor('Female')}
              >
                <FontAwesome5 
                  name="venus" 
                  size={20} 
                  color={lookingFor === 'Female' ? COLORS.PRIMARY : COLORS.SECONDARY} 
                />
                <Text style={[
                  styles.optionText,
                  lookingFor === 'Female' && styles.selectedOptionText,
                ]}>
                  Female
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  lookingFor === 'Any' && styles.selectedOption,
                ]}
                onPress={() => setLookingFor('Any')}
              >
                <FontAwesome5 
                  name="venus-mars" 
                  size={20} 
                  color={lookingFor === 'Any' ? COLORS.PRIMARY : COLORS.SECONDARY} 
                />
                <Text style={[
                  styles.optionText,
                  lookingFor === 'Any' && styles.selectedOptionText,
                ]}>
                  Any
                </Text>
              </TouchableOpacity>
            </View>
            {errors.lookingFor && (
              <Text style={styles.errorText}>{errors.lookingFor}</Text>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age Range: {ageRange.min} - {ageRange.max === 60 ? '60+' : ageRange.max}</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={60}
                step={1}
                value={ageRange.min}
                onValueChange={(value) => setAgeRange({ ...ageRange, min: value })}
                minimumTrackTintColor={COLORS.SECONDARY}
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor={COLORS.SECONDARY}
              />
              <Text style={styles.sliderLabel}>Min Age</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={60}
                step={1}
                value={ageRange.max}
                onValueChange={(value) => setAgeRange({ ...ageRange, max: Math.max(value, ageRange.min) })}
                minimumTrackTintColor={COLORS.SECONDARY}
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor={COLORS.SECONDARY}
              />
              <Text style={styles.sliderLabel}>Max Age</Text>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relationship Intent</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.intentOption,
                  relationshipIntent === 'Dating' && styles.selectedOption,
                ]}
                onPress={() => setRelationshipIntent('Dating')}
              >
                <FontAwesome5 
                  name="heart" 
                  size={24} 
                  color={relationshipIntent === 'Dating' ? COLORS.PRIMARY : COLORS.SECONDARY} 
                />
                <Text style={[
                  styles.intentText,
                  relationshipIntent === 'Dating' && styles.selectedOptionText,
                ]}>
                  Dating
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.intentOption,
                  relationshipIntent === 'Marriage' && styles.selectedOption,
                ]}
                onPress={() => setRelationshipIntent('Marriage')}
              >
                <FontAwesome5 
                  name="ring" 
                  size={24} 
                  color={relationshipIntent === 'Marriage' ? COLORS.PRIMARY : COLORS.SECONDARY} 
                />
                <Text style={[
                  styles.intentText,
                  relationshipIntent === 'Marriage' && styles.selectedOptionText,
                ]}>
                  Marriage
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.intentOption,
                  relationshipIntent === 'Both' && styles.selectedOption,
                ]}
                onPress={() => setRelationshipIntent('Both')}
              >
                <FontAwesome5 
                  name="star" 
                  size={24} 
                  color={relationshipIntent === 'Both' ? COLORS.PRIMARY : COLORS.SECONDARY} 
                />
                <Text style={[
                  styles.intentText,
                  relationshipIntent === 'Both' && styles.selectedOptionText,
                ]}>
                  Both
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Only show religion and caste fields if Marriage is selected */}
          {(showReligionCaste || relationshipIntent === 'Both') ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Religion &amp; Caste (Optional)</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>
                    {religion || 'Select Religion'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.SECONDARY} />
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.dropdown, { marginTop: 8 }]}>
                  <Text style={styles.dropdownText}>
                    {caste || 'Select Caste'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.SECONDARY} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Languages</Text>
            <View style={styles.chipsContainer}>
              {availableLanguages.map((language) => (
                <TouchableOpacity
                  key={language}
                  style={[
                    styles.chip,
                    preferredLanguages.includes(language) && styles.selectedChip,
                  ]}
                  onPress={() => toggleLanguage(language)}
                >
                  <Text style={[
                    styles.chipText,
                    preferredLanguages.includes(language) && styles.selectedChipText,
                  ]}>
                    {language}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Interests / Hobbies</Text>
            <View style={styles.chipsContainer}>
              {availableInterests.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.chip,
                    interests.includes(interest) && styles.selectedChip,
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text style={[
                    styles.chipText,
                    interests.includes(interest) && styles.selectedChipText,
                  ]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={loading}
          >
            <MaterialIcons name="arrow-back" size={20} color={COLORS.SECONDARY} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.PRIMARY} />
            ) : (
              <>
                <Text style={styles.nextButtonText}>Next</Text>
                <MaterialIcons name="arrow-forward" size={20} color={COLORS.PRIMARY} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    marginBottom: 12,
    opacity: 0.9,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  optionText: {
    color: COLORS.SECONDARY,
    marginLeft: 8,
    fontSize: 14,
  },
  selectedOption: {
    backgroundColor: COLORS.SECONDARY,
  },
  selectedOptionText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabel: {
    color: COLORS.SECONDARY,
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'right',
  },
  intentOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
  },
  intentText: {
    color: COLORS.SECONDARY,
    marginTop: 8,
    fontSize: 14,
  },
  dropdownContainer: {
    width: '100%',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 12,
  },
  dropdownText: {
    color: COLORS.SECONDARY,
    fontSize: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedChip: {
    backgroundColor: COLORS.SECONDARY,
  },
  chipText: {
    color: COLORS.SECONDARY,
    fontSize: 14,
  },
  selectedChipText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginRight: 8,
  },
  backButtonText: {
    color: COLORS.SECONDARY,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    marginLeft: 8,
  },
  nextButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default MatchPreferencesScreen;
