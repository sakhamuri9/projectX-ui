import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';
import ProfileTab from './tabs/ProfileTab';
import InsightsTab from './tabs/InsightsTab';
import MatchesTab from './tabs/MatchesTab';
import ConnectionsTab from './tabs/ConnectionsTab';
import ChatTab from './tabs/ChatTab';

const DashboardScreen = ({ navigation, route, relationshipIntent }) => {
  const [activeTab, setActiveTab] = useState('matches');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab navigation={navigation} />;
      case 'insights':
        return <InsightsTab navigation={navigation} />;
      case 'matches':
        return <MatchesTab navigation={navigation} />;
      case 'connections':
        return <ConnectionsTab navigation={navigation} />;
      case 'chat':
        return <ChatTab navigation={navigation} />;
      default:
        return <MatchesTab navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SoulNest</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.SECONDARY} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color={COLORS.SECONDARY} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
      
      {/* Bottom Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'profile' && styles.activeTabItem]} 
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name={activeTab === 'profile' ? "person" : "person-outline"} 
            size={24} 
            color={COLORS.SECONDARY} 
          />
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>
            Profile
          </Text>
          {activeTab === 'profile' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'insights' && styles.activeTabItem]} 
          onPress={() => setActiveTab('insights')}
        >
          <Ionicons 
            name={activeTab === 'insights' ? "analytics" : "analytics-outline"} 
            size={24} 
            color={COLORS.SECONDARY} 
          />
          <Text style={[styles.tabLabel, activeTab === 'insights' && styles.activeTabLabel]}>
            Insights
          </Text>
          {activeTab === 'insights' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'matches' && styles.activeTabItem]} 
          onPress={() => setActiveTab('matches')}
        >
          <Ionicons 
            name={activeTab === 'matches' ? "heart" : "heart-outline"} 
            size={24} 
            color={COLORS.SECONDARY} 
          />
          <Text style={[styles.tabLabel, activeTab === 'matches' && styles.activeTabLabel]}>
            Matches
          </Text>
          {activeTab === 'matches' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'connections' && styles.activeTabItem]} 
          onPress={() => setActiveTab('connections')}
        >
          <Ionicons 
            name={activeTab === 'connections' ? "people" : "people-outline"} 
            size={24} 
            color={COLORS.SECONDARY} 
          />
          <Text style={[styles.tabLabel, activeTab === 'connections' && styles.activeTabLabel]}>
            Connections
          </Text>
          {activeTab === 'connections' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'chat' && styles.activeTabItem]} 
          onPress={() => setActiveTab('chat')}
        >
          <Ionicons 
            name={activeTab === 'chat' ? "chatbubbles" : "chatbubbles-outline"} 
            size={24} 
            color={COLORS.SECONDARY} 
          />
          <Text style={[styles.tabLabel, activeTab === 'chat' && styles.activeTabLabel]}>
            Chat
          </Text>
          {activeTab === 'chat' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeTabItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 4,
  },
  activeTabLabel: {
    color: COLORS.SECONDARY,
    fontWeight: 'bold',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '80%',
    height: 2,
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 1,
  },
});

export default DashboardScreen;
