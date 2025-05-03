import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/theme';
import * as ImageManipulator from 'expo-image-manipulator';

const ProfileTab = () => {
  const [bio, setBio] = useState('Passionate about travel, photography, and meeting new people. Looking for someone who shares my love for adventure and deep conversations.');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(bio);
  
  const [profileImage, setProfileImage] = useState('https://randomuser.me/api/portraits/men/32.jpg');
  const [photoGallery, setPhotoGallery] = useState([
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5'
  ]);

  const notifications = [
    {
      id: 1,
      type: 'like',
      user: 'Sarah',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'match',
      user: 'Michael',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'message',
      user: 'Jessica',
      time: 'Yesterday',
      read: true,
    },
  ];

  const handleSaveBio = () => {
    setBio(tempBio);
    setIsEditingBio(false);
  };

  const handleCancelBio = () => {
    setTempBio(bio);
    setIsEditingBio(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: profileImage }}
            style={[styles.profileImage, styles.grayscaleImage]}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <MaterialIcons name="edit" size={20} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.profileName}>Alex Johnson, 28</Text>
        <Text style={styles.profileLocation}>New York, NY</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Profile</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Chats</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {!isEditingBio ? (
            <TouchableOpacity onPress={() => setIsEditingBio(true)}>
              <MaterialIcons name="edit" size={20} color={COLORS.SECONDARY} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        {isEditingBio ? (
          <View>
            <TextInput
              style={styles.bioInput}
              multiline
              value={tempBio}
              onChangeText={setTempBio}
              placeholder="Write something about yourself..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            <View style={styles.bioEditButtons}>
              <TouchableOpacity style={styles.bioEditButton} onPress={handleCancelBio}>
                <Text style={styles.bioEditButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bioEditButton, styles.bioSaveButton]} 
                onPress={handleSaveBio}
              >
                <Text style={[styles.bioEditButtonText, styles.bioSaveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.bioText}>{bio}</Text>
        )}
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <TouchableOpacity>
            <MaterialIcons name="add" size={20} color={COLORS.SECONDARY} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosContainer}
        >
          {photoGallery.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={[styles.photoItem, styles.grayscaleImage]}
            />
          ))}
          <TouchableOpacity style={styles.addPhotoButton}>
            <Ionicons name="add" size={40} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {notifications.map((notification) => (
          <View 
            key={notification.id} 
            style={[
              styles.notificationItem, 
              !notification.read && styles.unreadNotification
            ]}
          >
            <View style={styles.notificationIcon}>
              {notification.type === 'like' && (
                <Ionicons name="heart" size={20} color="#FF3B30" />
              )}
              {notification.type === 'match' && (
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              )}
              {notification.type === 'message' && (
                <Ionicons name="chatbubble" size={20} color="#007AFF" />
              )}
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationText}>
                <Text style={styles.notificationUser}>{notification.user}</Text>
                {notification.type === 'like' && ' liked your profile'}
                {notification.type === 'match' && ' matched with you'}
                {notification.type === 'message' && ' sent you a message'}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            {!notification.read && <View style={styles.unreadDot} />}
          </View>
        ))}
      </View>
      
      <View style={styles.section}>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color={COLORS.SECONDARY} />
          <Text style={styles.settingsButtonText}>Account Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  grayscaleImage: {
    filter: 'grayscale(100%)',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.SECONDARY,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bioInput: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.SECONDARY,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bioEditButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  bioEditButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  bioEditButtonText: {
    fontSize: 14,
    color: COLORS.SECONDARY,
  },
  bioSaveButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  bioSaveButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  photosContainer: {
    paddingVertical: 8,
  },
  photoItem: {
    width: 120,
    height: 160,
    borderRadius: 12,
    marginRight: 12,
  },
  addPhotoButton: {
    width: 120,
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  notificationUser: {
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  notificationTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  settingsButtonText: {
    fontSize: 16,
    color: COLORS.SECONDARY,
    marginLeft: 8,
  },
});

export default ProfileTab;
