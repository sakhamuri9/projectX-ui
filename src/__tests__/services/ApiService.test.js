import ApiService from '../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

beforeEach(() => {
  fetch.resetMocks();
  jest.clearAllMocks();
});

describe('ApiService', () => {
  describe('Authentication', () => {
    test('login should call the correct endpoint with phone number', async () => {
      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      
      const phoneNumber = '+1234567890';
      await ApiService.auth.login(phoneNumber);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/auth/login');
      expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ phoneNumber });
    });
    
    test('verifyOTP should call the correct endpoint with phone number and OTP', async () => {
      fetch.mockResponseOnce(JSON.stringify({ token: 'test-token', refreshToken: 'test-refresh-token' }));
      
      const phoneNumber = '+1234567890';
      const otp = '123456';
      await ApiService.auth.verifyOTP(phoneNumber, otp);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/auth/verify-otp');
      expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ phoneNumber, otp });
    });
    
    test('signup should call the correct endpoint with user data', async () => {
      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
      };
      await ApiService.auth.signup(userData);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/auth/signup');
      expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(userData);
    });
    
    test('logout should call the correct endpoint', async () => {
      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      
      await ApiService.auth.logout();
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/auth/logout');
    });
  });
  
  describe('User Profile', () => {
    test('getProfile should call the correct endpoint', async () => {
      fetch.mockResponseOnce(JSON.stringify({ id: 1, name: 'Test User' }));
      
      await ApiService.user.getProfile();
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/user/profile');
    });
    
    test('updateProfile should call the correct endpoint with profile data', async () => {
      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      
      const profileData = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };
      await ApiService.user.updateProfile(profileData);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/user/profile');
      expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(profileData);
    });
    
    test('updatePreferences should call the correct endpoint with preferences data', async () => {
      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      
      const preferences = {
        ageRange: [25, 35],
        distance: 50,
        showMe: 'women',
      };
      await ApiService.user.updatePreferences(preferences);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/user/preferences');
      expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(preferences);
    });
  });
  
  describe('Matches', () => {
    test('getMatches should call the correct endpoint with pagination', async () => {
      fetch.mockResponseOnce(JSON.stringify({ content: [] }));
      
      await ApiService.matches.getMatches(1, 20);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/matches?page=1&size=20');
    });
    
    test('getMatch should call the correct endpoint with match ID', async () => {
      fetch.mockResponseOnce(JSON.stringify({ id: 1, name: 'Match Name' }));
      
      await ApiService.matches.getMatch(1);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/matches/1');
    });
    
    test('swipeLeft should call the correct endpoint with user ID', async () => {
      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      
      await ApiService.matches.swipeLeft(1);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/swipes');
      expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ userId: 1, direction: 'LEFT' });
    });
    
    test('swipeRight should call the correct endpoint with user ID', async () => {
      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      
      await ApiService.matches.swipeRight(1);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/swipes');
      expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ userId: 1, direction: 'RIGHT' });
    });
  });
  
  describe('Connections', () => {
    test('getMutualMatches should call the correct endpoint with pagination', async () => {
      fetch.mockResponseOnce(JSON.stringify({ content: [] }));
      
      await ApiService.connections.getMutualMatches(1, 20);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/connections/mutual?page=1&size=20');
    });
    
    test('getPendingLikes should call the correct endpoint with pagination', async () => {
      fetch.mockResponseOnce(JSON.stringify({ content: [] }));
      
      await ApiService.connections.getPendingLikes(1, 20);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/connections/pending?page=1&size=20');
    });
    
    test('acceptMatch should call the correct endpoint with user ID', async () => {
      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      
      await ApiService.connections.acceptMatch(1);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/connections/accept/1');
    });
  });
  
  describe('Chat', () => {
    test('getConversations should call the correct endpoint with pagination', async () => {
      fetch.mockResponseOnce(JSON.stringify({ content: [] }));
      
      await ApiService.chat.getConversations(1, 20);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/chat/conversations?page=1&size=20');
    });
    
    test('getMessages should call the correct endpoint with user ID and pagination', async () => {
      fetch.mockResponseOnce(JSON.stringify({ content: [] }));
      
      await ApiService.chat.getMessages(1, 1, 50);
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/chat/messages/1?page=1&size=50');
    });
    
    test('sendMessage should call the correct endpoint with message data', async () => {
      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      
      await ApiService.chat.sendMessage(1, 'Hello', 'TEXT');
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/chat/messages');
      expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ 
        receiverId: 1, 
        content: 'Hello', 
        type: 'TEXT' 
      });
    });
  });
  
  describe('Insights', () => {
    test('getProfilePerformance should call the correct endpoint with period', async () => {
      fetch.mockResponseOnce(JSON.stringify({ views: 100, likes: 50 }));
      
      await ApiService.insights.getProfilePerformance('MONTH');
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/insights/profile-performance?period=MONTH');
    });
    
    test('getPhotoPerformance should call the correct endpoint', async () => {
      fetch.mockResponseOnce(JSON.stringify({ photos: [] }));
      
      await ApiService.insights.getPhotoPerformance();
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain('/insights/photo-performance');
    });
  });
  
  describe('Authentication Token Handling', () => {
    test('should add authorization header when token is available', async () => {
      AsyncStorage.getItem.mockImplementationOnce(() => Promise.resolve('test-token'));
      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      
      await ApiService.user.getProfile();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
      expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer test-token');
    });
    
    test('should not add authorization header when token is not available', async () => {
      AsyncStorage.getItem.mockImplementationOnce(() => Promise.resolve(null));
      fetch.mockResponseOnce(JSON.stringify({ success: true }));
      
      await ApiService.user.getProfile();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
      expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
    });
  });
});
