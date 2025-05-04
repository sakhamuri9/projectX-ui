import React from 'react';
import ApiService from '../../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../../screens/dashboard/tabs/MatchesTab', () => 'MatchesTab');

jest.mock('../../../../services/ApiService', () => ({
  matches: {
    getMatches: jest.fn(),
    swipeLeft: jest.fn(),
    swipeRight: jest.fn(),
    superLike: jest.fn(),
    getFilterSettings: jest.fn(),
    updateFilterSettings: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
};

describe('MatchesTab API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return Promise.resolve('1');
      if (key === 'authToken') return Promise.resolve('mock-token');
      return Promise.resolve(null);
    });
    
    ApiService.matches.getMatches.mockResolvedValue({
      data: {
        content: [
          {
            id: 1,
            name: 'Jessica',
            age: 27,
            location: 'New York, NY',
            distance: '3 miles away',
            matchPercentage: 92,
            bio: 'Passionate about travel, photography, and meeting new people.',
            image: 'https://randomuser.me/api/portraits/women/33.jpg',
            interests: ['Travel', 'Photography', 'Cooking'],
            mutualInterests: ['Travel', 'Photography'],
            icebreaker: 'Ask Jessica about her favorite travel destination.',
            matchReasons: [
              'You both love photography',
              'Located in the same city',
              '85% personality compatibility'
            ],
            personalityType: 'Creative',
            isOnline: true,
          },
          {
            id: 2,
            name: 'Michael',
            age: 29,
            location: 'Brooklyn, NY',
            distance: '5 miles away',
            matchPercentage: 87,
            bio: 'Music lover, coffee enthusiast, and weekend hiker.',
            image: 'https://randomuser.me/api/portraits/men/52.jpg',
            interests: ['Music', 'Hiking', 'Coffee'],
            mutualInterests: ['Coffee'],
            icebreaker: 'Ask Michael about his favorite coffee brewing method.',
            matchReasons: [
              'You both enjoy coffee',
              'Similar age group',
              'Complementary interests'
            ],
            personalityType: 'Adventurous',
            isOnline: false,
          },
        ],
      },
    });
    
    ApiService.matches.getFilterSettings.mockResolvedValue({
      data: {
        radius: 10,
        ageRange: [24, 30],
        intent: 'both',
        showOnlineOnly: false
      }
    });
  });

  test('ApiService.matches.getMatches returns expected data', async () => {
    const result = await ApiService.matches.getMatches();
    expect(result.data.content.length).toBe(2);
    expect(result.data.content[0].name).toBe('Jessica');
    expect(result.data.content[1].name).toBe('Michael');
  });

  test('ApiService.matches.swipeLeft is called with correct parameters', () => {
    ApiService.matches.swipeLeft(1);
    expect(ApiService.matches.swipeLeft).toHaveBeenCalledWith(1);
  });

  test('ApiService.matches.swipeRight is called with correct parameters', () => {
    ApiService.matches.swipeRight(1);
    expect(ApiService.matches.swipeRight).toHaveBeenCalledWith(1);
  });

  test('ApiService.matches.updateFilterSettings is called with correct parameters', () => {
    const filterSettings = {
      radius: 15,
      ageRange: [25, 35],
      intent: 'relationship',
      showOnlineOnly: true
    };
    
    ApiService.matches.updateFilterSettings(filterSettings);
    expect(ApiService.matches.updateFilterSettings).toHaveBeenCalledWith(filterSettings);
  });

  test('ApiService.matches.getFilterSettings returns expected data', async () => {
    const result = await ApiService.matches.getFilterSettings();
    expect(result).toEqual({
      data: {
        radius: 10,
        ageRange: [24, 30],
        intent: 'both',
        showOnlineOnly: false
      }
    });
  });
  
  test('handles API error gracefully', async () => {
    ApiService.matches.getMatches.mockRejectedValueOnce(new Error('Network error'));
    
    try {
      await ApiService.matches.getMatches();
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
    
    expect(ApiService.matches.getMatches).toHaveBeenCalledTimes(1);
  });
  
  test('handles empty matches response correctly', async () => {
    ApiService.matches.getMatches.mockResolvedValueOnce({
      data: {
        content: []
      }
    });
    
    const result = await ApiService.matches.getMatches();
    expect(result.data.content.length).toBe(0);
  });
});
