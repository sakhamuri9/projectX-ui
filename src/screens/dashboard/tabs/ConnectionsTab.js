import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/theme';
import axios from 'axios';
import { API_URL } from '../../../config/constants';

const ConnectionsTab = () => {
  const [activeTab, setActiveTab] = useState('mutual');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    mutualMatchesCount: 0,
    pendingLikesCount: 0,
    savedProfilesCount: 0
  });
  const [mutualMatches, setMutualMatches] = useState([]);
  const [pendingLikes, setPendingLikes] = useState([]);
  const [savedProfiles, setSavedProfiles] = useState([]);

  useEffect(() => {
    fetchConnectionStats();
    fetchData();
  }, [activeTab]);

  const fetchConnectionStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/connections/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching connection stats:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      
      switch (activeTab) {
        case 'mutual':
          endpoint = '/connections/mutual-matches';
          break;
        case 'pending':
          endpoint = '/connections/pending-likes';
          break;
        case 'saved':
          endpoint = '/connections/saved-profiles';
          break;
        default:
          endpoint = '/connections/mutual-matches';
      }
      
      const response = await axios.get(`${API_URL}${endpoint}`);
      
      switch (activeTab) {
        case 'mutual':
          setMutualMatches(response.data);
          break;
        case 'pending':
          setPendingLikes(response.data);
          break;
        case 'saved':
          setSavedProfiles(response.data);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
      Alert.alert('Error', `Failed to load ${activeTab} connections`);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (userId) => {
    try {
      await axios.post(`${API_URL}/connections/accept/${userId}`);
      Alert.alert('Success', 'Connection accepted!');
      fetchConnectionStats();
      fetchData();
    } catch (error) {
      console.error('Error accepting connection:', error);
      Alert.alert('Error', 'Failed to accept connection');
    }
  };

  const handleReject = async (userId) => {
    try {
      await axios.post(`${API_URL}/connections/reject/${userId}`);
      Alert.alert('Success', 'Connection rejected');
      fetchConnectionStats();
      fetchData();
    } catch (error) {
      console.error('Error rejecting connection:', error);
      Alert.alert('Error', 'Failed to reject connection');
    }
  };

  const handleSaveForLater = async (userId) => {
    try {
      await axios.post(`${API_URL}/connections/save-for-later/${userId}`);
      Alert.alert('Success', 'Profile saved for later');
      fetchConnectionStats();
      fetchData();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const renderMutualMatchItem = ({ item }) => (
    <TouchableOpacity style={styles.connectionItem}>
      <View style={styles.connectionImageContainer}>
        <Image 
          source={{ uri: item.profilePictureUrl || 'https://randomuser.me/api/portraits/lego/1.jpg' }} 
          style={styles.connectionImage} 
        />
        {item.isNew && <View style={styles.newIndicator} />}
      </View>
      
      <View style={styles.connectionInfo}>
        <View style={styles.connectionNameRow}>
          <Text style={styles.connectionName}>{item.name || item.fullName}, {item.age}</Text>
          {item.matchPercentage && (
            <Text style={styles.matchPercentage}>{item.matchPercentage}%</Text>
          )}
        </View>
        
        <View style={styles.connectionLocationRow}>
          <Ionicons name="heart" size={14} color={COLORS.SECONDARY} />
          <Text style={styles.connectionLocation}>Mutual Match</Text>
        </View>
        
        <View style={styles.bioContainer}>
          <Text style={styles.bioText} numberOfLines={2}>{item.bio || 'No bio available'}</Text>
        </View>
      </View>
      
      <View style={styles.connectionActions}>
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.SECONDARY} />
        </TouchableOpacity>
        <Text style={styles.lastActive}>
          {item.matchedAt ? new Date(item.matchedAt).toLocaleDateString() : 'Recently'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPendingLikeItem = ({ item }) => (
    <TouchableOpacity style={styles.connectionItem}>
      <View style={styles.connectionImageContainer}>
        <Image 
          source={{ uri: item.profilePictureUrl || 'https://randomuser.me/api/portraits/lego/1.jpg' }} 
          style={styles.connectionImage} 
        />
      </View>
      
      <View style={styles.connectionInfo}>
        <View style={styles.connectionNameRow}>
          <Text style={styles.connectionName}>{item.name || item.fullName}, {item.age}</Text>
        </View>
        
        <View style={styles.connectionLocationRow}>
          <Ionicons name="heart-outline" size={14} color="rgba(255, 255, 255, 0.7)" />
          <Text style={styles.connectionLocation}>Likes You</Text>
        </View>
        
        <View style={styles.bioContainer}>
          <Text style={styles.bioText} numberOfLines={2}>{item.bio || 'No bio available'}</Text>
        </View>
      </View>
      
      <View style={styles.pendingActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item.userId)}
        >
          <Ionicons name="checkmark" size={20} color="#34C759" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.userId)}
        >
          <Ionicons name="close" size={20} color="#FF3B30" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.saveButton]}
          onPress={() => handleSaveForLater(item.userId)}
        >
          <Ionicons name="bookmark-outline" size={20} color={COLORS.SECONDARY} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSavedProfileItem = ({ item }) => (
    <TouchableOpacity style={styles.connectionItem}>
      <View style={styles.connectionImageContainer}>
        <Image 
          source={{ uri: item.profilePictureUrl || 'https://randomuser.me/api/portraits/lego/1.jpg' }} 
          style={styles.connectionImage} 
        />
      </View>
      
      <View style={styles.connectionInfo}>
        <View style={styles.connectionNameRow}>
          <Text style={styles.connectionName}>{item.name || item.fullName}, {item.age}</Text>
        </View>
        
        <View style={styles.connectionLocationRow}>
          <Ionicons name="bookmark" size={14} color={COLORS.SECONDARY} />
          <Text style={styles.connectionLocation}>Saved for Later</Text>
        </View>
        
        <View style={styles.bioContainer}>
          <Text style={styles.bioText} numberOfLines={2}>{item.bio || 'No bio available'}</Text>
        </View>
      </View>
      
      <View style={styles.pendingActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item.userId)}
        >
          <Ionicons name="checkmark" size={20} color="#34C759" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.userId)}
        >
          <Ionicons name="close" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.SECONDARY} />
          <Text style={styles.loadingText}>Loading connections...</Text>
        </View>
      );
    }

    let data = [];
    let renderItem = null;
    let emptyMessage = '';

    switch (activeTab) {
      case 'mutual':
        data = mutualMatches;
        renderItem = renderMutualMatchItem;
        emptyMessage = 'No mutual matches yet. Keep swiping!';
        break;
      case 'pending':
        data = pendingLikes;
        renderItem = renderPendingLikeItem;
        emptyMessage = 'No pending likes at the moment.';
        break;
      case 'saved':
        data = savedProfiles;
        renderItem = renderSavedProfileItem;
        emptyMessage = 'No saved profiles yet.';
        break;
    }

    if (data.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={60} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.connectionsList}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Connections</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color={COLORS.SECONDARY} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.mutualMatchesCount}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pendingLikesCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.savedProfilesCount}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'mutual' && styles.activeTab]}
          onPress={() => setActiveTab('mutual')}
        >
          <Text style={[styles.tabText, activeTab === 'mutual' && styles.activeTabText]}>
            Mutual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
            Saved
          </Text>
        </TouchableOpacity>
      </View>
      
      {renderContent()}
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  filterText: {
    color: COLORS.SECONDARY,
    fontSize: 14,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  connectionsList: {
    padding: 16,
  },
  connectionItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  connectionImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  connectionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  newIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.SECONDARY,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  connectionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  connectionNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  matchPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  connectionLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  connectionLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  bioContainer: {
    marginTop: 4,
  },
  bioText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 6,
  },
  interestText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  connectionActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 8,
  },
  pendingActions: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: 8,
    height: 100,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  acceptButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  rejectButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  lastActive: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default ConnectionsTab;
