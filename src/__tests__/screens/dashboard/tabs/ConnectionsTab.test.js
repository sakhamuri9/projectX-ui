import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ConnectionsTab from '../../../../screens/dashboard/tabs/ConnectionsTab';
import ApiService from '../../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const mockNavigation = {
  navigate: jest.fn(),
};

describe('ConnectionsTab Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return Promise.resolve('1');
      return Promise.resolve(null);
    });
    
    ApiService.connections.getMutualMatches.mockResolvedValue({
      data: {
        content: [
          {
            id: 1,
            name: 'Jessica',
            age: 28,
            image: 'https://randomuser.me/api/portraits/women/33.jpg',
            lastActive: '2 hours ago',
            matchDate: '2 days ago',
          },
          {
            id: 2,
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
            name: 'David',
            age: 32,
            image: 'https://randomuser.me/api/portraits/men/46.jpg',
            lastActive: '1 day ago',
            savedDate: '5 days ago',
          },
        ],
      },
    });
  });

  test('renders loading state initially', async () => {
    const { getByText, queryByText } = render(<ConnectionsTab navigation={mockNavigation} />);
    
    expect(getByText('Loading connections...')).toBeTruthy();
    expect(queryByText('Mutual Matches')).toBeNull();
    
    await waitFor(() => {
      expect(ApiService.connections.getMutualMatches).toHaveBeenCalledTimes(1);
    });
  });

  test('renders connections after loading', async () => {
    const { findByText } = render(<ConnectionsTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(ApiService.connections.getMutualMatches).toHaveBeenCalledTimes(1);
      expect(ApiService.connections.getPendingLikes).toHaveBeenCalledTimes(1);
      expect(ApiService.connections.getSavedProfiles).toHaveBeenCalledTimes(1);
    });
    
    await findByText('Mutual Matches');
    await findByText('Jessica');
    await findByText('Michael');
    await findByText('Pending Likes');
    await findByText('Sophia');
    await findByText('Saved Profiles');
    await findByText('David');
  });

  test('handles API error state', async () => {
    ApiService.connections.getMutualMatches.mockRejectedValueOnce(new Error('Network error'));
    
    const { getByText, findByText } = render(<ConnectionsTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(ApiService.connections.getMutualMatches).toHaveBeenCalledTimes(1);
    });
    
    await findByText('Something went wrong');
    expect(getByText('Failed to load connections. Please try again.')).toBeTruthy();
    
    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();
    
    ApiService.connections.getMutualMatches.mockResolvedValueOnce({
      data: { content: [] },
    });
    
    fireEvent.press(retryButton);
    
    await waitFor(() => {
      expect(ApiService.connections.getMutualMatches).toHaveBeenCalledTimes(2);
    });
  });

  test('handles empty connections state', async () => {
    ApiService.connections.getMutualMatches.mockResolvedValueOnce({
      data: { content: [] },
    });
    ApiService.connections.getPendingLikes.mockResolvedValueOnce({
      data: { content: [] },
    });
    ApiService.connections.getSavedProfiles.mockResolvedValueOnce({
      data: { content: [] },
    });
    
    const { getByText, findByText } = render(<ConnectionsTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(ApiService.connections.getMutualMatches).toHaveBeenCalledTimes(1);
      expect(ApiService.connections.getPendingLikes).toHaveBeenCalledTimes(1);
      expect(ApiService.connections.getSavedProfiles).toHaveBeenCalledTimes(1);
    });
    
    await findByText('No connections yet');
    expect(getByText('Start matching with people to build connections')).toBeTruthy();
    
    const findMatchesButton = getByText('Find Matches');
    expect(findMatchesButton).toBeTruthy();
    
    fireEvent.press(findMatchesButton);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('MatchesTab');
  });

  test('accepts a pending match', async () => {
    const { findByText, getAllByA11yRole } = render(<ConnectionsTab navigation={mockNavigation} />);
    
    await findByText('Sophia');
    
    ApiService.connections.acceptMatch.mockResolvedValueOnce({
      data: { success: true },
    });
    
    const buttons = getAllByA11yRole('button');
    const acceptButton = buttons.find(button => button.props.accessibilityLabel === 'Accept Sophia');
    fireEvent.press(acceptButton);
    
    await waitFor(() => {
      expect(ApiService.connections.acceptMatch).toHaveBeenCalledWith(3);
    });
    
    await waitFor(() => {
      expect(ApiService.connections.getMutualMatches).toHaveBeenCalledTimes(2);
      expect(ApiService.connections.getPendingLikes).toHaveBeenCalledTimes(2);
    });
  });

  test('rejects a pending match', async () => {
    const { findByText, getAllByA11yRole } = render(<ConnectionsTab navigation={mockNavigation} />);
    
    await findByText('Sophia');
    
    ApiService.connections.rejectMatch.mockResolvedValueOnce({
      data: { success: true },
    });
    
    const buttons = getAllByA11yRole('button');
    const rejectButton = buttons.find(button => button.props.accessibilityLabel === 'Reject Sophia');
    fireEvent.press(rejectButton);
    
    await waitFor(() => {
      expect(ApiService.connections.rejectMatch).toHaveBeenCalledWith(3);
    });
    
    await waitFor(() => {
      expect(ApiService.connections.getPendingLikes).toHaveBeenCalledTimes(2);
    });
  });

  test('unsaves a saved profile', async () => {
    const { findByText, getAllByA11yRole } = render(<ConnectionsTab navigation={mockNavigation} />);
    
    await findByText('David');
    
    ApiService.connections.unsaveProfile.mockResolvedValueOnce({
      data: { success: true },
    });
    
    const buttons = getAllByA11yRole('button');
    const unsaveButton = buttons.find(button => button.props.accessibilityLabel === 'Unsave David');
    fireEvent.press(unsaveButton);
    
    await waitFor(() => {
      expect(ApiService.connections.unsaveProfile).toHaveBeenCalledWith(4);
    });
    
    await waitFor(() => {
      expect(ApiService.connections.getSavedProfiles).toHaveBeenCalledTimes(2);
    });
  });
});
