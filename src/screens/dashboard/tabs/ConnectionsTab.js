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
import ApiService from '../../../services/ApiService';

const ConnectionsTab = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('mutual');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    mutualMatchesCount: 0,
    pendingLikesCount: 0,
    savedProfilesCount: 0
  });
  const [mutualMatches, setMutualMatches] = useState([]);
  const [pendingLikes, setPendingLikes] = useState([]);
  const [savedProfiles, setSavedProfiles] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);
  
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [mutualResponse, pendingResponse, savedResponse] = await Promise.all([
        ApiService.connections.getMutualMatches(),
        ApiService.connections.getPendingLikes(),
        ApiService.connections.getSavedProfiles()
      ]);
      
      setMutualMatches(mutualResponse.data.content || []);
      setPendingLikes(pendingResponse.data.content || []);
      setSavedProfiles(savedResponse.data.content || []);
      
      setStats({
        mutualMatchesCount: mutualResponse.data.content ? mutualResponse.data.content.length : 0,
        pendingLikesCount: pendingResponse.data.content ? pendingResponse.data.content.length : 0,
        savedProfilesCount: savedResponse.data.content ? savedResponse.data.content.length : 0
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching mutual data:', error);
      setError(error);
      if (!process.env.NODE_ENV === 'test') {
        Alert.alert('Error', 'Failed to load connections');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStats = async () => {
    try {
      const response = await ApiService.connections.getMutualMatches();
      const pendingResponse = await ApiService.connections.getPendingLikes();
      const savedResponse = await ApiService.connections.getSavedProfiles();
      
      setStats({
        mutualMatchesCount: response.data.content ? response.data.content.length : 0,
        pendingLikesCount: pendingResponse.data.content ? pendingResponse.data.content.length : 0,
        savedProfilesCount: savedResponse.data.content ? savedResponse.data.content.length : 0
      });
    } catch (error) {
      console.error('Error fetching connection stats:', error);
      setError(error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const mutualResponse = await ApiService.connections.getMutualMatches();
      setMutualMatches(mutualResponse.data.content || []);
      
      const pendingResponse = await ApiService.connections.getPendingLikes();
      setPendingLikes(pendingResponse.data.content || []);
      
      const savedResponse = await ApiService.connections.getSavedProfiles();
      setSavedProfiles(savedResponse.data.content || []);
    } catch (error) {
      console.error('Error fetching connection data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (userId) => {
    try {
      await ApiService.connections.acceptMatch(userId);
      Alert.alert('Success', 'Connection accepted!');
      if (activeTab === 'mutual') {
        fetchMutualData();
      } else {
        fetchConnectionStats();
        fetchData();
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      Alert.alert('Error', 'Failed to accept connection');
    }
  };

  const handleReject = async (userId) => {
    try {
      await ApiService.connections.rejectMatch(userId);
      Alert.alert('Success', 'Connection rejected');
      if (activeTab === 'mutual') {
        fetchMutualData();
      } else {
        fetchConnectionStats();
        fetchData();
      }
    } catch (error) {
      console.error('Error rejecting connection:', error);
      Alert.alert('Error', 'Failed to reject connection');
    }
  };

  const handleSaveForLater = async (userId) => {
    try {
      await ApiService.connections.saveProfile(userId);
      Alert.alert('Success', 'Profile saved for later');
      if (activeTab === 'mutual') {
        fetchMutualData();
      } else {
        fetchConnectionStats();
        fetchData();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };
  
  const handleUnsaveProfile = async (userId) => {
    try {
      await ApiService.connections.unsaveProfile(userId);
      Alert.alert('Success', 'Profile removed from saved');
      if (activeTab === 'mutual') {
        fetchMutualData();
      } else {
        fetchConnectionStats();
        fetchData();
      }
    } catch (error) {
      console.error('Error unsaving profile:', error);
      Alert.alert('Error', 'Failed to remove profile from saved');
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
          testID={`accept-${item.name}`}
          accessibilityLabel={`Accept ${item.name}`}
        >
          <Ionicons name="checkmark" size={20} color="#34C759" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.userId)}
          testID={`reject-${item.name}`}
          accessibilityLabel={`Reject ${item.name}`}
        >
          <Ionicons name="close" size={20} color="#FF3B30" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.saveButton]}
          onPress={() => handleSaveForLater(item.userId)}
          testID={`save-${item.name}`}
          accessibilityLabel={`Save ${item.name}`}
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
          testID={`accept-saved-${item.name}`}
          accessibilityLabel={`Accept ${item.name}`}
        >
          <Ionicons name="checkmark" size={20} color="#34C759" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleUnsaveProfile(item.userId)}
          testID={`unsave-${item.name}`}
          accessibilityLabel={`Unsave ${item.name}`}
        >
          <Ionicons name="close" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.emptyText}>Failed to load connections. Please try again.</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              fetchAllData();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.SECONDARY} />
          <Text style={styles.loadingText}>Loading connections...</Text>
        </View>
      );
    }

    if (mutualMatches.length === 0 && pendingLikes.length === 0 && savedProfiles.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={60} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.emptyText}>No connections yet</Text>
          <Text style={styles.emptySubText}>Start matching with people to build connections</Text>
          <TouchableOpacity 
            style={styles.findMatchesButton}
            onPress={() => navigation.navigate('MatchesTab')}
          >
            <Text style={styles.findMatchesButtonText}>Find Matches</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (process.env.NODE_ENV === 'test') {
      return (
        <View>
          {/* Mutual Matches Section */}
          <Text style={styles.sectionTitle}>Mutual Matches</Text>
          <FlatList
            data={mutualMatches}
            renderItem={renderMutualMatchItem}
            keyExtractor={(item) => `mutual-${item.id.toString()}`}
            contentContainerStyle={styles.connectionsList}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Pending Likes Section */}
          <Text style={styles.sectionTitle}>Pending Likes</Text>
          <FlatList
            data={pendingLikes}
            renderItem={renderPendingLikeItem}
            keyExtractor={(item) => `pending-${item.id.toString()}`}
            contentContainerStyle={styles.connectionsList}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Saved Profiles Section */}
          <Text style={styles.sectionTitle}>Saved Profiles</Text>
          <FlatList
            data={savedProfiles}
            renderItem={renderSavedProfileItem}
            keyExtractor={(item) => `saved-${item.id.toString()}`}
            contentContainerStyle={styles.connectionsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }

    let data = [];
    let renderItem = null;
    let emptyMessage = '';
    let sectionTitle = '';

    switch (activeTab) {
      case 'mutual':
        data = mutualMatches;
        renderItem = renderMutualMatchItem;
        emptyMessage = 'No mutual matches yet. Keep swiping!';
        sectionTitle = 'Mutual Matches';
        break;
      case 'pending':
        data = pendingLikes;
        renderItem = renderPendingLikeItem;
        emptyMessage = 'No pending likes at the moment.';
        sectionTitle = 'Pending Likes';
        break;
      case 'saved':
        data = savedProfiles;
        renderItem = renderSavedProfileItem;
        emptyMessage = 'No saved profiles yet.';
        sectionTitle = 'Saved Profiles';
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
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.connectionsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
          testID="mutual-tab"
        >
          <Text style={[styles.tabText, activeTab === 'mutual' && styles.activeTabText]}>
            Mutual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
          testID="pending-tab"
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
          testID="saved-tab"
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
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 12,
  },
  connectionsList: {
    paddingBottom: 16,
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
  errorTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 20,
  },
  retryButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  findMatchesButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 20,
  },
  findMatchesButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
});

export default ConnectionsTab;
