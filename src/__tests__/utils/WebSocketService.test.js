import webSocketService from '../../utils/WebSocketService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('mock-token')),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('sockjs-client');
jest.mock('@stomp/stompjs');

describe('WebSocketService', () => {
  let mockClient;
  let mockSubscription;
  let mockSockJS;
  let onConnectCallback;
  let onStompErrorCallback;
  let onWebSocketCloseCallback;
  let onWebSocketErrorCallback;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockSubscription = {
      unsubscribe: jest.fn(),
    };
    
    mockClient = {
      activate: jest.fn(),
      deactivate: jest.fn(),
      subscribe: jest.fn().mockReturnValue(mockSubscription),
      publish: jest.fn(),
    };
    
    mockSockJS = {
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    
    Client.mockImplementation((config) => {
      onConnectCallback = config.onConnect;
      onStompErrorCallback = config.onStompError;
      onWebSocketCloseCallback = config.onWebSocketClose;
      onWebSocketErrorCallback = config.onWebSocketError;
      return mockClient;
    });
    
    SockJS.mockImplementation(() => mockSockJS);
    
    jest.useRealTimers();
  });
  
  afterEach(() => {
    webSocketService.disconnect();
    
    jest.restoreAllMocks();
    
    jest.useRealTimers();
  });
  
  test('connect should create a STOMP client with the correct configuration', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    expect(Client).toHaveBeenCalledWith(expect.objectContaining({
      connectHeaders: {
        'X-Auth-Token': 'mock-token',
      },
      reconnectDelay: expect.any(Number),
      heartbeatIncoming: expect.any(Number),
      heartbeatOutgoing: expect.any(Number),
    }));
    
    expect(mockClient.activate).toHaveBeenCalled();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
  });
  
  test('disconnect should deactivate the STOMP client', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    webSocketService.disconnect();
    
    expect(mockClient.deactivate).toHaveBeenCalled();
  });
  
  test('sendMessage should publish a message through the STOMP client', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const destination = '/app/chat.sendMessage';
    const message = { content: 'Hello', receiverId: 456 };
    webSocketService.sendMessage(destination, message);
    
    expect(mockClient.publish).toHaveBeenCalledWith({
      destination,
      body: JSON.stringify(message)
    });
  });
  
  test('subscribe should register a subscription with the STOMP client', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const destination = '/user/123/queue/messages';
    const callback = jest.fn();
    
    
    const messageBody = JSON.stringify({ content: 'Hello' });
    const mockStompMessage = { body: messageBody };
    
    const subscribeCall = mockClient.subscribe.mock.calls.find(
      call => call[0] === `/user/${userId}/queue/messages`
    );
    
    const messageCallback = subscribeCall[1];
    
    webSocketService.onMessage('message', callback);
    
    messageCallback(mockStompMessage);
    
    expect(callback).toHaveBeenCalledWith({ content: 'Hello' });
  });
  
  test('should handle reconnection on connection close', async () => {
    jest.useFakeTimers();
    
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    Client.mockClear();
    mockClient.activate.mockClear();
    
    onWebSocketCloseCallback();
    
    jest.advanceTimersByTime(3000);
    
    expect(Client).toHaveBeenCalled();
    expect(mockClient.activate).toHaveBeenCalled();
  });
  
  test('should handle connection errors', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const error = new Error('Connection failed');
    onWebSocketErrorCallback(error);
    
    expect(console.error).toHaveBeenCalledWith('WebSocket error', error);
  });
  
  test('should not send messages if not connected', () => {
    const destination = '/app/chat.sendMessage';
    const message = { content: 'Hello', receiverId: 456 };
    webSocketService.sendMessage(destination, message);
    
    expect(mockClient.publish).not.toHaveBeenCalled();
  });
  
  test('sendChatMessage should send a message to the correct destination', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const receiverId = 456;
    const content = 'Hello';
    webSocketService.sendChatMessage(receiverId, content);
    
    expect(mockClient.publish).toHaveBeenCalledWith({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        receiverId,
        content,
        type: 'CHAT'
      })
    });
  });
  
  test('sendTypingIndicator should send a typing indicator to the correct destination', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const receiverId = 456;
    webSocketService.sendTypingIndicator(receiverId);
    
    expect(mockClient.publish).toHaveBeenCalledWith({
      destination: '/app/chat.typing',
      body: JSON.stringify({
        receiverId,
        type: 'TYPING'
      })
    });
  });
  
  test('sendReadReceipt should send a read receipt to the correct destination', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const senderId = 456;
    webSocketService.sendReadReceipt(senderId);
    
    expect(mockClient.publish).toHaveBeenCalledWith({
      destination: '/app/chat.read',
      body: JSON.stringify({
        senderId,
        type: 'READ'
      })
    });
  });
});
