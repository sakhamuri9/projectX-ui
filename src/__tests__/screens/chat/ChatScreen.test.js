import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ChatScreen from '../../../screens/chat/ChatScreen';
import ApiService from '../../../services/ApiService';
import webSocketService from '../../../utils/WebSocketService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  send: jest.fn(),
}));

const mockRoute = {
  params: {
    conversation: {
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
  },
};

const mockNavigation = {
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

describe('ChatScreen Component', () => {
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
    
    ApiService.chat.sendMessage.mockResolvedValue({
      data: {
        id: 3,
        senderId: 1,
        receiverId: 2,
        content: 'New message',
        type: 'TEXT',
        timestamp: '2023-05-01T10:45:00',
        isRead: false,
      },
    });
  });

  test('renders loading state initially', async () => {
    const { getByText, queryByText } = render(
      <ChatScreen route={mockRoute} navigation={mockNavigation} />
    );
    
    expect(getByText('Loading messages...')).toBeTruthy();
    expect(queryByText('Hello there!')).toBeNull();
    
    await waitFor(() => {
      expect(ApiService.chat.getMessages).toHaveBeenCalledTimes(1);
      expect(ApiService.chat.getMessages).toHaveBeenCalledWith(2, 0, 50);
    });
  });

  test('renders messages after loading', async () => {
    const { findByText } = render(
      <ChatScreen route={mockRoute} navigation={mockNavigation} />
    );
    
    await waitFor(() => {
      expect(ApiService.chat.getMessages).toHaveBeenCalledTimes(1);
    });
    
    await findByText('Hello there!');
    await findByText('Hi! How are you?');
  });

  test('handles API error state', async () => {
    ApiService.chat.getMessages.mockRejectedValueOnce(new Error('Network error'));
    
    const { getByText, findByText } = render(
      <ChatScreen route={mockRoute} navigation={mockNavigation} />
    );
    
    await waitFor(() => {
      expect(ApiService.chat.getMessages).toHaveBeenCalledTimes(1);
    });
    
    await findByText('Something went wrong');
    expect(getByText('Failed to load messages. Please try again.')).toBeTruthy();
    
    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();
    
    ApiService.chat.getMessages.mockResolvedValueOnce({
      data: { content: [] },
    });
    
    fireEvent.press(retryButton);
    
    await waitFor(() => {
      expect(ApiService.chat.getMessages).toHaveBeenCalledTimes(2);
    });
  });

  test('handles empty messages state', async () => {
    ApiService.chat.getMessages.mockResolvedValueOnce({
      data: { content: [] },
    });
    
    const { getByText, findByText } = render(
      <ChatScreen route={mockRoute} navigation={mockNavigation} />
    );
    
    await waitFor(() => {
      expect(ApiService.chat.getMessages).toHaveBeenCalledTimes(1);
    });
    
    await findByText('No messages yet');
    expect(getByText('Start the conversation with Jessica')).toBeTruthy();
  });

  test('initializes WebSocket connection on mount', async () => {
    render(<ChatScreen route={mockRoute} navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userId');
      expect(webSocketService.onMessage).toHaveBeenCalledWith('message', expect.any(Function));
    });
  });

  test('disconnects WebSocket on unmount', async () => {
    const { unmount } = render(<ChatScreen route={mockRoute} navigation={mockNavigation} />);
    
    unmount();
    
    expect(webSocketService.disconnect).toHaveBeenCalledTimes(1);
  });

  test('sends message when send button is pressed', async () => {
    const { getByPlaceholderText, getByA11yRole } = render(
      <ChatScreen route={mockRoute} navigation={mockNavigation} />
    );
    
    await waitFor(() => {
      expect(ApiService.chat.getMessages).toHaveBeenCalledTimes(1);
    });
    
    const inputField = getByPlaceholderText('Type a message...');
    const sendButton = getByA11yRole('button', { name: 'send' });
    
    fireEvent.changeText(inputField, 'New message');
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(ApiService.chat.sendMessage).toHaveBeenCalledWith(2, 'New message', 'TEXT');
    });
    
    expect(webSocketService.send).toHaveBeenCalledWith({
      receiverId: 2,
      content: 'New message',
      type: 'TEXT',
    });
  });

  test('handles new message from WebSocket', async () => {
    render(<ChatScreen route={mockRoute} navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(webSocketService.onMessage).toHaveBeenCalledWith('message', expect.any(Function));
    });
    
    const messageHandler = webSocketService.onMessage.mock.calls[0][1];
    
    act(() => {
      messageHandler({
        id: 4,
        senderId: 2,
        receiverId: 1,
        content: 'New message from WebSocket',
        type: 'TEXT',
        timestamp: '2023-05-01T10:50:00',
      });
    });
    
    await waitFor(() => {
      expect(ApiService.chat.markAsRead).toHaveBeenCalledWith(2);
    });
  });
});
