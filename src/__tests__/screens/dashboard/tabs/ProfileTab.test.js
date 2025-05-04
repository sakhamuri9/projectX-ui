import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ProfileTab from '../../../../screens/dashboard/tabs/ProfileTab';
import ApiService from '../../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../../services/ApiService', () => ({
  user: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    updatePreferences: jest.fn(),
    uploadPhoto: jest.fn(),
    deletePhoto: jest.fn(),
  },
}));

describe('ProfileTab Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return Promise.resolve('1');
      return Promise.resolve(null);
    });
    
    ApiService.user.getProfile.mockResolvedValue({
      data: {
        id: 1,
        name: 'John Doe',
        age: 30,
        bio: 'Software developer and hiking enthusiast',
        photos: [
          { id: 1, url: 'https://randomuser.me/api/portraits/men/32.jpg' },
          { id: 2, url: 'https://randomuser.me/api/portraits/men/33.jpg' },
        ],
        interests: ['Hiking', 'Photography', 'Coding'],
        preferences: {
          ageRange: [25, 35],
          distance: 50,
          showMe: 'women',
        },
        profileCompleteness: 85,
      },
    });
  });

  test('renders loading state initially', async () => {
    const { getByText, queryByText } = render(<ProfileTab />);
    
    expect(getByText('Loading profile...')).toBeTruthy();
    expect(queryByText('John Doe')).toBeNull();
    
    await waitFor(() => {
      expect(ApiService.user.getProfile).toHaveBeenCalledTimes(1);
    });
  });

  test('renders profile after loading', async () => {
    const { findByText } = render(<ProfileTab />);
    
    await waitFor(() => {
      expect(ApiService.user.getProfile).toHaveBeenCalledTimes(1);
    });
    
    await findByText('John Doe');
    await findByText('30');
    await findByText('Software developer and hiking enthusiast');
    await findByText('Hiking');
    await findByText('Photography');
    await findByText('Coding');
  });

  test('handles API error state', async () => {
    ApiService.user.getProfile.mockRejectedValueOnce(new Error('Network error'));
    
    const { getByText, findByText } = render(<ProfileTab />);
    
    await waitFor(() => {
      expect(ApiService.user.getProfile).toHaveBeenCalledTimes(1);
    });
    
    await findByText('Something went wrong');
    expect(getByText('Failed to load profile. Please try again.')).toBeTruthy();
    
    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();
    
    ApiService.user.getProfile.mockResolvedValueOnce({
      data: { id: 1, name: 'John Doe' },
    });
    
    fireEvent.press(retryButton);
    
    await waitFor(() => {
      expect(ApiService.user.getProfile).toHaveBeenCalledTimes(2);
    });
  });

  test('updates bio when edit bio is saved', async () => {
    const { findByText, getByText, getByPlaceholderText } = render(<ProfileTab />);
    
    await findByText('John Doe');
    
    const editBioButton = getByText('Edit');
    fireEvent.press(editBioButton);
    
    const bioInput = getByPlaceholderText('Write something about yourself...');
    fireEvent.changeText(bioInput, 'Updated bio text');
    
    ApiService.user.updateProfile.mockResolvedValueOnce({
      data: { success: true },
    });
    
    const saveButton = getByText('Save');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(ApiService.user.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ bio: 'Updated bio text' })
      );
    });
  });

  test('updates preferences when settings are changed', async () => {
    const { findByText, getByText } = render(<ProfileTab />);
    
    await findByText('John Doe');
    
    const settingsButton = getByText('Settings');
    fireEvent.press(settingsButton);
    
    ApiService.user.updatePreferences.mockResolvedValueOnce({
      data: { success: true },
    });
    
    const saveButton = getByText('Save Preferences');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(ApiService.user.updatePreferences).toHaveBeenCalled();
    });
  });
});
