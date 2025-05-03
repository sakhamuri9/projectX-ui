import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupContext = createContext();

export const useSignup = () => useContext(SignupContext);

export const SignupProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: null,
    gender: '',
    phoneNumber: '',
    location: {
      city: '',
      state: '',
      country: '',
    },
    governmentId: null,
    
    lookingFor: '',
    ageRange: { min: 18, max: 60 },
    relationshipIntent: '',
    religion: '',
    caste: '',
    preferredLanguages: [],
    interests: [],
    
    profilePicture: null,
    bio: '',
    prompts: [
      { question: '', answer: '' },
      { question: '', answer: '' },
      { question: '', answer: '' },
    ],
  });

  useEffect(() => {
    const loadSavedFormData = async () => {
      try {
        const savedFormData = await AsyncStorage.getItem('signupFormData');
        const savedStep = await AsyncStorage.getItem('signupCurrentStep');
        
        if (savedFormData) {
          setFormData(JSON.parse(savedFormData));
        }
        
        if (savedStep) {
          setCurrentStep(parseInt(savedStep, 10));
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    };
    
    loadSavedFormData();
  }, []);

  useEffect(() => {
    const saveFormData = async () => {
      try {
        await AsyncStorage.setItem('signupFormData', JSON.stringify(formData));
        await AsyncStorage.setItem('signupCurrentStep', currentStep.toString());
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };
    
    saveFormData();
  }, [formData, currentStep]);

  const updateFormData = (stepData) => {
    setFormData(prevData => ({
      ...prevData,
      ...stepData,
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const resetForm = async () => {
    setFormData({
      fullName: '',
      dateOfBirth: null,
      gender: '',
      phoneNumber: '',
      location: {
        city: '',
        state: '',
        country: '',
      },
      governmentId: null,
      lookingFor: '',
      ageRange: { min: 18, max: 60 },
      relationshipIntent: '',
      religion: '',
      caste: '',
      preferredLanguages: [],
      interests: [],
      profilePicture: null,
      bio: '',
      prompts: [
        { question: '', answer: '' },
        { question: '', answer: '' },
        { question: '', answer: '' },
      ],
    });
    setCurrentStep(1);
    
    try {
      await AsyncStorage.removeItem('signupFormData');
      await AsyncStorage.removeItem('signupCurrentStep');
    } catch (error) {
      console.error('Error resetting form data:', error);
    }
  };

  const submitForm = async () => {
    console.log('Form submitted:', formData);
    
    return formData;
  };

  return (
    <SignupContext.Provider
      value={{
        currentStep,
        formData,
        updateFormData,
        nextStep,
        prevStep,
        resetForm,
        submitForm,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
};
