import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useSignup } from '../../context/SignupContext';
import ProgressBar from '../../components/signup/ProgressBar';
import { COLORS } from '../../styles/theme';

const ProfileSetupScreen = ({ onBack, onComplete }) => {
  const { formData, updateFormData, prevStep, submitForm, resetForm } = useSignup();
  const relationshipIntent = formData.relationshipIntent || '';
  
  const [profilePicture, setProfilePicture] = useState(formData.profilePicture || null);
  const [governmentId, setGovernmentId] = useState(formData.governmentId || null);
  const [bio, setBio] = useState(formData.bio || '');
  const [prompts, setPrompts] = useState(formData.prompts || [
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const availablePrompts = [
    'A perfect weekend for me is...',
    'One thing I cannot live without...',
    'My ideal partner is...',
    'My favorite travel destination is...',
    'I am looking for someone who...',
    'My most controversial opinion is...',
    'The way to my heart is...',
    'I get excited about...',
    'My life goal is...',
    'My favorite conversation topic is...',
  ];
  
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload your profile picture.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to take a profile picture.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };
  
  const handlePromptChange = (index, field, value) => {
    const updatedPrompts = [...prompts];
    updatedPrompts[index] = {
      ...updatedPrompts[index],
      [field]: value,
    };
    setPrompts(updatedPrompts);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    
    if (!bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (bio.length > 200) {
      newErrors.bio = 'Bio must be 200 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        updateFormData({
          profilePicture,
          governmentId,
          bio,
          prompts,
        });
        
        const result = await submitForm();
        
        Alert.alert(
          'Profile Created',
          'Your profile has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                if (onComplete) {
                  onComplete(relationshipIntent);
                }
              },
            },
          ]
        );
      } catch (error) {
        console.error('Error submitting form:', error);
        Alert.alert(
          'Error',
          'There was an error creating your profile. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleBack = () => {
    updateFormData({
      profilePicture,
      governmentId,
      bio,
      prompts,
    });
    prevStep();
    if (onBack) {
      onBack();
    }
  };
  
  const pickGovernmentId = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload your ID.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setGovernmentId(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takeGovernmentIdPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to take a photo of your ID.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setGovernmentId(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
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
        
        <ProgressBar currentStep={5} totalSteps={5} />
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Profile Setup</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Picture</Text>
            <View style={styles.profilePictureContainer}>
              {profilePicture ? (
                <View style={styles.profileImageContainer}>
                  <Image source={{ uri: profilePicture }} style={styles.profileImage} />
                  <TouchableOpacity
                    style={styles.changeProfileButton}
                    onPress={pickImage}
                  >
                    <MaterialIcons name="edit" size={20} color={COLORS.SECONDARY} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.profileUploadButtons}>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickImage}
                  >
                    <FontAwesome name="image" size={20} color={COLORS.SECONDARY} />
                    <Text style={styles.uploadButtonText}>Gallery</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={takePhoto}
                  >
                    <FontAwesome name="camera" size={20} color={COLORS.SECONDARY} />
                    <Text style={styles.uploadButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {errors.profilePicture && (
              <Text style={styles.errorText}>{errors.profilePicture}</Text>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Government ID</Text>
            <View style={styles.idUploadContainer}>
              {governmentId ? (
                <View style={styles.idPreviewContainer}>
                  <Image source={{ uri: governmentId }} style={styles.idPreview} />
                  <TouchableOpacity
                    style={styles.changeIdButton}
                    onPress={pickGovernmentId}
                  >
                    <MaterialIcons name="edit" size={20} color={COLORS.SECONDARY} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.idUploadButtons}>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickGovernmentId}
                  >
                    <FontAwesome name="image" size={20} color={COLORS.SECONDARY} />
                    <Text style={styles.uploadButtonText}>Gallery</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={takeGovernmentIdPhoto}
                  >
                    <FontAwesome name="camera" size={20} color={COLORS.SECONDARY} />
                    <Text style={styles.uploadButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {errors.governmentId && (
              <Text style={styles.errorText}>{errors.governmentId}</Text>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio (About Me)</Text>
            <TextInput
              style={[styles.bioInput, errors.bio && styles.inputError]}
              placeholder="Tell us about yourself..."
              placeholderTextColor={COLORS.PLACEHOLDER}
              multiline
              numberOfLines={4}
              maxLength={200}
              value={bio}
              onChangeText={setBio}
            />
            <Text style={styles.charCount}>{bio.length}/200</Text>
            {errors.bio && (
              <Text style={styles.errorText}>{errors.bio}</Text>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prompts (Optional)</Text>
            <Text style={styles.promptSubtitle}>Choose up to 3 prompts to showcase your personality</Text>
            
            {prompts.map((prompt, index) => (
              <View key={index} style={styles.promptContainer}>
                <TouchableOpacity style={styles.promptSelector}>
                  <Text style={styles.promptSelectorText}>
                    {prompt.question || `Select Prompt ${index + 1}`}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.SECONDARY} />
                </TouchableOpacity>
                
                {prompt.question && (
                  <TextInput
                    style={styles.promptInput}
                    placeholder="Your answer..."
                    placeholderTextColor={COLORS.PLACEHOLDER}
                    multiline
                    numberOfLines={2}
                    value={prompt.answer}
                    onChangeText={(text) => handlePromptChange(index, 'answer', text)}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <MaterialIcons name="arrow-back" size={20} color={COLORS.SECONDARY} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.PRIMARY} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Create Profile</Text>
                <MaterialIcons name="check" size={20} color={COLORS.PRIMARY} />
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
    marginBottom: 8,
    opacity: 0.9,
  },
  profilePictureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: COLORS.SECONDARY,
  },
  changeProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idUploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  idPreviewContainer: {
    position: 'relative',
  },
  idPreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.SECONDARY,
  },
  changeIdButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idUploadButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  profileUploadButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    width: '45%',
    margin: 8,
  },
  uploadButtonText: {
    color: COLORS.SECONDARY,
    marginLeft: 8,
    fontSize: 14,
  },
  bioInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 12,
    color: COLORS.SECONDARY,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  charCount: {
    color: COLORS.SECONDARY,
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
  },
  promptSubtitle: {
    color: COLORS.SECONDARY,
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 12,
  },
  promptContainer: {
    marginBottom: 16,
  },
  promptSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  promptSelectorText: {
    color: COLORS.SECONDARY,
    fontSize: 14,
  },
  promptInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 12,
    color: COLORS.SECONDARY,
    fontSize: 14,
    textAlignVertical: 'top',
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
  submitButton: {
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    marginLeft: 8,
  },
  submitButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default ProfileSetupScreen;
