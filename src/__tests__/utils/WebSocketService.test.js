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
  
  test('connect should not create a new client if already connected', async () => {
    const userId = 123;
    
    webSocketService.isConnected = true;
    
    await webSocketService.connect(userId);
    
    expect(Client).not.toHaveBeenCalled();
    expect(mockClient.activate).not.toHaveBeenCalled();
    
    webSocketService.isConnected = false;
  });
  
  test('connect should handle errors', async () => {
    const userId = 123;
    
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
    
    await webSocketService.connect(userId);
    
    expect(console.error).toHaveBeenCalledWith('Error connecting to WebSocket', expect.any(Error));
  });
  
  test('disconnect should deactivate the STOMP client', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    webSocketService.disconnect();
    
    expect(mockClient.deactivate).toHaveBeenCalled();
  });
  
  test('disconnect should not do anything if not connected', () => {
    webSocketService.isConnected = false;
    webSocketService.client = null;
    
    webSocketService.disconnect();
    
    expect(mockClient.deactivate).not.toHaveBeenCalled();
  });
  
  test('handleReconnect should attempt to reconnect', async () => {
    jest.useFakeTimers();
    
    const userId = 123;
    const originalConnect = webSocketService.connect;
    webSocketService.connect = jest.fn();
    
    webSocketService.reconnectAttempts = 0;
    webSocketService.handleReconnect(userId);
    
    expect(webSocketService.reconnectAttempts).toBe(1);
    
    jest.advanceTimersByTime(webSocketService.reconnectDelay);
    
    expect(webSocketService.connect).toHaveBeenCalledWith(userId);
    
    webSocketService.connect = originalConnect;
  });
  
  test('handleReconnect should stop after max attempts', () => {
    const userId = 123;
    const originalConnect = webSocketService.connect;
    webSocketService.connect = jest.fn();
    
    webSocketService.reconnectAttempts = webSocketService.maxReconnectAttempts;
    webSocketService.handleReconnect(userId);
    
    expect(console.error).toHaveBeenCalledWith('Max reconnect attempts reached');
    expect(webSocketService.connect).not.toHaveBeenCalled();
    
    webSocketService.connect = originalConnect;
    webSocketService.reconnectAttempts = 0;
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
  
  test('should not send messages if not connected', () => {
    const destination = '/app/chat.sendMessage';
    const message = { content: 'Hello', receiverId: 456 };
    webSocketService.sendMessage(destination, message);
    
    expect(mockClient.publish).not.toHaveBeenCalled();
  });
  
  test('subscribe should register a subscription with the STOMP client', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const destination = '/user/123/queue/messages';
    const callback = jest.fn();
    
    webSocketService.subscribe(destination, callback);
    
    expect(mockClient.subscribe).toHaveBeenCalledWith(destination, expect.any(Function));
    expect(webSocketService.subscriptions.has(destination)).toBe(true);
  });
  
  test('subscribe should not register if already subscribed', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    mockClient.subscribe.mockClear();
    
    const destination = '/user/123/queue/messages';
    const callback = jest.fn();
    
    webSocketService.subscriptions.set(destination, mockSubscription);
    
    webSocketService.subscribe(destination, callback);
    
    expect(mockClient.subscribe).not.toHaveBeenCalled();
  });
  
  test('subscribe should not register if not connected', () => {
    const destination = '/user/123/queue/messages';
    const callback = jest.fn();
    
    webSocketService.isConnected = false;
    
    webSocketService.subscribe(destination, callback);
    
    expect(mockClient.subscribe).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Cannot subscribe, WebSocket not connected');
  });
  
  test('subscribe should handle message parsing errors', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const destination = '/user/123/queue/messages';
    const callback = jest.fn();
    
    webSocketService.subscribe(destination, callback);
    
    const subscribeCall = mockClient.subscribe.mock.calls[0];
    const messageCallback = subscribeCall[1];
    
    const mockStompMessage = { body: '{invalid json' };
    messageCallback(mockStompMessage);
    
    expect(console.error).toHaveBeenCalledWith('Error parsing message', expect.any(Error));
    expect(callback).not.toHaveBeenCalled();
  });
  
  test('unsubscribe should remove a subscription', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const destination = '/user/123/queue/messages';
    
    webSocketService.subscriptions.set(destination, mockSubscription);
    
    webSocketService.unsubscribe(destination);
    
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    expect(webSocketService.subscriptions.has(destination)).toBe(false);
  });
  
  test('unsubscribe should do nothing if destination not found', () => {
    const destination = '/user/123/queue/messages';
    
    webSocketService.unsubscribe(destination);
    
    expect(mockSubscription.unsubscribe).not.toHaveBeenCalled();
  });
  
  test('onMessage should register a callback', () => {
    const type = 'message';
    const callback = jest.fn();
    
    webSocketService.onMessage(type, callback);
    
    expect(webSocketService.messageCallbacks.get(type)).toBe(callback);
  });
  
  test('message callback should be triggered when message is received', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const callback = jest.fn();
    
    webSocketService.onMessage('message', callback);
    
    const messageBody = JSON.stringify({ content: 'Hello' });
    const mockStompMessage = { body: messageBody };
    
    const subscribeCall = mockClient.subscribe.mock.calls.find(
      call => call[0] === `/user/${userId}/queue/messages`
    );
    
    const messageCallback = subscribeCall[1];
    messageCallback(mockStompMessage);
    
    expect(callback).toHaveBeenCalledWith({ content: 'Hello' });
  });
  
  test('should handle reconnection on connection close', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const originalHandleReconnect = webSocketService.handleReconnect;
    webSocketService.handleReconnect = jest.fn();
    
    onWebSocketCloseCallback();
    
    expect(webSocketService.handleReconnect).toHaveBeenCalledWith(userId);
    
    webSocketService.handleReconnect = originalHandleReconnect;
  });
  
  test('should handle connection errors', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    onConnectCallback();
    
    const error = new Error('Connection failed');
    onWebSocketErrorCallback(error);
    
    expect(console.error).toHaveBeenCalledWith('WebSocket error', error);
  });
  
  test('should handle STOMP errors', async () => {
    const userId = 123;
    await webSocketService.connect(userId);
    
    const frame = { command: 'ERROR', headers: {}, body: 'Error message' };
    onStompErrorCallback(frame);
    
    expect(console.error).toHaveBeenCalledWith('STOMP error', frame);
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
