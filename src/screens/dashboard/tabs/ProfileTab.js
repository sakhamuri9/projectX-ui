import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/theme';
import * as ImageManipulator from 'expo-image-manipulator';
import ApiService from '../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileTab = () => {
  const [userData, setUserData] = useState(null);
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [bioCharLimit] = useState(150);
  
  const [profileImage, setProfileImage] = useState(null);
  const [processedProfileImage, setProcessedProfileImage] = useState(null);
  const [photoGallery, setPhotoGallery] = useState([]);
  const [processedGallery, setProcessedGallery] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  
  const likesAnim = useRef(new Animated.Value(0)).current;
  const viewsAnim = useRef(new Animated.Value(0)).current;
  const chatsAnim = useRef(new Animated.Value(0)).current;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ApiService.user.getProfile();
      
      if (response && response.data) {
        const userData = response.data;
        setUserData(userData);
        
        if (userData.bio) {
          setBio(userData.bio);
          setTempBio(userData.bio);
        }
        
        if (userData.photos && userData.photos.length > 0) {
          const mainPhoto = userData.photos.find(photo => photo.isMain) || userData.photos[0];
          setProfileImage(mainPhoto.url);
          
          const photoUrls = userData.photos.map(photo => photo.url);
          setPhotoGallery(photoUrls);
        } else {
          setProfileImage('https://randomuser.me/api/portraits/men/32.jpg');
          setPhotoGallery(['https://randomuser.me/api/portraits/men/32.jpg']);
        }
        
        const insightsResponse = await ApiService.insights.getProfilePerformance();
        if (insightsResponse && insightsResponse.data) {
          const insights = insightsResponse.data;
          
          animateValue(likesAnim, insights.likes || 0);
          animateValue(viewsAnim, insights.views || 0);
          animateValue(chatsAnim, insights.pendingChats || 0);
        } else {
          animateValue(likesAnim, 82);
          animateValue(viewsAnim, 154);
          animateValue(chatsAnim, 6);
        }
      } else {
        setError('Failed to load profile data');
        
        setProfileImage('https://randomuser.me/api/portraits/men/32.jpg');
        setPhotoGallery(['https://randomuser.me/api/portraits/men/32.jpg']);
        animateValue(likesAnim, 82);
        animateValue(viewsAnim, 154);
        animateValue(chatsAnim, 6);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile data. Please try again.');
      
      setProfileImage('https://randomuser.me/api/portraits/men/32.jpg');
      setPhotoGallery(['https://randomuser.me/api/portraits/men/32.jpg']);
      animateValue(likesAnim, 82);
      animateValue(viewsAnim, 154);
      animateValue(chatsAnim, 6);
    } finally {
      setIsLoading(false);
    }
  };
  
  const animateValue = (animValue, toValue, duration = 1500) => {
    Animated.timing(animValue, {
      toValue,
      duration,
      useNativeDriver: false,
    }).start();
  };
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  useEffect(() => {
    const convertProfileImage = async () => {
      if (!profileImage) return;
      
      try {
        const result = await ImageManipulator.manipulateAsync(
          profileImage,
          [{ resize: { width: 120, height: 120 } }],
          {
            format: ImageManipulator.SaveFormat.JPEG,
            compress: 0.8,
          }
        );
        
        const grayscaleResult = await ImageManipulator.manipulateAsync(
          result.uri,
          [{ grayscale: true }],
          {
            format: ImageManipulator.SaveFormat.JPEG,
            compress: 0.8,
          }
        );
        
        setProcessedProfileImage(grayscaleResult.uri);
      } catch (error) {
        console.error('Error converting profile image to grayscale:', error);
        setProcessedProfileImage(profileImage);
      }
    };
    
    const convertGalleryImages = async () => {
      if (!photoGallery || photoGallery.length === 0) return;
      
      try {
        const processed = await Promise.all(
          photoGallery.map(async (photo) => {
            try {
              const result = await ImageManipulator.manipulateAsync(
                photo,
                [],
                {
                  format: ImageManipulator.SaveFormat.JPEG,
                  compress: 0.8,
                }
              );
              
              const grayscaleResult = await ImageManipulator.manipulateAsync(
                result.uri,
                [{ grayscale: true }],
                {
                  format: ImageManipulator.SaveFormat.JPEG,
                  compress: 0.8,
                }
              );
              
              return grayscaleResult.uri;
            } catch (error) {
              console.error('Error converting gallery image to grayscale:', error);
              return photo;
            }
          })
        );
        setProcessedGallery(processed);
      } catch (error) {
        console.error('Error processing gallery images:', error);
        setProcessedGallery(photoGallery);
      }
    };
    
    if (profileImage) {
      convertProfileImage();
    }
    
    if (photoGallery.length > 0) {
      convertGalleryImages();
    }
  }, [profileImage, photoGallery]);
  
  const likesAnimText = likesAnim.interpolate({
    inputRange: [0, 82],
    outputRange: ['0', '82'],
    extrapolate: 'clamp',
  });
  
  const viewsAnimText = viewsAnim.interpolate({
    inputRange: [0, 154],
    outputRange: ['0', '154'],
    extrapolate: 'clamp',
  });
  
  const chatsAnimText = chatsAnim.interpolate({
    inputRange: [0, 6],
    outputRange: ['0', '6'],
    extrapolate: 'clamp',
  });

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

  const handleSaveBio = async () => {
    try {
      setIsSaving(true);
      
      await ApiService.user.updateProfile({ bio: tempBio });
      
      setBio(tempBio);
      setIsEditingBio(false);
      
      Alert.alert('Success', 'Your bio has been updated successfully.');
    } catch (error) {
      console.error('Error updating bio:', error);
      Alert.alert('Error', 'Failed to update your bio. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelBio = () => {
    setTempBio(bio);
    setIsEditingBio(false);
  };
  
  const AnimatedNumber = ({ value, style }) => {
    return (
      <Animated.Text style={style}>
        {value}
      </Animated.Text>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.SECONDARY} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="rgba(255, 255, 255, 0.2)" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchUserProfile}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: processedProfileImage || profileImage }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <MaterialIcons name="edit" size={20} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.profileName}>
          {userData ? `${userData.firstName} ${userData.lastName}, ${userData.age}` : 'Loading...'}
        </Text>
        <Text style={styles.profileLocation}>
          {userData ? userData.location : 'Loading...'}
        </Text>
        
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <AnimatedNumber value={likesAnimText} style={styles.statValue} />
            <Text style={styles.statLabel}>❤️ Likes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <AnimatedNumber value={viewsAnimText} style={styles.statValue} />
            <Text style={styles.statLabel}>👀 Profile Views</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <AnimatedNumber value={chatsAnimText} style={styles.statValue} />
            <Text style={styles.statLabel}>💬 Pending Chats</Text>
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
              onChangeText={(text) => {
                if (text.length <= bioCharLimit) {
                  setTempBio(text);
                }
              }}
              placeholder="Write something about yourself..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              maxLength={bioCharLimit}
            />
            <View style={styles.bioCharCounter}>
              <Text style={styles.bioCharCounterText}>
                {tempBio.length}/{bioCharLimit}
              </Text>
            </View>
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
        
        <View style={styles.photoGrid}>
          {(processedGallery.length > 0 ? processedGallery : photoGallery).map((photo, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.photoGridItem}
              onPress={() => {
                setSelectedPhoto(index);
                setShowGallery(true);
              }}
            >
              <Image
                source={{ uri: photo }}
                style={styles.photoGridImage}
              />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addPhotoGridButton}>
            <Ionicons name="add" size={30} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Match Preferences</Text>
        </View>
        
        <View style={styles.preferenceCard}>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Looking for:</Text>
            <Text style={styles.preferenceValue}>
              {userData && userData.preferences ? 
                `${userData.preferences.genderPreference}, Age ${userData.preferences.minAge}–${userData.preferences.maxAge}` : 
                'Loading preferences...'}
            </Text>
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Location:</Text>
            <Text style={styles.preferenceValue}>
              {userData && userData.preferences ? 
                `${userData.preferences.maxDistance} miles around ${userData.location}` : 
                'Loading location preferences...'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editPreferencesButton}
            onPress={() => Alert.alert('Coming Soon', 'Preference editing will be available in the next update.')}
          >
            <Text style={styles.editPreferencesButtonText}>Edit Preferences</Text>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.SECONDARY} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.notificationsFeed}>
          {notifications && notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <View key={index} style={styles.notificationItem}>
                <View style={[
                  styles.notificationIcon, 
                  notification.type === 'like' ? styles.likeIcon : 
                  notification.type === 'match' ? styles.matchIcon : 
                  styles.viewIcon
                ]}>
                  <Ionicons 
                    name={
                      notification.type === 'like' ? "heart" : 
                      notification.type === 'match' ? "checkmark-circle" : 
                      notification.type === 'message' ? "chatbubble" : "eye"
                    } 
                    size={18} 
                    color="#fff" 
                  />
                </View>
                <Text style={[
                  styles.notificationText,
                  !notification.read && styles.notificationTextUnread
                ]}>
                  {notification.type === 'like' ? `${notification.user} liked you` :
                   notification.type === 'match' ? `Matched with ${notification.user}` :
                   notification.type === 'message' ? `New message from ${notification.user}` :
                   `${notification.user} viewed your profile`}
                </Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyNotifications}>
              <Ionicons name="notifications-off-outline" size={40} color="rgba(255, 255, 255, 0.2)" />
              <Text style={styles.emptyNotificationsText}>No notifications yet</Text>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity style={styles.floatingActionButton}>
        <Text style={styles.actionButtonText}>Start Matching</Text>
      </TouchableOpacity>
      
      {/* Full Screen Gallery Modal */}
      <Modal
        visible={showGallery}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGallery(false)}
      >
        <View style={styles.galleryModal}>
          <TouchableOpacity 
            style={styles.galleryCloseButton}
            onPress={() => setShowGallery(false)}
          >
            <Ionicons name="close" size={28} color={COLORS.SECONDARY} />
          </TouchableOpacity>
          
          <Image
            source={{ uri: (processedGallery.length > 0 ? processedGallery : photoGallery)[selectedPhoto] }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          
          <View style={styles.galleryNav}>
            {/* Pagination indicators */}
            {photoGallery.map((_, index) => (
              <View key={index} style={[styles.galleryDot, selectedPhoto === index && styles.galleryDotActive]} />
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
  },
  errorTitle: {
    color: COLORS.SECONDARY,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
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
  editProfileButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
  },
  editProfileButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    fontSize: 14,
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
  bioCharCounter: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  bioCharCounterText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
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
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoGridItem: {
    width: '32%',
    aspectRatio: 1,
    marginBottom: '2%',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  addPhotoGridButton: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  galleryCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  galleryNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    width: '100%',
  },
  galleryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  galleryDotActive: {
    backgroundColor: COLORS.SECONDARY,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  preferenceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  preferenceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  editPreferencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  editPreferencesButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginRight: 4,
  },
  notificationsFeed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  notificationIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  likeIcon: {
    backgroundColor: '#FF3B30',
  },
  viewIcon: {
    backgroundColor: '#007AFF',
  },
  matchIcon: {
    backgroundColor: '#34C759',
  },
  notificationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  notificationTextUnread: {
    color: COLORS.SECONDARY,
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 8,
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyNotificationsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
  },
  floatingActionButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  actionButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileTab;
