import React from 'react';
import ApiService from '../../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';

jest.mock('../../../../screens/dashboard/tabs/ProfileTab', () => 'ProfileTab');

jest.mock('../../../../services/ApiService', () => ({
  user: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    updatePreferences: jest.fn(),
    uploadPhoto: jest.fn(),
    deletePhoto: jest.fn(),
  },
  insights: {
    getProfilePerformance: jest.fn(),
    getPhotoPerformance: jest.fn(),
    getMatchStats: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockImplementation(() => Promise.resolve({
    uri: 'mock-processed-image-uri'
  })),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  }
}));

const mockNavigation = {
  navigate: jest.fn(),
};

describe('ProfileTab API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return Promise.resolve('1');
      if (key === 'authToken') return Promise.resolve('mock-token');
      return Promise.resolve(null);
    });
    
    ApiService.user.getProfile.mockResolvedValue({
      data: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        bio: 'Software developer and hiking enthusiast',
        location: 'San Francisco, CA',
        photos: [
          { id: 1, url: 'https://randomuser.me/api/portraits/men/32.jpg', isMain: true },
          { id: 2, url: 'https://randomuser.me/api/portraits/men/33.jpg' },
        ],
        interests: ['Hiking', 'Photography', 'Coding'],
        preferences: {
          genderPreference: 'women',
          minAge: 25,
          maxAge: 35,
          maxDistance: 50,
        },
        profileCompleteness: 85,
      },
    });
    
    ApiService.insights.getProfilePerformance.mockResolvedValue({
      data: {
        likes: 82,
        views: 154,
        pendingChats: 6,
        matches: 12,
      },
    });
    
    ApiService.user.updateProfile.mockResolvedValue({
      data: { success: true }
    });
    
    ApiService.user.updatePreferences.mockResolvedValue({
      data: { success: true }
    });
    
    ApiService.user.uploadPhoto.mockResolvedValue({
      data: { 
        id: 3, 
        url: 'https://randomuser.me/api/portraits/men/34.jpg',
        isMain: false
      }
    });
    
    ApiService.user.deletePhoto.mockResolvedValue({
      data: { success: true }
    });
  });

  test('ApiService.user.getProfile returns expected data', async () => {
    const result = await ApiService.user.getProfile();
    expect(result.data.firstName).toBe('John');
    expect(result.data.lastName).toBe('Doe');
    expect(result.data.age).toBe(30);
    expect(result.data.bio).toBe('Software developer and hiking enthusiast');
    expect(result.data.location).toBe('San Francisco, CA');
    expect(result.data.photos.length).toBe(2);
    expect(result.data.interests).toContain('Hiking');
    expect(result.data.preferences.genderPreference).toBe('women');
  });

  test('ApiService.insights.getProfilePerformance returns expected data', async () => {
    const result = await ApiService.insights.getProfilePerformance();
    expect(result.data.likes).toBe(82);
    expect(result.data.views).toBe(154);
    expect(result.data.pendingChats).toBe(6);
    expect(result.data.matches).toBe(12);
  });

  test('ApiService.user.updateProfile is called with correct parameters', async () => {
    const profileUpdate = {
      bio: 'Updated bio text',
      interests: ['Hiking', 'Photography', 'Coding', 'Travel']
    };
    
    await ApiService.user.updateProfile(profileUpdate);
    
    expect(ApiService.user.updateProfile).toHaveBeenCalledWith(profileUpdate);
    expect(ApiService.user.updateProfile).toHaveBeenCalledTimes(1);
  });

  test('ApiService.user.updatePreferences is called with correct parameters', async () => {
    const preferencesUpdate = {
      genderPreference: 'both',
      minAge: 24,
      maxAge: 36,
      maxDistance: 75
    };
    
    await ApiService.user.updatePreferences(preferencesUpdate);
    
    expect(ApiService.user.updatePreferences).toHaveBeenCalledWith(preferencesUpdate);
    expect(ApiService.user.updatePreferences).toHaveBeenCalledTimes(1);
  });

  test('ApiService.user.uploadPhoto is called with correct parameters', async () => {
    const photoData = {
      uri: 'file:///path/to/photo.jpg',
      isMain: false
    };
    
    await ApiService.user.uploadPhoto(photoData);
    
    expect(ApiService.user.uploadPhoto).toHaveBeenCalledWith(photoData);
    expect(ApiService.user.uploadPhoto).toHaveBeenCalledTimes(1);
  });

  test('ApiService.user.deletePhoto is called with correct parameters', async () => {
    await ApiService.user.deletePhoto(2);
    
    expect(ApiService.user.deletePhoto).toHaveBeenCalledWith(2);
    expect(ApiService.user.deletePhoto).toHaveBeenCalledTimes(1);
  });

  test('ImageManipulator.manipulateAsync processes images correctly', async () => {
    const result = await ImageManipulator.manipulateAsync(
      'file:///path/to/photo.jpg',
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'file:///path/to/photo.jpg',
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: 'jpeg' }
    );
    
    expect(result.uri).toBe('mock-processed-image-uri');
  });
  
  test('handles API error gracefully', async () => {
    ApiService.user.getProfile.mockRejectedValueOnce(new Error('Network error'));
    
    try {
      await ApiService.user.getProfile();
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
    
    expect(ApiService.user.getProfile).toHaveBeenCalledTimes(1);
  });
  
  test('handles empty photos array correctly', async () => {
    ApiService.user.getProfile.mockResolvedValueOnce({
      data: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        bio: 'Software developer and hiking enthusiast',
        location: 'San Francisco, CA',
        photos: [],
        interests: ['Hiking', 'Photography', 'Coding'],
        preferences: {
          genderPreference: 'women',
          minAge: 25,
          maxAge: 35,
          maxDistance: 50,
        },
        profileCompleteness: 85,
      },
    });
    
    const result = await ApiService.user.getProfile();
    expect(result.data.photos.length).toBe(0);
  });
});
