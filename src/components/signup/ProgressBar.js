import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../styles/theme';

const ProgressBar = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.step,
                index + 1 <= currentStep ? styles.activeStep : styles.inactiveStep,
              ]}
            >
              <Text
                style={[
                  styles.stepText,
                  index + 1 <= currentStep ? styles.activeStepText : styles.inactiveStepText,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text style={styles.stepLabel}>
              {index === 0
                ? 'Contact Details'
                : index === 1
                ? 'Verification'
                : index === 2
                ? 'Personal Info'
                : index === 3
                ? 'Preferences'
                : 'Profile Setup'}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepWrapper: {
    alignItems: 'center',
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeStep: {
    backgroundColor: COLORS.SECONDARY,
  },
  inactiveStep: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeStepText: {
    color: COLORS.PRIMARY,
  },
  inactiveStepText: {
    color: COLORS.SECONDARY,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.SECONDARY,
    opacity: 0.8,
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.SECONDARY,
  },
});

export default ProgressBar;
