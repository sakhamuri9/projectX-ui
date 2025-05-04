import webSocketService from '../../utils/WebSocketService';

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

describe('WebSocketService', () => {
  let mockWebSocket;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    console.log = jest.fn();
    console.error = jest.fn();
    
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    
    global.WebSocket.mockImplementation(() => mockWebSocket);
  });
  
  afterEach(() => {
    webSocketService.disconnect();
    
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    jest.useRealTimers();
  });
  
  test('connect should create a WebSocket connection with the correct URL', () => {
    const userId = 123;
    webSocketService.connect(userId);
    
    expect(global.WebSocket).toHaveBeenCalledWith('wss://api.soulnest.com/ws/chat?userId=123');
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function));
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('close', expect.any(Function));
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
  });
  
  test('disconnect should close the WebSocket connection', () => {
    webSocketService.connect(123);
    
    webSocketService.disconnect();
    
    expect(mockWebSocket.close).toHaveBeenCalledTimes(1);
  });
  
  test('send should send a message through the WebSocket', () => {
    webSocketService.connect(123);
    
    const message = { content: 'Hello', receiverId: 456 };
    webSocketService.send(message);
    
    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
  });
  
  test('onMessage should register a callback for a specific message type', () => {
    webSocketService.connect(123);
    
    const callback = jest.fn();
    webSocketService.onMessage('chat', callback);
    
    const openHandler = mockWebSocket.addEventListener.mock.calls.find(call => call[0] === 'message')[1];
    const messageEvent = {
      data: JSON.stringify({
        type: 'chat',
        content: 'Hello',
      }),
    };
    openHandler(messageEvent);
    
    expect(callback).toHaveBeenCalledWith({
      type: 'chat',
      content: 'Hello',
    });
  });
  
  test('should handle reconnection on connection close', () => {
    jest.useFakeTimers();
    
    webSocketService.connect(123);
    
    const closeHandler = mockWebSocket.addEventListener.mock.calls.find(call => call[0] === 'close')[1];
    closeHandler();
    
    global.WebSocket.mockClear();
    
    jest.advanceTimersByTime(3000);
    
    expect(global.WebSocket).toHaveBeenCalledWith('wss://api.soulnest.com/ws/chat?userId=123');
  });
  
  test('should handle connection errors', () => {
    webSocketService.connect(123);
    
    const errorHandler = mockWebSocket.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
    const error = new Error('Connection failed');
    errorHandler(error);
    
    expect(console.error).toHaveBeenCalledWith('WebSocket error:', error);
  });
  
  test('should not send messages if not connected', () => {
    const message = { content: 'Hello', receiverId: 456 };
    webSocketService.send(message);
    
    expect(mockWebSocket.send).not.toHaveBeenCalled();
  });
});
