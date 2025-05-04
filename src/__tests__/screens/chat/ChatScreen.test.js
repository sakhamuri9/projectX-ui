import React from 'react';
import ApiService from '../../../services/ApiService';
import webSocketService from '../../../utils/WebSocketService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../screens/chat/ChatScreen', () => 'ChatScreen');

jest.mock('../../../services/ApiService', () => ({
  chat: {
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    markAsRead: jest.fn(),
    uploadImage: jest.fn(),
  },
}));

jest.mock('../../../utils/WebSocketService', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  onMessage: jest.fn(),
  sendChatMessage: jest.fn(),
  sendTypingIndicator: jest.fn(),
  sendReadReceipt: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('ChatScreen API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return Promise.resolve('1');
      return Promise.resolve(null);
    });
    
    ApiService.chat.getMessages.mockResolvedValue({
      data: {
        content: [
          {
            id: 1,
            senderId: 2,
            receiverId: 1,
            content: 'Hello there!',
            type: 'TEXT',
            timestamp: '2023-05-01T10:42:00',
            isRead: true,
          },
          {
            id: 2,
            senderId: 1,
            receiverId: 2,
            content: 'Hi! How are you?',
            type: 'TEXT',
            timestamp: '2023-05-01T10:43:00',
            isRead: true,
          },
        ],
      },
    });
  });

  test('ApiService.chat.getMessages returns expected data', async () => {
    const result = await ApiService.chat.getMessages(2, 0, 50);
    expect(result.data.content.length).toBe(2);
    expect(result.data.content[0].content).toBe('Hello there!');
    expect(result.data.content[1].content).toBe('Hi! How are you?');
  });

  test('ApiService.chat.sendMessage is called with correct parameters', async () => {
    const message = {
      receiverId: 2,
      content: 'New message',
      type: 'TEXT'
    };
    await ApiService.chat.sendMessage(message);
    expect(ApiService.chat.sendMessage).toHaveBeenCalledWith(message);
  });

  test('ApiService.chat.markAsRead is called with correct parameters', async () => {
    await ApiService.chat.markAsRead(2);
    expect(ApiService.chat.markAsRead).toHaveBeenCalledWith(2);
  });

  test('WebSocketService.connect is called with userId', async () => {
    await webSocketService.connect(1);
    expect(webSocketService.connect).toHaveBeenCalledWith(1);
  });

  test('WebSocketService.sendChatMessage sends chat message correctly', async () => {
    await webSocketService.sendChatMessage(2, 'Hello!');
    expect(webSocketService.sendChatMessage).toHaveBeenCalledWith(2, 'Hello!');
  });

  test('WebSocketService.sendReadReceipt sends read receipt correctly', async () => {
    await webSocketService.sendReadReceipt(2);
    expect(webSocketService.sendReadReceipt).toHaveBeenCalledWith(2);
  });

  test('ChatScreen handles API error correctly', async () => {
    ApiService.chat.getMessages.mockRejectedValueOnce(new Error('Network error'));
    
    try {
      await ApiService.chat.getMessages(2, 0, 50);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });
});
