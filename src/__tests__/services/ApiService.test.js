import ApiService from '../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

global.FormData = class {
  constructor() {
    this.append = jest.fn();
  }
};

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    axios.create.mockReturnValue(axios);
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return Promise.resolve('mock-token');
      if (key === 'refreshToken') return Promise.resolve('mock-refresh-token');
      return Promise.resolve(null);
    });
  });
  
  describe('Authentication', () => {
    test('login should call the correct endpoint with phone number', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      
      const phoneNumber = '+1234567890';
      await ApiService.auth.login(phoneNumber);
      
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith('/auth/login', { phoneNumber });
    });
    
    test('verifyOTP should call the correct endpoint with phone number and OTP', async () => {
      axios.post.mockResolvedValueOnce({ data: { token: 'test-token', refreshToken: 'test-refresh-token' } });
      
      const phoneNumber = '+1234567890';
      const otp = '123456';
      await ApiService.auth.verifyOTP(phoneNumber, otp);
      
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith('/auth/verify-otp', { phoneNumber, otp });
    });
    
    test('signup should call the correct endpoint with user data', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
      };
      await ApiService.auth.signup(userData);
      
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith('/auth/signup', userData);
    });
    
    test('logout should call the correct endpoint', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      
      await ApiService.auth.logout();
      
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith('/auth/logout');
    });
  });
  
  describe('User Profile', () => {
    test('getProfile should call the correct endpoint', async () => {
      axios.get.mockResolvedValueOnce({ data: { id: 1, name: 'Test User' } });
      
      await ApiService.user.getProfile();
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/user/profile');
    });
    
    test('updateProfile should call the correct endpoint with profile data', async () => {
      axios.put.mockResolvedValueOnce({ data: { success: true } });
      
      const profileData = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };
      await ApiService.user.updateProfile(profileData);
      
      expect(axios.put).toHaveBeenCalledTimes(1);
      expect(axios.put).toHaveBeenCalledWith('/user/profile', profileData);
    });
    
    test('updatePreferences should call the correct endpoint with preferences data', async () => {
      axios.put.mockResolvedValueOnce({ data: { success: true } });
      
      const preferences = {
        ageRange: [25, 35],
        distance: 50,
        showMe: 'women',
      };
      await ApiService.user.updatePreferences(preferences);
      
      expect(axios.put).toHaveBeenCalledTimes(1);
      expect(axios.put).toHaveBeenCalledWith('/user/preferences', preferences);
    });
    
    test('uploadPhoto should call the correct endpoint with form data', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      
      const photoData = { uri: 'file://photo.jpg', type: 'image/jpeg', name: 'photo.jpg' };
      await ApiService.user.uploadPhoto(photoData);
      
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post.mock.calls[0][0]).toBe('/user/photos');
      
      const formData = axios.post.mock.calls[0][1];
      expect(formData.append).toHaveBeenCalledWith('photo', photoData);
      
      const headers = axios.post.mock.calls[0][2].headers;
      expect(headers['Content-Type']).toBe('multipart/form-data');
    });
    
    test('deletePhoto should call the correct endpoint with photo ID', async () => {
      axios.delete.mockResolvedValueOnce({ data: { success: true } });
      
      await ApiService.user.deletePhoto(123);
      
      expect(axios.delete).toHaveBeenCalledTimes(1);
      expect(axios.delete).toHaveBeenCalledWith('/user/photos/123');
    });
  });
  
  describe('Matches', () => {
    test('getMatches should call the correct endpoint with pagination', async () => {
      axios.get.mockResolvedValueOnce({ data: { content: [] } });
      
      await ApiService.matches.getMatches(1, 20);
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/matches?page=1&size=20');
    });
    
    test('getMatch should call the correct endpoint with match ID', async () => {
      axios.get.mockResolvedValueOnce({ data: { id: 1, name: 'Match Name' } });
      
      await ApiService.matches.getMatch(1);
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/matches/1');
    });
    
    test('swipeLeft should call the correct endpoint with user ID', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      
      await ApiService.matches.swipeLeft(1);
      
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith('/swipes', { userId: 1, direction: 'LEFT' });
    });
    
    test('swipeRight should call the correct endpoint with user ID', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      
      await ApiService.matches.swipeRight(1);
      
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith('/swipes', { userId: 1, direction: 'RIGHT' });
    });
    
    test('superLike should call the correct endpoint with user ID', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      
      await ApiService.matches.superLike(1);
      
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith('/swipes', { userId: 1, direction: 'SUPER' });
    });
  });
  
  describe('Connections', () => {
    test('getMutualMatches should call the correct endpoint with pagination', async () => {
      axios.get.mockResolvedValueOnce({ data: { content: [] } });
      
      await ApiService.connections.getMutualMatches(1, 20);
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/connections/mutual?page=1&size=20');
    });
    
    test('getPendingLikes should call the correct endpoint with pagination', async () => {
      axios.get.mockResolvedValueOnce({ data: { content: [] } });
      
      await ApiService.connections.getPendingLikes(1, 20);
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/connections/pending?page=1&size=20');
    });
    
    test('getSavedProfiles should call the correct endpoint with pagination', async () => {
      axios.get.mockResolvedValueOnce({ data: { content: [] } });
      
      await ApiService.connections.getSavedProfiles(1, 20);
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/connections/saved?page=1&size=20');
    });
    
    test('acceptMatch should call the correct endpoint with user ID', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      
      await ApiService.connections.acceptMatch(1);
      
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith('/connections/accept/1');
    });
    
    test('rejectMatch should call the correct endpoint with user ID', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      
      await ApiService.connections.rejectMatch(1);
      
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith('/connections/reject/1');
    });
  });
  
  describe('Chat', () => {
    test('getConversations should call the correct endpoint with pagination', async () => {
      axios.get.mockResolvedValueOnce({ data: { content: [] } });
      
      await ApiService.chat.getConversations(1, 20);
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/chat/conversations?page=1&size=20');
    });
    
    test('getMessages should call the correct endpoint with user ID and pagination', async () => {
      axios.get.mockResolvedValueOnce({ data: { content: [] } });
      
      await ApiService.chat.getMessages(1, 1, 50);
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/chat/messages/1?page=1&size=50');
    });
    
    test('sendMessage should call the correct endpoint with message data', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      
      await ApiService.chat.sendMessage(1, 'Hello', 'TEXT');
      
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith('/chat/messages', { 
        receiverId: 1, 
        content: 'Hello', 
        type: 'TEXT' 
      });
    });
    
    test('markAsRead should call the correct endpoint with sender ID', async () => {
      axios.put.mockResolvedValueOnce({ data: { success: true } });
      
      await ApiService.chat.markAsRead(1);
      
      expect(axios.put).toHaveBeenCalledTimes(1);
      expect(axios.put).toHaveBeenCalledWith('/chat/messages/read/1');
    });
  });
  
  describe('Insights', () => {
    test('getProfilePerformance should call the correct endpoint with period', async () => {
      axios.get.mockResolvedValueOnce({ data: { views: 100, likes: 50 } });
      
      await ApiService.insights.getProfilePerformance('MONTH');
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/insights/profile-performance?period=MONTH');
    });
    
    test('getPhotoPerformance should call the correct endpoint', async () => {
      axios.get.mockResolvedValueOnce({ data: { photos: [] } });
      
      await ApiService.insights.getPhotoPerformance();
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/insights/photo-performance');
    });
    
    test('getMatchStats should call the correct endpoint with period', async () => {
      axios.get.mockResolvedValueOnce({ data: { matches: 10, likes: 20 } });
      
      await ApiService.insights.getMatchStats('WEEK');
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/insights/match-stats?period=WEEK');
    });
    
    test('getActivityInsights should call the correct endpoint', async () => {
      axios.get.mockResolvedValueOnce({ data: { activity: [] } });
      
      await ApiService.insights.getActivityInsights();
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('/insights/activity');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      const mockError = new Error('Network Error');
      axios.get.mockRejectedValueOnce(mockError);
      
      await expect(ApiService.user.getProfile()).rejects.toThrow('Network Error');
    });
    
    test('should handle server errors', async () => {
      const mockError = { 
        response: { 
          status: 500, 
          data: { message: 'Internal Server Error' } 
        } 
      };
      axios.get.mockRejectedValueOnce(mockError);
      
      try {
        await ApiService.user.getProfile();
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.message).toBe('Internal Server Error');
      }
    });
  });
});
