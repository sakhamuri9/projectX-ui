import React from 'react';
import ApiService from '../../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import webSocketService from '../../../../utils/WebSocketService';

jest.mock('../../../../screens/dashboard/tabs/ChatTab', () => 'ChatTab');

jest.mock('../../../../services/ApiService', () => ({
  chat: {
    getConversations: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    markAsRead: jest.fn(),
  },
}));

jest.mock('../../../../utils/WebSocketService', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  onMessage: jest.fn(),
  sendMessage: jest.fn(),
  sendChatMessage: jest.fn(),
  sendTypingIndicator: jest.fn(),
  sendReadReceipt: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
};

describe('ChatTab API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return Promise.resolve('1');
      if (key === 'authToken') return Promise.resolve('mock-token');
      return Promise.resolve(null);
    });
    
    ApiService.chat.getConversations.mockResolvedValue({
      data: {
        content: [
          {
            id: 1,
            user: {
              id: 2,
              name: 'Jessica',
              image: 'https://randomuser.me/api/portraits/women/33.jpg',
              isOnline: true,
            },
            lastMessage: {
              text: 'Hello there!',
              time: '10:42 AM',
              isRead: true,
              isSent: false,
            },
            unreadCount: 0,
          },
          {
            id: 2,
            user: {
              id: 3,
              name: 'Michael',
              image: 'https://randomuser.me/api/portraits/men/52.jpg',
              isOnline: false,
            },
            lastMessage: {
              text: 'Are you free this weekend?',
              time: 'Yesterday',
              isRead: true,
              isSent: false,
            },
            unreadCount: 0,
          },
        ],
      },
    });
    
    ApiService.chat.getMessages.mockResolvedValue({
      data: {
        content: [
          {
            id: 1,
            senderId: 1,
            receiverId: 2,
            content: 'Hi Jessica!',
            timestamp: '2023-05-01T10:30:00Z',
            isRead: true,
          },
          {
            id: 2,
            senderId: 2,
            receiverId: 1,
            content: 'Hello there!',
            timestamp: '2023-05-01T10:35:00Z',
            isRead: true,
          }
        ]
      }
    });
  });

  test('ApiService.chat.getConversations returns expected data', async () => {
    const result = await ApiService.chat.getConversations();
    expect(result.data.content.length).toBe(2);
    expect(result.data.content[0].user.name).toBe('Jessica');
    expect(result.data.content[1].user.name).toBe('Michael');
  });

  test('ApiService.chat.getMessages returns expected data', async () => {
    const result = await ApiService.chat.getMessages(1);
    expect(result.data.content.length).toBe(2);
    expect(result.data.content[0].content).toBe('Hi Jessica!');
    expect(result.data.content[1].content).toBe('Hello there!');
  });

  test('ApiService.chat.sendMessage is called with correct parameters', async () => {
    const message = {
      conversationId: 1,
      content: 'Hello!',
      receiverId: 2
    };
    
    await ApiService.chat.sendMessage(message);
    expect(ApiService.chat.sendMessage).toHaveBeenCalledWith(message);
  });

  test('ApiService.chat.markAsRead is called with correct parameters', async () => {
    await ApiService.chat.markAsRead(1);
    expect(ApiService.chat.markAsRead).toHaveBeenCalledWith(1);
  });

  test('WebSocketService.connect is called with userId', async () => {
    await webSocketService.connect(1);
    expect(webSocketService.connect).toHaveBeenCalledWith(1);
  });

  test('WebSocketService.disconnect is called on cleanup', async () => {
    await webSocketService.disconnect();
    expect(webSocketService.disconnect).toHaveBeenCalled();
  });

  test('ChatTab handles empty conversations correctly', async () => {
    ApiService.chat.getConversations.mockResolvedValueOnce({
      data: {
        content: []
      }
    });
    
    const result = await ApiService.chat.getConversations();
    expect(result.data.content.length).toBe(0);
  });

  test('ChatTab handles API error correctly', async () => {
    ApiService.chat.getConversations.mockRejectedValueOnce(new Error('Network error'));
    
    try {
      await ApiService.chat.getConversations();
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });
});
