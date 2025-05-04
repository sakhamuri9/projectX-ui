import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import webSocketService from '../../../utils/WebSocketService';
import ApiService from '../../../services/ApiService';

const ChatTab = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          const parsedUserId = parseInt(storedUserId, 10);
          setUserId(parsedUserId);
          
          webSocketService.connect(parsedUserId);
          
          webSocketService.onMessage('message', handleNewMessage);
          
          fetchConversations();
        } else {
          setUserId(1);
          await AsyncStorage.setItem('userId', '1');
          
          webSocketService.connect(1);
          
          webSocketService.onMessage('message', handleNewMessage);
          
          fetchConversations();
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('Failed to initialize chat. Please try again.');
        setIsLoading(false);
      }
    };
    
    initializeChat();
    
    return () => {
      webSocketService.disconnect();
    };
  }, []);
  
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.chat.getConversations();
      
      if (response && response.data) {
        setConversations(response.data.content || []);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewMessage = (message) => {
    if (message.senderId !== userId) {
      setUnreadMessages(prev => ({
        ...prev,
        [message.senderId]: (prev[message.senderId] || 0) + 1
      }));
      
      fetchConversations();
    }
  };

  const filteredConversations = searchQuery
    ? conversations.filter(conv => 
        conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => navigation.navigate('ChatScreen', { conversation: item })}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.user.image }} style={styles.avatar} />
        {item.user.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.messageTime}>{item.lastMessage.time}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.lastMessage,
              !item.lastMessage.isRead && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage.isSent && <Text style={styles.sentPrefix}>You: </Text>}
            {item.lastMessage.text}
          </Text>
          
          {(item.unreadCount > 0 || unreadMessages[item.user.id]) && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {unreadMessages[item.user.id] || item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.newChatButton}
          onPress={() => navigation.navigate('MatchesTab')}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.SECONDARY} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Unread</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Archived</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.SECONDARY} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="rgba(255, 255, 255, 0.2)" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchConversations}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchConversations}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={60} color="rgba(255, 255, 255, 0.2)" />
          <Text style={styles.emptyTitle}>No conversations found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery 
              ? `No results for "${searchQuery}"`
              : "Start connecting with your matches to begin chatting"}
          </Text>
          
          {!searchQuery && (
            <TouchableOpacity 
              style={styles.startChatButton}
              onPress={() => navigation.navigate('MatchesTab')}
            >
              <Text style={styles.startChatText}>Find Matches</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: COLORS.SECONDARY,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  activeTabText: {
    color: COLORS.SECONDARY,
    fontWeight: 'bold',
  },
  conversationsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
  },
  unreadMessage: {
    color: COLORS.SECONDARY,
    fontWeight: '500',
  },
  sentPrefix: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  startChatText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  retryButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatTab;
