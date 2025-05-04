import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import InsightsTab from '../../../../screens/dashboard/tabs/InsightsTab';
import ApiService from '../../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../../services/ApiService', () => ({
  insights: {
    getProfilePerformance: jest.fn(),
    getPhotoPerformance: jest.fn(),
    getMatchStats: jest.fn(),
    getActivityInsights: jest.fn(),
  },
}));

describe('InsightsTab Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return Promise.resolve('1');
      return Promise.resolve(null);
    });
    
    ApiService.insights.getProfilePerformance.mockResolvedValue({
      data: {
        views: 120,
        likes: 45,
        matchRate: 38,
        profileCompleteness: 85,
      },
    });
    
    ApiService.insights.getPhotoPerformance.mockResolvedValue({
      data: {
        topPhoto: {
          id: 1,
          url: 'https://randomuser.me/api/portraits/men/32.jpg',
          likeRate: 60,
        },
        photos: [
          {
            id: 1,
            url: 'https://randomuser.me/api/portraits/men/32.jpg',
            likeRate: 60,
          },
          {
            id: 2,
            url: 'https://randomuser.me/api/portraits/men/33.jpg',
            likeRate: 45,
          },
        ],
      },
    });
    
    ApiService.insights.getMatchStats.mockResolvedValue({
      data: {
        personalityData: [
          {
            name: 'Creative',
            population: 35,
            color: '#FF6B6B',
          },
          {
            name: 'Ambitious',
            population: 40,
            color: '#4ECDC4',
          },
        ],
        locationData: [
          { city: 'New York', views: 42, percentage: 300 },
          { city: 'Los Angeles', views: 28, percentage: 200 },
        ],
        trendingTags: [
          { tag: 'Photography', popularity: 92 },
          { tag: 'Hiking', popularity: 87 },
        ],
        vibeRatings: ['Mysterious', 'Stylish', 'Witty'],
        boostRecommendation: {
          day: 'Friday',
          time: '8:00 PM',
          multiplier: '10x',
        },
      },
    });
    
    ApiService.insights.getActivityInsights.mockResolvedValue({
      data: {
        engagementData: [
          { day: 'Mon', morning: 5, afternoon: 7, evening: 12, night: 8 },
          { day: 'Tue', morning: 6, afternoon: 8, evening: 15, night: 10 },
        ],
        completionTasks: [
          { task: 'Add 1 more interest', completed: false },
          { task: 'Upload 1 more photo', completed: false },
        ],
        weeklyData: [
          { day: 'Mon', views: 12 },
          { day: 'Tue', views: 18 },
        ],
      },
    });
  });

  test('renders loading state initially', async () => {
    const { getByText, queryByText } = render(<InsightsTab />);
    
    expect(getByText('Loading insights...')).toBeTruthy();
    expect(queryByText('Your Insights')).toBeNull();
    
    await waitFor(() => {
      expect(ApiService.insights.getProfilePerformance).toHaveBeenCalledTimes(1);
    });
  });

  test('renders insights after loading', async () => {
    const { findByText } = render(<InsightsTab />);
    
    await waitFor(() => {
      expect(ApiService.insights.getProfilePerformance).toHaveBeenCalledTimes(1);
      expect(ApiService.insights.getPhotoPerformance).toHaveBeenCalledTimes(1);
      expect(ApiService.insights.getMatchStats).toHaveBeenCalledTimes(1);
      expect(ApiService.insights.getActivityInsights).toHaveBeenCalledTimes(1);
    });
    
    await findByText('Your Insights');
    await findByText('Profile Views');
    await findByText('120');
    await findByText('Likes Received');
    await findByText('45');
    await findByText('Match Rate');
    await findByText('38%');
    await findByText('Profile Completeness');
    await findByText('85%');
  });

  test('handles API error state', async () => {
    ApiService.insights.getProfilePerformance.mockRejectedValueOnce(new Error('Network error'));
    
    const { getByText, findByText } = render(<InsightsTab />);
    
    await waitFor(() => {
      expect(ApiService.insights.getProfilePerformance).toHaveBeenCalledTimes(1);
    });
    
    await findByText('Something went wrong');
    expect(getByText('Failed to load insights. Please try again.')).toBeTruthy();
    
    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();
    
    ApiService.insights.getProfilePerformance.mockResolvedValueOnce({
      data: { views: 120, likes: 45 },
    });
    
    fireEvent.press(retryButton);
    
    await waitFor(() => {
      expect(ApiService.insights.getProfilePerformance).toHaveBeenCalledTimes(2);
    });
  });

  test('refreshes insights when refresh button is clicked', async () => {
    const { findByText, getByA11yRole } = render(<InsightsTab />);
    
    await findByText('Your Insights');
    
    const refreshButton = getByA11yRole('button', { name: 'refresh' });
    fireEvent.press(refreshButton);
    
    await waitFor(() => {
      expect(ApiService.insights.getProfilePerformance).toHaveBeenCalledTimes(2);
      expect(ApiService.insights.getPhotoPerformance).toHaveBeenCalledTimes(2);
      expect(ApiService.insights.getMatchStats).toHaveBeenCalledTimes(2);
      expect(ApiService.insights.getActivityInsights).toHaveBeenCalledTimes(2);
    });
  });
});
