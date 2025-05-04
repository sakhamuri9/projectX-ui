import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ChatTab from '../../../../screens/dashboard/tabs/ChatTab';
import ApiService from '../../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import webSocketService from '../../../../utils/WebSocketService';

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
  send: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
};

describe('ChatTab Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return Promise.resolve('1');
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
  });

  test('renders loading state initially', async () => {
    const { getByText, queryByText } = render(<ChatTab navigation={mockNavigation} />);
    
    expect(getByText('Loading conversations...')).toBeTruthy();
    expect(queryByText('Messages')).toBeNull();
    
    await waitFor(() => {
      expect(ApiService.chat.getConversations).toHaveBeenCalledTimes(1);
    });
  });

  test('renders conversations after loading', async () => {
    const { getByText, queryByText, findByText } = render(<ChatTab navigation={mockNavigation} />);
    
    expect(queryByText('Loading conversations...')).toBeTruthy();
    
    await waitFor(() => {
      expect(ApiService.chat.getConversations).toHaveBeenCalledTimes(1);
    });
    
    await findByText('Jessica');
    await findByText('Michael');
    await findByText('Hello there!');
    await findByText('Are you free this weekend?');
    
    expect(getByText('Messages')).toBeTruthy();
  });

  test('handles API error state', async () => {
    ApiService.chat.getConversations.mockRejectedValueOnce(new Error('Network error'));
    
    const { getByText, findByText } = render(<ChatTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(ApiService.chat.getConversations).toHaveBeenCalledTimes(1);
    });
    
    await findByText('Something went wrong');
    expect(getByText('Failed to load conversations. Please try again.')).toBeTruthy();
    
    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();
    
    ApiService.chat.getConversations.mockResolvedValueOnce({
      data: { content: [] },
    });
    
    fireEvent.press(retryButton);
    
    await waitFor(() => {
      expect(ApiService.chat.getConversations).toHaveBeenCalledTimes(2);
    });
  });

  test('handles empty conversations state', async () => {
    ApiService.chat.getConversations.mockResolvedValueOnce({
      data: { content: [] },
    });
    
    const { getByText, findByText } = render(<ChatTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(ApiService.chat.getConversations).toHaveBeenCalledTimes(1);
    });
    
    await findByText('No messages yet');
    expect(getByText('Start matching with people to begin conversations')).toBeTruthy();
    
    const findMatchesButton = getByText('Find Matches');
    expect(findMatchesButton).toBeTruthy();
    
    fireEvent.press(findMatchesButton);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('MatchesTab');
  });

  test('initializes WebSocket connection on mount', async () => {
    render(<ChatTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userId');
      expect(webSocketService.connect).toHaveBeenCalledWith(1);
      expect(webSocketService.onMessage).toHaveBeenCalledWith('message', expect.any(Function));
    });
  });

  test('disconnects WebSocket on unmount', async () => {
    const { unmount } = render(<ChatTab navigation={mockNavigation} />);
    
    unmount();
    
    expect(webSocketService.disconnect).toHaveBeenCalledTimes(1);
  });

  test('navigates to chat screen when conversation is clicked', async () => {
    const { findByText, getAllByA11yRole } = render(<ChatTab navigation={mockNavigation} />);
    
    await findByText('Jessica');
    
    const touchables = getAllByA11yRole('button');
    
    fireEvent.press(touchables[2]); // Index may vary based on component structure
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ChatScreen', expect.objectContaining({
      conversation: expect.objectContaining({
        id: 1,
        user: expect.objectContaining({
          name: 'Jessica',
        }),
      }),
    }));
  });

  test('handles new message from WebSocket', async () => {
    render(<ChatTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(webSocketService.onMessage).toHaveBeenCalledWith('message', expect.any(Function));
    });
    
    const messageHandler = webSocketService.onMessage.mock.calls[0][1];
    
    act(() => {
      messageHandler({
        senderId: 2, // From Jessica
        content: 'New message',
      });
    });
    
    await waitFor(() => {
      expect(ApiService.chat.getConversations).toHaveBeenCalledTimes(2);
    });
  });
});
