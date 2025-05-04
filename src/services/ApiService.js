import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.soulnest.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          const { token } = response.data;
          await AsyncStorage.setItem('token', token);
          
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        
      }
    }
    
    return Promise.reject(error);
  }
);

const ApiService = {
  auth: {
    login: async (phoneNumber) => {
      return apiClient.post('/auth/login', { phoneNumber });
    },
    verifyOTP: async (phoneNumber, otp) => {
      return apiClient.post('/auth/verify-otp', { phoneNumber, otp });
    },
    signup: async (userData) => {
      return apiClient.post('/auth/signup', userData);
    },
    logout: async () => {
      return apiClient.post('/auth/logout');
    },
  },
  
  user: {
    getProfile: async () => {
      return apiClient.get('/user/profile');
    },
    updateProfile: async (profileData) => {
      return apiClient.put('/user/profile', profileData);
    },
    updatePreferences: async (preferences) => {
      return apiClient.put('/user/preferences', preferences);
    },
    uploadPhoto: async (photoData) => {
      const formData = new FormData();
      formData.append('photo', photoData);
      
      return apiClient.post('/user/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    deletePhoto: async (photoId) => {
      return apiClient.delete(`/user/photos/${photoId}`);
    },
  },
  
  matches: {
    getMatches: async (page = 0, size = 10) => {
      return apiClient.get(`/matches?page=${page}&size=${size}`);
    },
    getMatch: async (matchId) => {
      return apiClient.get(`/matches/${matchId}`);
    },
    swipeLeft: async (userId) => {
      return apiClient.post('/swipes', { userId, direction: 'LEFT' });
    },
    swipeRight: async (userId) => {
      return apiClient.post('/swipes', { userId, direction: 'RIGHT' });
    },
    superLike: async (userId) => {
      return apiClient.post('/swipes', { userId, direction: 'SUPER' });
    },
  },
  
  connections: {
    getMutualMatches: async (page = 0, size = 10) => {
      return apiClient.get(`/connections/mutual?page=${page}&size=${size}`);
    },
    getPendingLikes: async (page = 0, size = 10) => {
      return apiClient.get(`/connections/pending?page=${page}&size=${size}`);
    },
    getSavedProfiles: async (page = 0, size = 10) => {
      return apiClient.get(`/connections/saved?page=${page}&size=${size}`);
    },
    acceptMatch: async (userId) => {
      return apiClient.post(`/connections/accept/${userId}`);
    },
    rejectMatch: async (userId) => {
      return apiClient.post(`/connections/reject/${userId}`);
    },
    saveProfile: async (userId) => {
      return apiClient.post(`/connections/save/${userId}`);
    },
    unsaveProfile: async (userId) => {
      return apiClient.delete(`/connections/save/${userId}`);
    },
  },
  
  chat: {
    getConversations: async (page = 0, size = 20) => {
      return apiClient.get(`/chat/conversations?page=${page}&size=${size}`);
    },
    getMessages: async (userId, page = 0, size = 50) => {
      return apiClient.get(`/chat/messages/${userId}?page=${page}&size=${size}`);
    },
    sendMessage: async (receiverId, content, type = 'TEXT') => {
      return apiClient.post('/chat/messages', { receiverId, content, type });
    },
    markAsRead: async (senderId) => {
      return apiClient.put(`/chat/messages/read/${senderId}`);
    },
    uploadImage: async (receiverId, imageData) => {
      const formData = new FormData();
      formData.append('image', imageData);
      formData.append('receiverId', receiverId);
      
      return apiClient.post('/chat/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },
  
  insights: {
    getProfilePerformance: async (period = 'WEEK') => {
      return apiClient.get(`/insights/profile-performance?period=${period}`);
    },
    getPhotoPerformance: async () => {
      return apiClient.get('/insights/photo-performance');
    },
    getMatchStats: async (period = 'MONTH') => {
      return apiClient.get(`/insights/match-stats?period=${period}`);
    },
    getActivityInsights: async () => {
      return apiClient.get('/insights/activity');
    },
  },
};

export default ApiService;
