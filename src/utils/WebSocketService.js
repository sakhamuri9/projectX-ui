import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.messageCallbacks = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
  }

  async connect(userId) {
    if (this.client && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      
      this.client = new Client({
        webSocketFactory: () => {
          const socket = new SockJS('https://api.soulnest.com/ws');
          return socket;
        },
        connectHeaders: {
          'X-Auth-Token': token,
        },
        debug: function (str) {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          this.subscribe(`/user/${userId}/queue/messages`, (message) => {
            if (this.messageCallbacks.has('message')) {
              this.messageCallbacks.get('message')(message);
            }
          });
          
          this.subscribe(`/user/${userId}/queue/typing`, (message) => {
            if (this.messageCallbacks.has('typing')) {
              this.messageCallbacks.get('typing')(message);
            }
          });
          
          this.subscribe(`/user/${userId}/queue/read`, (message) => {
            if (this.messageCallbacks.has('read')) {
              this.messageCallbacks.get('read')(message);
            }
          });
          
          this.subscribe('/topic/public', (message) => {
            if (this.messageCallbacks.has('presence')) {
              this.messageCallbacks.get('presence')(message);
            }
          });
          
          this.sendMessage('/app/chat.addUser', {
            type: 'JOIN',
            senderId: userId
          });
        },
        onStompError: (frame) => {
          console.error('STOMP error', frame);
        },
        onWebSocketClose: () => {
          console.log('WebSocket connection closed');
          this.isConnected = false;
          this.handleReconnect(userId);
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error', error);
          this.isConnected = false;
        }
      });

      this.client.activate();
    } catch (error) {
      console.error('Error connecting to WebSocket', error);
    }
  }

  handleReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(userId);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  disconnect() {
    if (this.client && this.isConnected) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      
      this.subscriptions.clear();
      this.messageCallbacks.clear();
      
      this.client.deactivate();
      this.isConnected = false;
      console.log('WebSocket disconnected');
    }
  }

  subscribe(destination, callback) {
    if (!this.client || !this.isConnected) {
      console.error('Cannot subscribe, WebSocket not connected');
      return;
    }
    
    if (this.subscriptions.has(destination)) {
      console.log(`Already subscribed to ${destination}`);
      return;
    }
    
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        callback(parsedMessage);
      } catch (error) {
        console.error('Error parsing message', error);
      }
    });
    
    this.subscriptions.set(destination, subscription);
    console.log(`Subscribed to ${destination}`);
  }

  unsubscribe(destination) {
    if (this.subscriptions.has(destination)) {
      this.subscriptions.get(destination).unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`Unsubscribed from ${destination}`);
    }
  }

  sendMessage(destination, message) {
    if (!this.client || !this.isConnected) {
      console.error('Cannot send message, WebSocket not connected');
      return;
    }
    
    this.client.publish({
      destination,
      body: JSON.stringify(message)
    });
  }

  onMessage(type, callback) {
    this.messageCallbacks.set(type, callback);
  }

  sendChatMessage(receiverId, content) {
    this.sendMessage('/app/chat.sendMessage', {
      receiverId,
      content,
      type: 'CHAT'
    });
  }

  sendTypingIndicator(receiverId) {
    this.sendMessage('/app/chat.typing', {
      receiverId,
      type: 'TYPING'
    });
  }

  sendReadReceipt(senderId) {
    this.sendMessage('/app/chat.read', {
      senderId,
      type: 'READ'
    });
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
