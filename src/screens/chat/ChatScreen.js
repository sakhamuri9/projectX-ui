import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../styles/theme';
import webSocketService from '../../utils/WebSocketService';

const ChatScreen = ({ route, navigation }) => {
  const { conversation } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userId, setUserId] = useState(null);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '😍', '🎉', '🙏', '😎', '🤔', '😢', '😘', '🥰', '😇', '🤗', '🤩', '😋', '😆', '😉', '😜'];

  useEffect(() => {
    const fetchUserIdAndMessages = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(parseInt(storedUserId, 10));
        
        fetchMessages(conversation.user.id);
        
        webSocketService.connect(parseInt(storedUserId, 10));
        
        webSocketService.onMessage('message', handleNewMessage);
        webSocketService.onMessage('typing', handleTypingIndicator);
        webSocketService.onMessage('read', handleReadReceipt);
        
        webSocketService.sendReadReceipt(conversation.user.id);
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserIdAndMessages();
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversation]);
  
  const fetchMessages = async (receiverId) => {
    try {
      setTimeout(() => {
        const mockMessages = [
          {
            id: 1,
            senderId: userId || 1,
            receiverId: receiverId,
            content: 'Hey there! How are you doing?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isRead: true,
            type: 'TEXT'
          },
          {
            id: 2,
            senderId: receiverId,
            receiverId: userId || 1,
            content: 'I\'m good! Just checking out this new app.',
            timestamp: new Date(Date.now() - 3500000).toISOString(),
            isRead: true,
            type: 'TEXT'
          },
          {
            id: 3,
            senderId: userId || 1,
            receiverId: receiverId,
            content: 'It\'s pretty cool, right? I love the UI.',
            timestamp: new Date(Date.now() - 3400000).toISOString(),
            isRead: true,
            type: 'TEXT'
          },
          {
            id: 4,
            senderId: receiverId,
            receiverId: userId || 1,
            content: 'Yeah, it\'s awesome! 😊',
            timestamp: new Date(Date.now() - 3300000).toISOString(),
            isRead: true,
            type: 'TEXT'
          },
          {
            id: 5,
            senderId: receiverId,
            receiverId: userId || 1,
            content: 'https://randomuser.me/api/portraits/women/33.jpg',
            timestamp: new Date(Date.now() - 3200000).toISOString(),
            isRead: true,
            type: 'IMAGE'
          },
          {
            id: 6,
            senderId: userId || 1,
            receiverId: receiverId,
            content: 'Wow, nice picture! 👍',
            timestamp: new Date(Date.now() - 3100000).toISOString(),
            isRead: true,
            type: 'TEXT'
          }
        ];
        
        setMessages(mockMessages);
      }, 1000);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  const handleNewMessage = (message) => {
    if (message.senderId === conversation.user.id || message.receiverId === conversation.user.id) {
      setMessages(prevMessages => [...prevMessages, {
        id: message.id || Date.now(),
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        timestamp: message.timestamp || new Date().toISOString(),
        isRead: false,
        type: message.type || 'TEXT'
      }]);
      
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
      
      if (message.senderId === conversation.user.id) {
        webSocketService.sendReadReceipt(conversation.user.id);
      }
    }
  };
  
  const handleTypingIndicator = (data) => {
    if (data.senderId === conversation.user.id) {
      setIsTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };
  
  const handleReadReceipt = (data) => {
    if (data.senderId === conversation.user.id) {
      setMessages(prevMessages => 
        prevMessages.map(msg => ({
          ...msg,
          isRead: true
        }))
      );
    }
  };
  
  const handleInputChange = (text) => {
    setInputText(text);
    
    webSocketService.sendTypingIndicator(conversation.user.id);
  };
  
  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    const newMessage = {
      id: Date.now(),
      senderId: userId,
      receiverId: conversation.user.id,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'TEXT'
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    webSocketService.sendChatMessage(conversation.user.id, inputText.trim());
    
    setInputText('');
    
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };
  
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload images!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        const newMessage = {
          id: Date.now(),
          senderId: userId,
          receiverId: conversation.user.id,
          content: selectedImage.uri,
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'IMAGE'
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        webSocketService.sendChatMessage(conversation.user.id, selectedImage.uri);
        
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  const handleEmojiSelect = (emoji) => {
    setInputText(prevText => prevText + emoji);
    setShowEmojiPicker(false);
  };
  
  const renderMessageItem = ({ item }) => {
    const isMyMessage = item.senderId === userId;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
      ]}>
        {item.type === 'TEXT' ? (
          <View style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
          ]}>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.imageBubble,
              isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
            ]}
            onPress={() => {
              alert('Image viewer would open here');
            }}
          >
            <Image 
              source={{ uri: item.content }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        
        <View style={[
          styles.messageFooter,
          isMyMessage ? styles.myMessageFooter : styles.theirMessageFooter
        ]}>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          
          {isMyMessage && (
            <Ionicons 
              name={item.isRead ? "checkmark-done" : "checkmark"} 
              size={16} 
              color={item.isRead ? "#34C759" : "rgba(255, 255, 255, 0.5)"}
              style={styles.readIndicator}
            />
          )}
        </View>
      </View>
    );
  };
  
  const renderDateSeparator = (date) => (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Text style={styles.dateText}>{date}</Text>
      <View style={styles.dateLine} />
    </View>
  );
  
  const groupedMessages = messages.reduce((acc, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    
    if (!acc[date]) {
      acc[date] = [];
    }
    
    acc[date].push(message);
    return acc;
  }, {});
  
  const flattenedMessages = Object.entries(groupedMessages).flatMap(([date, msgs]) => {
    return [
      { id: `date-${date}`, type: 'DATE', date },
      ...msgs
    ];
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.SECONDARY} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.profileContainer}
          onPress={() => {
            alert('Navigate to user profile');
          }}
        >
          <Image 
            source={{ uri: conversation.user.image }} 
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{conversation.user.name}</Text>
            <Text style={styles.profileStatus}>
              {conversation.user.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.SECONDARY} />
        </TouchableOpacity>
      </View>
      
      {/* Messages */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.SECONDARY} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={flattenedMessages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => 
            item.type === 'DATE' 
              ? renderDateSeparator(item.date)
              : renderMessageItem({ item })
          }
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
        />
      )}
      
      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <View style={styles.typingBubble}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, styles.typingDotMiddle]} />
            <View style={styles.typingDot} />
          </View>
          <Text style={styles.typingText}>{conversation.user.name} is typing...</Text>
        </View>
      )}
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <View style={styles.emojiPickerContainer}>
          <FlatList
            data={emojis}
            keyExtractor={(item, index) => `emoji-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.emojiItem}
                onPress={() => handleEmojiSelect(item)}
              >
                <Text style={styles.emojiText}>{item}</Text>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
      
      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={handlePickImage}
          >
            <Ionicons name="image-outline" size={24} color={COLORS.SECONDARY} />
          </TouchableOpacity>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={inputText}
              onChangeText={handleInputChange}
              multiline
            />
            
            <TouchableOpacity 
              style={styles.emojiButton}
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Ionicons name="happy-outline" size={24} color={COLORS.SECONDARY} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              inputText.trim() === '' ? styles.sendButtonDisabled : {}
            ]}
            onPress={handleSendMessage}
            disabled={inputText.trim() === ''}
          >
            <Ionicons name="send" size={20} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  profileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileInfo: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  profileStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  menuButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.SECONDARY,
  },
  imageBubble: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 200,
  },
  messageFooter: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  myMessageFooter: {
    justifyContent: 'flex-end',
  },
  theirMessageFooter: {
    justifyContent: 'flex-start',
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  readIndicator: {
    marginLeft: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 2,
    opacity: 0.6,
  },
  typingDotMiddle: {
    opacity: 0.8,
  },
  typingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emojiPickerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  emojiItem: {
    padding: 8,
  },
  emojiText: {
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  attachButton: {
    padding: 8,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  textInput: {
    flex: 1,
    color: COLORS.SECONDARY,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  emojiButton: {
    padding: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;
