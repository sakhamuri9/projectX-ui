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
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/theme';
import * as ImageManipulator from 'expo-image-manipulator';

const ProfileTab = () => {
  const [bio, setBio] = useState('Passionate about travel, photography, and meeting new people. Looking for someone who shares my love for adventure and deep conversations.');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(bio);
  const [bioCharLimit] = useState(150);
  
  const [profileImage, setProfileImage] = useState('https://randomuser.me/api/portraits/men/32.jpg');
  const [processedProfileImage, setProcessedProfileImage] = useState(null);
  const [photoGallery, setPhotoGallery] = useState([
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
    'https://images.unsplash.com/photo-1492447273231-0f8fecec1e3a',
    'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4',
    'https://images.unsplash.com/photo-1463453091185-61582044d556',
    'https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2',
    'https://images.unsplash.com/photo-1530268729831-4b0b9e170218',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39'
  ]);
  const [processedGallery, setProcessedGallery] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  
  const likesAnim = useRef(new Animated.Value(0)).current;
  const viewsAnim = useRef(new Animated.Value(0)).current;
  const chatsAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const convertProfileImage = async () => {
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
    
    convertProfileImage();
    convertGalleryImages();
  }, [profileImage, photoGallery]);
  
  useEffect(() => {
    const animateValue = (animValue, toValue, duration = 1500) => {
      Animated.timing(animValue, {
        toValue,
        duration,
        useNativeDriver: false,
      }).start();
    };
    
    setTimeout(() => {
      animateValue(likesAnim, 82);
      animateValue(viewsAnim, 154);
      animateValue(chatsAnim, 6);
    }, 300);
  }, []);
  
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

  const handleSaveBio = () => {
    setBio(tempBio);
    setIsEditingBio(false);
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
        
        <Text style={styles.profileName}>Alex Johnson, 28</Text>
        <Text style={styles.profileLocation}>New York, NY</Text>
        
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
            <Text style={styles.preferenceValue}>Female, Age 24–30</Text>
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Location:</Text>
            <Text style={styles.preferenceValue}>10 miles around NYC</Text>
          </View>
          
          <TouchableOpacity style={styles.editPreferencesButton}>
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
          <View style={styles.notificationItem}>
            <View style={[styles.notificationIcon, styles.likeIcon]}>
              <Ionicons name="heart" size={18} color="#fff" />
            </View>
            <Text style={styles.notificationText}>Someone liked you</Text>
          </View>
          
          <View style={styles.notificationItem}>
            <View style={[styles.notificationIcon, styles.viewIcon]}>
              <Ionicons name="eye" size={18} color="#fff" />
            </View>
            <Text style={styles.notificationText}>Someone pinged your profile</Text>
          </View>
          
          <View style={styles.notificationItem}>
            <View style={[styles.notificationIcon, styles.matchIcon]}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
            </View>
            <Text style={styles.notificationText}>Matched with David, 91%</Text>
          </View>
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
