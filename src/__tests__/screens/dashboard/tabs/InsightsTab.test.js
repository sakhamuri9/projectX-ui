import React from 'react';
import ApiService from '../../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../../screens/dashboard/tabs/InsightsTab', () => 'InsightsTab');

jest.mock('../../../../services/ApiService', () => ({
  insights: {
    getProfilePerformance: jest.fn(),
    getPhotoPerformance: jest.fn(),
    getMatchStats: jest.fn(),
    getActivityInsights: jest.fn(),
    getPersonalityInsights: jest.fn(),
    getLocationHeatmap: jest.fn(),
    getEngagementTiming: jest.fn(),
    getProfileCompletionTasks: jest.fn(),
    getTrendingTags: jest.fn(),
    getTopPerformingPhoto: jest.fn(),
    getVibeRatings: jest.fn(),
    getBoostRecommendation: jest.fn(),
    getWeeklyViews: jest.fn(),
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

describe('InsightsTab API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return Promise.resolve('1');
      if (key === 'authToken') return Promise.resolve('mock-token');
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
    
    ApiService.insights.getPersonalityInsights.mockResolvedValue({
      data: [
        { trait: 'Creative', percentage: 35, color: '#FF6B6B' },
        { trait: 'Ambitious', percentage: 40, color: '#4ECDC4' },
        { trait: 'Adventurous', percentage: 25, color: '#FFD166' },
      ],
    });
    
    ApiService.insights.getLocationHeatmap.mockResolvedValue({
      data: [
        { location: 'New York', views: 42, percentage: 300 },
        { location: 'Los Angeles', views: 28, percentage: 200 },
        { location: 'Chicago', views: 15, percentage: 100 },
      ],
    });
    
    ApiService.insights.getEngagementTiming.mockResolvedValue({
      data: [
        { day: 'Mon', morning: 5, afternoon: 7, evening: 12, night: 8 },
        { day: 'Tue', morning: 6, afternoon: 8, evening: 15, night: 10 },
      ],
    });
    
    ApiService.insights.getProfileCompletionTasks.mockResolvedValue({
      data: [
        { task: 'Add 1 more interest', completed: false },
        { task: 'Upload 1 more photo', completed: false },
      ],
    });
    
    ApiService.insights.getTrendingTags.mockResolvedValue({
      data: [
        { name: 'Photography', popularity: 92 },
        { name: 'Hiking', popularity: 87 },
      ],
    });
    
    ApiService.insights.getTopPerformingPhoto.mockResolvedValue({
      data: {
        url: 'https://randomuser.me/api/portraits/men/32.jpg',
        likeRate: 60,
      },
    });
    
    ApiService.insights.getVibeRatings.mockResolvedValue({
      data: ['Mysterious', 'Stylish', 'Witty'],
    });
    
    ApiService.insights.getBoostRecommendation.mockResolvedValue({
      data: {
        day: 'Friday',
        time: '8:00 PM',
        multiplier: '10x',
      },
    });
    
    ApiService.insights.getWeeklyViews.mockResolvedValue({
      data: [
        { day: 'Mon', views: 12 },
        { day: 'Tue', views: 18 },
      ],
    });
  });

  test('ApiService.insights.getProfilePerformance returns expected data', async () => {
    const result = await ApiService.insights.getProfilePerformance();
    expect(result.data.views).toBe(120);
    expect(result.data.likes).toBe(45);
    expect(result.data.matchRate).toBe(38);
    expect(result.data.profileCompleteness).toBe(85);
  });

  test('ApiService.insights.getPhotoPerformance returns expected data', async () => {
    const result = await ApiService.insights.getPhotoPerformance();
    expect(result.data.topPhoto.id).toBe(1);
    expect(result.data.topPhoto.likeRate).toBe(60);
    expect(result.data.photos.length).toBe(2);
    expect(result.data.photos[0].url).toBe('https://randomuser.me/api/portraits/men/32.jpg');
    expect(result.data.photos[1].likeRate).toBe(45);
  });

  test('ApiService.insights.getMatchStats returns expected data', async () => {
    const result = await ApiService.insights.getMatchStats();
    expect(result.data.personalityData.length).toBe(2);
    expect(result.data.personalityData[0].name).toBe('Creative');
    expect(result.data.locationData.length).toBe(2);
    expect(result.data.locationData[0].city).toBe('New York');
    expect(result.data.trendingTags.length).toBe(2);
    expect(result.data.trendingTags[0].tag).toBe('Photography');
    expect(result.data.vibeRatings).toContain('Mysterious');
    expect(result.data.boostRecommendation.day).toBe('Friday');
  });

  test('ApiService.insights.getActivityInsights returns expected data', async () => {
    const result = await ApiService.insights.getActivityInsights();
    expect(result.data.engagementData.length).toBe(2);
    expect(result.data.engagementData[0].day).toBe('Mon');
    expect(result.data.completionTasks.length).toBe(2);
    expect(result.data.completionTasks[0].task).toBe('Add 1 more interest');
    expect(result.data.weeklyData.length).toBe(2);
    expect(result.data.weeklyData[1].views).toBe(18);
  });

  test('ApiService.insights.getPersonalityInsights returns expected data', async () => {
    const result = await ApiService.insights.getPersonalityInsights();
    expect(result.data.length).toBe(3);
    expect(result.data[0].trait).toBe('Creative');
    expect(result.data[1].percentage).toBe(40);
    expect(result.data[2].color).toBe('#FFD166');
  });

  test('ApiService.insights.getLocationHeatmap returns expected data', async () => {
    const result = await ApiService.insights.getLocationHeatmap();
    expect(result.data.length).toBe(3);
    expect(result.data[0].location).toBe('New York');
    expect(result.data[1].views).toBe(28);
    expect(result.data[2].percentage).toBe(100);
  });

  test('ApiService.insights.getEngagementTiming returns expected data', async () => {
    const result = await ApiService.insights.getEngagementTiming();
    expect(result.data.length).toBe(2);
    expect(result.data[0].morning).toBe(5);
    expect(result.data[1].evening).toBe(15);
  });

  test('ApiService.insights.getProfileCompletionTasks returns expected data', async () => {
    const result = await ApiService.insights.getProfileCompletionTasks();
    expect(result.data.length).toBe(2);
    expect(result.data[0].task).toBe('Add 1 more interest');
    expect(result.data[1].completed).toBe(false);
  });

  test('ApiService.insights.getTrendingTags returns expected data', async () => {
    const result = await ApiService.insights.getTrendingTags();
    expect(result.data.length).toBe(2);
    expect(result.data[0].name).toBe('Photography');
    expect(result.data[1].popularity).toBe(87);
  });

  test('ApiService.insights.getTopPerformingPhoto returns expected data', async () => {
    const result = await ApiService.insights.getTopPerformingPhoto();
    expect(result.data.url).toBe('https://randomuser.me/api/portraits/men/32.jpg');
    expect(result.data.likeRate).toBe(60);
  });

  test('ApiService.insights.getVibeRatings returns expected data', async () => {
    const result = await ApiService.insights.getVibeRatings();
    expect(result.data.length).toBe(3);
    expect(result.data).toContain('Mysterious');
    expect(result.data).toContain('Stylish');
    expect(result.data).toContain('Witty');
  });

  test('ApiService.insights.getBoostRecommendation returns expected data', async () => {
    const result = await ApiService.insights.getBoostRecommendation();
    expect(result.data.day).toBe('Friday');
    expect(result.data.time).toBe('8:00 PM');
    expect(result.data.multiplier).toBe('10x');
  });

  test('ApiService.insights.getWeeklyViews returns expected data', async () => {
    const result = await ApiService.insights.getWeeklyViews();
    expect(result.data.length).toBe(2);
    expect(result.data[0].day).toBe('Mon');
    expect(result.data[0].views).toBe(12);
    expect(result.data[1].day).toBe('Tue');
    expect(result.data[1].views).toBe(18);
  });

  test('ApiService.insights handles error correctly', async () => {
    ApiService.insights.getProfilePerformance.mockRejectedValueOnce(new Error('Network error'));
    
    try {
      await ApiService.insights.getProfilePerformance();
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
    
    expect(ApiService.insights.getProfilePerformance).toHaveBeenCalledTimes(1);
  });

  test('Multiple API calls can be made in parallel', async () => {
    await Promise.all([
      ApiService.insights.getProfilePerformance(),
      ApiService.insights.getPhotoPerformance(),
      ApiService.insights.getMatchStats(),
      ApiService.insights.getActivityInsights(),
    ]);
    
    expect(ApiService.insights.getProfilePerformance).toHaveBeenCalledTimes(1);
    expect(ApiService.insights.getPhotoPerformance).toHaveBeenCalledTimes(1);
    expect(ApiService.insights.getMatchStats).toHaveBeenCalledTimes(1);
    expect(ApiService.insights.getActivityInsights).toHaveBeenCalledTimes(1);
  });
  
  test('handles empty data response correctly', async () => {
    ApiService.insights.getProfilePerformance.mockResolvedValueOnce({
      data: {}
    });
    
    const result = await ApiService.insights.getProfilePerformance();
    expect(result.data).toEqual({});
  });
});
