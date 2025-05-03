import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/theme';

const ConnectionsTab = () => {
  const connections = [
    {
      id: 1,
      name: 'Jessica',
      age: 27,
      location: 'New York, NY',
      matchPercentage: 92,
      lastActive: '2 hours ago',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      interests: ['Travel', 'Photography', 'Cooking'],
      isOnline: true,
    },
    {
      id: 2,
      name: 'Michael',
      age: 29,
      location: 'Brooklyn, NY',
      matchPercentage: 87,
      lastActive: '5 hours ago',
      image: 'https://randomuser.me/api/portraits/men/52.jpg',
      interests: ['Music', 'Hiking', 'Coffee'],
      isOnline: false,
    },
    {
      id: 3,
      name: 'Sophia',
      age: 26,
      location: 'Manhattan, NY',
      matchPercentage: 85,
      lastActive: '1 hour ago',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      interests: ['Art', 'Painting', 'Museums'],
      isOnline: true,
    },
    {
      id: 4,
      name: 'David',
      age: 30,
      location: 'Queens, NY',
      matchPercentage: 81,
      lastActive: 'Just now',
      image: 'https://randomuser.me/api/portraits/men/46.jpg',
      interests: ['Technology', 'Fitness', 'Dogs'],
      isOnline: true,
    },
    {
      id: 5,
      name: 'Emma',
      age: 25,
      location: 'Manhattan, NY',
      matchPercentage: 79,
      lastActive: '3 hours ago',
      image: 'https://randomuser.me/api/portraits/women/22.jpg',
      interests: ['Reading', 'Yoga', 'Travel'],
      isOnline: false,
    },
    {
      id: 6,
      name: 'James',
      age: 31,
      location: 'Brooklyn, NY',
      matchPercentage: 76,
      lastActive: 'Yesterday',
      image: 'https://randomuser.me/api/portraits/men/33.jpg',
      interests: ['Sports', 'Cooking', 'Movies'],
      isOnline: false,
    },
    {
      id: 7,
      name: 'Olivia',
      age: 28,
      location: 'Staten Island, NY',
      matchPercentage: 74,
      lastActive: '4 hours ago',
      image: 'https://randomuser.me/api/portraits/women/17.jpg',
      interests: ['Dancing', 'Music', 'Fashion'],
      isOnline: true,
    },
    {
      id: 8,
      name: 'William',
      age: 32,
      location: 'Bronx, NY',
      matchPercentage: 72,
      lastActive: '2 days ago',
      image: 'https://randomuser.me/api/portraits/men/83.jpg',
      interests: ['Photography', 'Travel', 'Food'],
      isOnline: false,
    },
  ];

  const renderConnectionItem = ({ item }) => (
    <TouchableOpacity style={styles.connectionItem}>
      <View style={styles.connectionImageContainer}>
        <Image source={{ uri: item.image }} style={styles.connectionImage} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.connectionInfo}>
        <View style={styles.connectionNameRow}>
          <Text style={styles.connectionName}>{item.name}, {item.age}</Text>
          <Text style={styles.matchPercentage}>{item.matchPercentage}%</Text>
        </View>
        
        <View style={styles.connectionLocationRow}>
          <Ionicons name="location-outline" size={14} color="rgba(255, 255, 255, 0.7)" />
          <Text style={styles.connectionLocation}>{item.location}</Text>
        </View>
        
        <View style={styles.interestsContainer}>
          {item.interests.slice(0, 2).map((interest, i) => (
            <View key={i} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
          {item.interests.length > 2 && (
            <View style={styles.interestTag}>
              <Text style={styles.interestText}>+{item.interests.length - 2}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.connectionActions}>
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.SECONDARY} />
        </TouchableOpacity>
        <Text style={styles.lastActive}>{item.lastActive}</Text>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.statValue}>{connections.length}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{connections.filter(c => c.isOnline).length}</Text>
          <Text style={styles.statLabel}>Online</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>New</Text>
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Online</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>New</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Favorites</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={connections}
        renderItem={renderConnectionItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.connectionsList}
        showsVerticalScrollIndicator={false}
      />
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
});

export default ConnectionsTab;
