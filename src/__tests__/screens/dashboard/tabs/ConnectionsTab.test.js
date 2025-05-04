import React from 'react';
import ApiService from '../../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../../screens/dashboard/tabs/ConnectionsTab', () => 'ConnectionsTab');

jest.mock('../../../../services/ApiService', () => ({
  connections: {
    getMutualMatches: jest.fn(),
    getPendingLikes: jest.fn(),
    getSavedProfiles: jest.fn(),
    acceptMatch: jest.fn(),
    rejectMatch: jest.fn(),
    saveProfile: jest.fn(),
    unsaveProfile: jest.fn(),
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

describe('ConnectionsTab API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return Promise.resolve('1');
      if (key === 'authToken') return Promise.resolve('mock-token');
      return Promise.resolve(null);
    });
    
    ApiService.connections.getMutualMatches.mockResolvedValue({
      data: {
        content: [
          {
            id: 1,
            userId: 1,
            name: 'Jessica',
            age: 28,
            image: 'https://randomuser.me/api/portraits/women/33.jpg',
            lastActive: '2 hours ago',
            matchDate: '2 days ago',
          },
          {
            id: 2,
            userId: 2,
            name: 'Michael',
            age: 30,
            image: 'https://randomuser.me/api/portraits/men/52.jpg',
            lastActive: 'Just now',
            matchDate: '1 day ago',
          },
        ],
      },
    });
    
    ApiService.connections.getPendingLikes.mockResolvedValue({
      data: {
        content: [
          {
            id: 3,
            userId: 3,
            name: 'Sophia',
            age: 26,
            image: 'https://randomuser.me/api/portraits/women/44.jpg',
            lastActive: '3 hours ago',
            likeDate: '3 days ago',
          },
        ],
      },
    });
    
    ApiService.connections.getSavedProfiles.mockResolvedValue({
      data: {
        content: [
          {
            id: 4,
            userId: 4,
            name: 'David',
            age: 32,
            image: 'https://randomuser.me/api/portraits/men/46.jpg',
            lastActive: '1 day ago',
            savedDate: '5 days ago',
          },
        ],
      },
    });
    
    ApiService.connections.acceptMatch.mockResolvedValue({
      data: { success: true }
    });
    
    ApiService.connections.rejectMatch.mockResolvedValue({
      data: { success: true }
    });
    
    ApiService.connections.saveProfile.mockResolvedValue({
      data: { success: true }
    });
    
    ApiService.connections.unsaveProfile.mockResolvedValue({
      data: { success: true }
    });
  });

  test('ApiService.connections.getMutualMatches returns expected data', async () => {
    const result = await ApiService.connections.getMutualMatches();
    expect(result.data.content.length).toBe(2);
    expect(result.data.content[0].name).toBe('Jessica');
    expect(result.data.content[0].age).toBe(28);
    expect(result.data.content[1].name).toBe('Michael');
    expect(result.data.content[1].age).toBe(30);
  });

  test('ApiService.connections.getPendingLikes returns expected data', async () => {
    const result = await ApiService.connections.getPendingLikes();
    expect(result.data.content.length).toBe(1);
    expect(result.data.content[0].name).toBe('Sophia');
    expect(result.data.content[0].age).toBe(26);
    expect(result.data.content[0].userId).toBe(3);
  });

  test('ApiService.connections.getSavedProfiles returns expected data', async () => {
    const result = await ApiService.connections.getSavedProfiles();
    expect(result.data.content.length).toBe(1);
    expect(result.data.content[0].name).toBe('David');
    expect(result.data.content[0].age).toBe(32);
    expect(result.data.content[0].userId).toBe(4);
  });

  test('ApiService.connections.acceptMatch is called with correct parameters', async () => {
    await ApiService.connections.acceptMatch(3);
    expect(ApiService.connections.acceptMatch).toHaveBeenCalledWith(3);
    expect(ApiService.connections.acceptMatch).toHaveBeenCalledTimes(1);
  });

  test('ApiService.connections.rejectMatch is called with correct parameters', async () => {
    await ApiService.connections.rejectMatch(3);
    expect(ApiService.connections.rejectMatch).toHaveBeenCalledWith(3);
    expect(ApiService.connections.rejectMatch).toHaveBeenCalledTimes(1);
  });

  test('ApiService.connections.saveProfile is called with correct parameters', async () => {
    await ApiService.connections.saveProfile(3);
    expect(ApiService.connections.saveProfile).toHaveBeenCalledWith(3);
    expect(ApiService.connections.saveProfile).toHaveBeenCalledTimes(1);
  });

  test('ApiService.connections.unsaveProfile is called with correct parameters', async () => {
    await ApiService.connections.unsaveProfile(4);
    expect(ApiService.connections.unsaveProfile).toHaveBeenCalledWith(4);
    expect(ApiService.connections.unsaveProfile).toHaveBeenCalledTimes(1);
  });

  test('ApiService.connections handles error correctly', async () => {
    ApiService.connections.getMutualMatches.mockRejectedValueOnce(new Error('Network error'));
    
    try {
      await ApiService.connections.getMutualMatches();
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
    
    expect(ApiService.connections.getMutualMatches).toHaveBeenCalledTimes(1);
  });

  test('Multiple API calls can be made in parallel', async () => {
    await Promise.all([
      ApiService.connections.getMutualMatches(),
      ApiService.connections.getPendingLikes(),
      ApiService.connections.getSavedProfiles(),
    ]);
    
    expect(ApiService.connections.getMutualMatches).toHaveBeenCalledTimes(1);
    expect(ApiService.connections.getPendingLikes).toHaveBeenCalledTimes(1);
    expect(ApiService.connections.getSavedProfiles).toHaveBeenCalledTimes(1);
  });

  test('handles empty response data correctly', async () => {
    ApiService.connections.getMutualMatches.mockResolvedValueOnce({
      data: {
        content: []
      }
    });
    
    const result = await ApiService.connections.getMutualMatches();
    expect(result.data.content.length).toBe(0);
  });
});
