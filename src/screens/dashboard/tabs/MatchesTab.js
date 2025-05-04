import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  Modal,
  Slider,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/theme';
import ApiService from '../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.85, 400);
const CARD_HEIGHT = Math.min(height * 0.6, CARD_WIDTH * 1.5);
const CARD_STACK_OFFSET = 8; // Offset for stacked cards

const MatchesTab = ({ navigation }) => {
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLikeOverlay, setShowLikeOverlay] = useState(false);
  const [showDislikeOverlay, setShowDislikeOverlay] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showMatchReasonTooltip, setShowMatchReasonTooltip] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    radius: 10,
    ageRange: [24, 30],
    intent: 'both', // 'dating', 'marriage', 'both'
    showOnlineOnly: false
  });
  const [matchStreak, setMatchStreak] = useState(3); // Days of consecutive matching
  const [hasBoost, setHasBoost] = useState(false);
  
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  
  const position = useRef(new Animated.ValueXY()).current;
  const cardScales = useRef([
    new Animated.Value(1),      // Top card
    new Animated.Value(0.95),   // Second card
    new Animated.Value(0.90),   // Third card
    new Animated.Value(0.85),   // Fourth card
  ]).current;
  
  const cardOffsets = useRef([
    new Animated.Value(0),                  // Top card
    new Animated.Value(-CARD_STACK_OFFSET), // Second card
    new Animated.Value(-CARD_STACK_OFFSET * 2), // Third card
    new Animated.Value(-CARD_STACK_OFFSET * 3), // Fourth card
  ]).current;
  
  const rotation = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['8deg', '0deg', '-8deg'],
    extrapolate: 'clamp',
  });
  
  const likeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0, width / 4],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  
  const dislikeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0, width / 4],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });
  
  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(parseInt(storedUserId, 10));
      } else {
        setUserId(1);
        await AsyncStorage.setItem('userId', '1');
      }
      
      const params = new URLSearchParams();
      params.append('radius', filterSettings.radius);
      params.append('minAge', filterSettings.ageRange[0]);
      params.append('maxAge', filterSettings.ageRange[1]);
      params.append('intent', filterSettings.intent);
      if (filterSettings.showOnlineOnly) {
        params.append('onlineOnly', 'true');
      }
      
      const response = await ApiService.matches.getMatches();
      
      if (response && response.data) {
        setMatches(response.data.content || []);
      } else {
        setMatches(mockMatches);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches. Please try again.');
      setMatches(mockMatches);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMatches();
    initializeCardPositions();
  }, []);
  
  useEffect(() => {
    initializeCardPositions();
  }, [currentIndex]);
  
  const initializeCardPositions = () => {
    position.setValue({ x: 0, y: 0 });
    
    cardScales.forEach((scale, i) => {
      scale.setValue(1 - (i * 0.05));
    });
    
    cardOffsets.forEach((offset, i) => {
      offset.setValue(-CARD_STACK_OFFSET * i);
    });
  };
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        
        const swipeThreshold = width * 0.25;
        const dragDistance = Math.abs(gesture.dx);
        const percentDragged = Math.min(dragDistance / swipeThreshold, 1);
        
        cardScales.forEach((scale, i) => {
          if (i > 0) { // Only animate cards below the top card
            const nextScale = (1 - (i * 0.05)) + (0.05 * percentDragged);
            scale.setValue(nextScale);
            
            const nextOffset = -CARD_STACK_OFFSET * (i - percentDragged * 0.5);
            cardOffsets[i].setValue(nextOffset);
          }
        });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          swipeRight();
        } else if (gesture.dx < -120) {
          swipeLeft();
        } else {
          resetCardPositions();
        }
      },
    })
  ).current;
  
  const resetCardPositions = () => {
    Animated.parallel([
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        friction: 5,
        useNativeDriver: false,
      }),
      ...cardScales.map((scale, i) => 
        Animated.spring(scale, {
          toValue: 1 - (i * 0.05),
          friction: 5,
          useNativeDriver: false,
        })
      ),
      ...cardOffsets.map((offset, i) => 
        Animated.spring(offset, {
          toValue: -CARD_STACK_OFFSET * i,
          friction: 5,
          useNativeDriver: false,
        })
      )
    ]).start();
  };
  
  const skipReactions = [
    "Not My Vibe",
    "Maybe Later",
    "Not Feeling It",
    "Next Please",
    "Pass For Now"
  ];
  
  const likeReactions = [
    "Let's Talk",
    "Great Match!",
    "Definitely Yes",
    "Interested!",
    "Love This"
  ];
  
  const [currentLikeReaction, setCurrentLikeReaction] = useState(likeReactions[0]);
  const [currentSkipReaction, setCurrentSkipReaction] = useState(skipReactions[0]);
  
  const getRandomReaction = (reactions) => {
    const randomIndex = Math.floor(Math.random() * reactions.length);
    return reactions[randomIndex];
  };
  
  const swipeLeft = async () => {
    if (matches.length === 0 || isLoading) return;
    
    const currentMatch = matches[currentIndex];
    const reaction = getRandomReaction(likeReactions);
    setCurrentLikeReaction(reaction);
    
    setShowLikeOverlay(true);
    setLikeCount(prevCount => prevCount + 1);
    
    Animated.timing(position, {
      toValue: { x: -width * 1.5, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === matches.length - 1 ? 0 : prevIndex + 1
      );
      
      position.setValue({ x: 0, y: 0 });
      
      setTimeout(() => setShowLikeOverlay(false), 500);
    });
    
    animateCardsUp();
    
    try {
      await ApiService.matches.swipeRight(currentMatch.id);
    } catch (error) {
      console.error('Error registering like:', error);
    }
  };
  
  const swipeRight = async () => {
    if (matches.length === 0 || isLoading) return;
    
    const currentMatch = matches[currentIndex];
    const reaction = getRandomReaction(skipReactions);
    setCurrentSkipReaction(reaction);
    
    setShowDislikeOverlay(true);
    setDislikeCount(prevCount => prevCount + 1);
    
    Animated.timing(position, {
      toValue: { x: width * 1.5, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === matches.length - 1 ? 0 : prevIndex + 1
      );
      
      position.setValue({ x: 0, y: 0 });
      
      setTimeout(() => setShowDislikeOverlay(false), 500);
    });
    
    animateCardsUp();
    
    try {
      await ApiService.matches.swipeLeft(currentMatch.id);
    } catch (error) {
      console.error('Error registering dislike:', error);
    }
  };
  
  const animateCardsUp = () => {
    const animations = [];
    
    for (let i = 1; i < cardScales.length; i++) {
      animations.push(
        Animated.timing(cardScales[i], {
          toValue: i === 1 ? 1 : 1 - ((i-1) * 0.05),
          duration: 300,
          useNativeDriver: false,
        })
      );
      
      animations.push(
        Animated.timing(cardOffsets[i], {
          toValue: i === 1 ? 0 : -CARD_STACK_OFFSET * (i-1),
          duration: 300,
          useNativeDriver: false,
        })
      );
    }
    
    Animated.parallel(animations).start();
  };

  const userInterests = ['Travel', 'Photography', 'Coffee', 'Fitness', 'Technology'];
  
  const mockMatches = [
    {
      id: 1,
      name: 'Jessica',
      age: 27,
      location: 'New York, NY',
      distance: '3 miles away',
      matchPercentage: 92,
      bio: 'Passionate about travel, photography, and meeting new people.',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      interests: ['Travel', 'Photography', 'Cooking'],
      mutualInterests: ['Travel', 'Photography'],
      icebreaker: 'Ask Jessica about her favorite travel destination.',
      matchReasons: [
        'You both love photography',
        'Located in the same city',
        '85% personality compatibility'
      ],
      personalityType: 'Creative',
      isOnline: true,
    },
    {
      id: 2,
      name: 'Michael',
      age: 29,
      location: 'Brooklyn, NY',
      distance: '5 miles away',
      matchPercentage: 87,
      bio: 'Music lover, coffee enthusiast, and weekend hiker.',
      image: 'https://randomuser.me/api/portraits/men/52.jpg',
      interests: ['Music', 'Hiking', 'Coffee'],
      mutualInterests: ['Coffee'],
      icebreaker: 'Ask Michael about his favorite coffee brewing method.',
      matchReasons: [
        'You both enjoy coffee',
        'Similar age group',
        'Complementary interests'
      ],
      personalityType: 'Adventurous',
      isOnline: false,
    },
    {
      id: 3,
      name: 'Sophia',
      age: 26,
      location: 'Manhattan, NY',
      distance: '2 miles away',
      matchPercentage: 85,
      bio: 'Art director by day, painter by night. Love good conversations.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      interests: ['Art', 'Painting', 'Museums'],
      mutualInterests: [],
      icebreaker: 'Ask Sophia about her latest art project.',
      matchReasons: [
        'Located very close to you',
        'Creative personality match',
        'Enjoys meaningful conversations'
      ],
      personalityType: 'Creative',
      isOnline: true,
    },
    {
      id: 4,
      name: 'David',
      age: 30,
      location: 'Queens, NY',
      distance: '8 miles away',
      matchPercentage: 81,
      bio: 'Tech entrepreneur, fitness enthusiast, and dog lover.',
      image: 'https://randomuser.me/api/portraits/men/46.jpg',
      interests: ['Technology', 'Fitness', 'Dogs'],
      mutualInterests: ['Technology', 'Fitness'],
      icebreaker: 'Ask David about his tech startup.',
      matchReasons: [
        'You both are into technology',
        'Shared interest in fitness',
        'Entrepreneurial mindset'
      ],
      personalityType: 'Ambitious',
      isOnline: false,
    },
  ];

  const renderCard = (index) => {
    const matchIndex = (currentIndex + index) % matches.length;
    const match = matches[matchIndex];
    
    if (index > 3) return null;
    
    const isTopCard = index === 0;
    
    const cardOpacity = isTopCard ? 1 : Math.max(0.7 - (index * 0.15), 0.3);
    
    const cardStyle = {
      zIndex: matches.length - index,
      opacity: cardOpacity,
      transform: [
        { scale: cardScales[index] },
        { translateY: cardOffsets[index] }
      ],
      backgroundColor: COLORS.PRIMARY,
    };
    
    // Add swipe animations only to the top card
    if (isTopCard) {
      cardStyle.transform.push(
        { translateX: position.x },
        { translateY: position.y },
        { rotate: rotation }
      );
    }
    
    return (
      <Animated.View
        key={`card-${matchIndex}`}
        {...(isTopCard ? panResponder.panHandlers : {})}
        style={[styles.card, cardStyle]}
      >
        {/* Add overlay for non-top cards to dim their content */}
        {!isTopCard && (
          <View style={styles.cardOverlay} />
        )}
        
        <View style={styles.matchImageContainer}>
          <Image source={{ uri: match.image }} style={styles.matchImage} />
          
          {/* Like Stamp Overlay - only on top card */}
          {isTopCard && (
            <Animated.View 
              style={[
                styles.stampOverlay, 
                styles.likeStamp,
                { opacity: likeOpacity }
              ]}
            >
              <Text style={styles.stampText}>LIKE</Text>
            </Animated.View>
          )}
          
          {/* Dislike Stamp Overlay - only on top card */}
          {isTopCard && (
            <Animated.View 
              style={[
                styles.stampOverlay, 
                styles.dislikeStamp,
                { opacity: dislikeOpacity }
              ]}
            >
              <Text style={styles.stampText}>NOPE</Text>
            </Animated.View>
          )}
          
          <View style={styles.matchPercentageContainer}>
            <View style={styles.matchPercentageRow}>
              <Text style={styles.matchPercentage}>{match.matchPercentage}%</Text>
              <TouchableOpacity 
                style={styles.matchInfoButton}
                onPress={() => setShowMatchReasonTooltip(true)}
              >
                <Ionicons name="information-circle-outline" size={16} color={COLORS.SECONDARY} />
              </TouchableOpacity>
            </View>
            <Text style={styles.matchText}>Match</Text>
          </View>
          
          {/* Match Reason Tooltip */}
          {isTopCard && showMatchReasonTooltip && (
            <View style={styles.matchReasonTooltip}>
              <View style={styles.tooltipHeader}>
                <Text style={styles.tooltipTitle}>Why This Match?</Text>
                <TouchableOpacity onPress={() => setShowMatchReasonTooltip(false)}>
                  <Ionicons name="close" size={20} color={COLORS.SECONDARY} />
                </TouchableOpacity>
              </View>
              <View style={styles.tooltipContent}>
                {match.matchReasons.map((reason, i) => (
                  <View key={i} style={styles.reasonItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" style={styles.reasonIcon} />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        
        <View style={[styles.matchInfo, !isTopCard && styles.nonTopCardInfo]}>
          <View style={styles.matchNameRow}>
            <Text style={styles.matchName}>{match.name}, {match.age}</Text>
            {isTopCard && (
              <TouchableOpacity style={styles.likeButton} onPress={swipeLeft}>
                <Ionicons name="heart" size={24} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.matchLocationRow}>
            <Ionicons name="location-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.matchLocation}>{match.location}</Text>
          </View>
          
          <Text style={styles.matchDistance}>{match.distance}</Text>
          
          {/* Only show bio and interests on the top card to reduce clutter */}
          {isTopCard && (
            <>
              <Text style={styles.matchBio} numberOfLines={2}>{match.bio}</Text>
              
              {/* Icebreaker Suggestion */}
              <View style={styles.icebreaker}>
                <Ionicons name="chatbubble-ellipses" size={16} color="#34C759" style={styles.icebreakIcon} />
                <Text style={styles.icebreakText}>{match.icebreaker}</Text>
              </View>
              
              <View style={styles.interestsContainer}>
                {match.interests.map((interest, i) => {
                  const isMutual = match.mutualInterests.includes(interest);
                  return (
                    <View key={i} style={[
                      styles.interestTag, 
                      isMutual && styles.mutualInterestTag
                    ]}>
                      <Text style={[
                        styles.interestText,
                        isMutual && styles.mutualInterestText
                      ]}>
                        {interest} {isMutual && '✅'}
                      </Text>
                    </View>
                  );
                })}
              </View>
              
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.cardActionButton} onPress={swipeRight}>
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                  <Text style={styles.cardActionText}>Pass</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cardActionButton} onPress={swipeLeft}>
                  <Ionicons name="heart" size={20} color="#34C759" />
                  <Text style={styles.cardActionText}>Like</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.SECONDARY} />
        <Text style={styles.loadingText}>Finding your matches...</Text>
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
          onPress={fetchMatches}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={60} color="rgba(255, 255, 255, 0.2)" />
        <Text style={styles.emptyTitle}>No matches found</Text>
        <Text style={styles.emptyMessage}>
          Try adjusting your filters or check back later for new matches.
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setFilterSettings({
              radius: 30,
              ageRange: [18, 50],
              intent: 'both',
              showOnlineOnly: false
            });
            fetchMatches();
          }}
        >
          <Text style={styles.retryButtonText}>Expand Search</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Your Matches</Text>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={16} color="#FF9500" />
            <Text style={styles.streakText}>Daily Streak: {matchStreak} Days</Text>
            {hasBoost && <View style={styles.boostBadge}><Text style={styles.boostText}>BOOST</Text></View>}
          </View>
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color={COLORS.SECONDARY} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      {/* Smart Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Smart Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.SECONDARY} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filterContent}>
              {/* Radius Slider */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Distance</Text>
                <Text style={styles.filterValue}>{filterSettings.radius} miles</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={30}
                  step={1}
                  value={filterSettings.radius}
                  onValueChange={(value) => setFilterSettings({...filterSettings, radius: value})}
                  minimumTrackTintColor={COLORS.SECONDARY}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor={COLORS.SECONDARY}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>1 mi</Text>
                  <Text style={styles.sliderLabel}>30 mi</Text>
                </View>
              </View>
              
              {/* Age Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Age Range</Text>
                <Text style={styles.filterValue}>{filterSettings.ageRange[0]} - {filterSettings.ageRange[1]}</Text>
                <View style={styles.ageRangeContainer}>
                  <TouchableOpacity 
                    style={styles.ageButton}
                    onPress={() => {
                      const newRange = [...filterSettings.ageRange];
                      if (newRange[0] > 18) newRange[0] -= 1;
                      setFilterSettings({...filterSettings, ageRange: newRange});
                    }}
                  >
                    <Ionicons name="remove" size={20} color={COLORS.SECONDARY} />
                  </TouchableOpacity>
                  
                  <View style={styles.ageRangeBar}>
                    <Text style={styles.ageRangeText}>{filterSettings.ageRange[0]}</Text>
                    <View style={styles.ageRangeLine} />
                    <Text style={styles.ageRangeText}>{filterSettings.ageRange[1]}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.ageButton}
                    onPress={() => {
                      const newRange = [...filterSettings.ageRange];
                      if (newRange[1] < 50) newRange[1] += 1;
                      setFilterSettings({...filterSettings, ageRange: newRange});
                    }}
                  >
                    <Ionicons name="add" size={20} color={COLORS.SECONDARY} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Intent Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Intent</Text>
                <View style={styles.intentButtons}>
                  <TouchableOpacity 
                    style={[
                      styles.intentButton, 
                      filterSettings.intent === 'dating' && styles.intentButtonActive
                    ]}
                    onPress={() => setFilterSettings({...filterSettings, intent: 'dating'})}
                  >
                    <Text style={[
                      styles.intentButtonText,
                      filterSettings.intent === 'dating' && styles.intentButtonTextActive
                    ]}>Dating</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.intentButton, 
                      filterSettings.intent === 'marriage' && styles.intentButtonActive
                    ]}
                    onPress={() => setFilterSettings({...filterSettings, intent: 'marriage'})}
                  >
                    <Text style={[
                      styles.intentButtonText,
                      filterSettings.intent === 'marriage' && styles.intentButtonTextActive
                    ]}>Marriage</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.intentButton, 
                      filterSettings.intent === 'both' && styles.intentButtonActive
                    ]}
                    onPress={() => setFilterSettings({...filterSettings, intent: 'both'})}
                  >
                    <Text style={[
                      styles.intentButtonText,
                      filterSettings.intent === 'both' && styles.intentButtonTextActive
                    ]}>Both</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Online Toggle */}
              <View style={styles.filterSection}>
                <View style={styles.toggleRow}>
                  <Text style={styles.filterSectionTitle}>Show people online now</Text>
                  <TouchableOpacity 
                    style={[
                      styles.toggleButton, 
                      filterSettings.showOnlineOnly && styles.toggleButtonActive
                    ]}
                    onPress={() => setFilterSettings({
                      ...filterSettings, 
                      showOnlineOnly: !filterSettings.showOnlineOnly
                    })}
                  >
                    <View style={[
                      styles.toggleKnob, 
                      filterSettings.showOnlineOnly && styles.toggleKnobActive
                    ]} />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => setFilterSettings({
                  radius: 10,
                  ageRange: [24, 30],
                  intent: 'both',
                  showOnlineOnly: false
                })}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Like/Dislike Counters */}
      <View style={styles.countersContainer}>
        <View style={styles.counterItem}>
          <Ionicons name="heart" size={24} color="#FF3B30" />
          <Text style={styles.counterText}>{likeCount}</Text>
        </View>
        
        <View style={styles.counterItem}>
          <Ionicons name="close-circle" size={24} color="#8E8E93" />
          <Text style={styles.counterText}>{dislikeCount}</Text>
        </View>
      </View>
      
      {/* Swipe Indicators */}
      <View style={styles.swipeIndicatorsContainer}>
        <View style={[styles.swipeIndicator, styles.likeIndicator, showLikeOverlay && styles.activeIndicator]}>
          <Ionicons name="heart" size={40} color="#FF3B30" />
          <Text style={styles.indicatorText}>{currentLikeReaction}</Text>
        </View>
        
        <View style={[styles.swipeIndicator, styles.dislikeIndicator, showDislikeOverlay && styles.activeIndicator]}>
          <Ionicons name="close-circle" size={40} color="#8E8E93" />
          <Text style={styles.indicatorText}>{currentSkipReaction}</Text>
        </View>
      </View>
      
      {/* Card Stack */}
      <View style={styles.cardsContainer}>
        {/* Render cards in reverse order so the first card is on top */}
        {[3, 2, 1, 0].map(index => renderCard(index))}
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Matches</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newMatchesList}
        >
          {matches.map((match) => (
            <TouchableOpacity key={match.id} style={styles.newMatchItem}>
              <Image source={{ uri: match.image }} style={styles.newMatchImage} />
              <Text style={styles.newMatchName}>{match.name}</Text>
              <Text style={styles.newMatchPercentage}>{match.matchPercentage}%</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.viewMoreButton}>
            <Ionicons name="arrow-forward" size={24} color={COLORS.SECONDARY} />
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Group Mini Carousel for Suggestions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested For You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        {/* Travel Enthusiasts Group */}
        <View style={styles.suggestionGroup}>
          <View style={styles.groupHeader}>
            <Ionicons name="airplane" size={18} color={COLORS.SECONDARY} />
            <Text style={styles.groupTitle}>🧳 Travel Enthusiasts</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedList}
          >
            {matches.filter(match => match.interests.includes('Travel')).map((match) => (
              <TouchableOpacity key={match.id} style={styles.suggestedItem}>
                <Image source={{ uri: match.image }} style={styles.suggestedImage} />
                <View style={styles.suggestedInfo}>
                  <Text style={styles.suggestedName}>{match.name}, {match.age}</Text>
                  <Text style={styles.suggestedLocation}>{match.location}</Text>
                  <View style={styles.suggestedInterests}>
                    <Text style={styles.suggestedInterest}>Travel</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Creative Souls Group */}
        <View style={styles.suggestionGroup}>
          <View style={styles.groupHeader}>
            <Ionicons name="color-palette" size={18} color={COLORS.SECONDARY} />
            <Text style={styles.groupTitle}>🎨 Creative Souls</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedList}
          >
            {matches.filter(match => 
              match.interests.includes('Art') || 
              match.interests.includes('Photography') || 
              match.personalityType === 'Creative'
            ).map((match) => (
              <TouchableOpacity key={match.id} style={styles.suggestedItem}>
                <Image source={{ uri: match.image }} style={styles.suggestedImage} />
                <View style={styles.suggestedInfo}>
                  <Text style={styles.suggestedName}>{match.name}, {match.age}</Text>
                  <Text style={styles.suggestedLocation}>{match.location}</Text>
                  <View style={styles.suggestedInterests}>
                    {match.interests.filter(interest => 
                      ['Art', 'Photography', 'Painting', 'Museums'].includes(interest)
                    ).slice(0, 1).map((interest, i) => (
                      <Text key={i} style={styles.suggestedInterest}>{interest}</Text>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Food Lovers Group */}
        <View style={styles.suggestionGroup}>
          <View style={styles.groupHeader}>
            <Ionicons name="restaurant" size={18} color={COLORS.SECONDARY} />
            <Text style={styles.groupTitle}>🥘 Food Lovers</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedList}
          >
            {matches.filter(match => match.interests.includes('Cooking') || match.interests.includes('Coffee')).map((match) => (
              <TouchableOpacity key={match.id} style={styles.suggestedItem}>
                <Image source={{ uri: match.image }} style={styles.suggestedImage} />
                <View style={styles.suggestedInfo}>
                  <Text style={styles.suggestedName}>{match.name}, {match.age}</Text>
                  <Text style={styles.suggestedLocation}>{match.location}</Text>
                  <View style={styles.suggestedInterests}>
                    {match.interests.filter(interest => 
                      ['Cooking', 'Coffee', 'Food'].includes(interest)
                    ).slice(0, 1).map((interest, i) => (
                      <Text key={i} style={styles.suggestedInterest}>{interest}</Text>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
  },
  emptyTitle: {
    color: COLORS.SECONDARY,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
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
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
    borderRadius: 20,
  },
  nonTopCardInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  suggestionGroup: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginLeft: 8,
  },
  mutualInterestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutualInterestText: {
    color: COLORS.SECONDARY,
    fontSize: 12,
    fontWeight: 'bold',
  },
  mutualInterestCheck: {
    marginLeft: 4,
    color: '#34C759',
  },
  icebreaker: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  icebreakerTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  icebreakerText: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    fontStyle: 'italic',
  },
  matchReasonButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  matchReasonTooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    top: -120,
    left: '10%',
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  matchReasonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 8,
  },
  matchReasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  matchReasonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  streakText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  boostBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  boostText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  likeOverlay: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginTop: 10,
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
  countersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  counterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  counterText: {
    color: COLORS.SECONDARY,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  swipeIndicatorsContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    zIndex: 10,
    pointerEvents: 'none',
  },
  swipeIndicator: {
    alignItems: 'center',
    opacity: 0.3,
  },
  likeIndicator: {
    alignItems: 'flex-start',
  },
  dislikeIndicator: {
    alignItems: 'flex-end',
  },
  activeIndicator: {
    opacity: 1,
  },
  indicatorText: {
    color: COLORS.SECONDARY,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
    perspective: 1000,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    backfaceVisibility: 'hidden',
  },
  stampOverlay: {
    position: 'absolute',
    top: '40%',
    padding: 10,
    borderWidth: 4,
    borderRadius: 10,
    transform: [{ rotate: '-30deg' }],
    zIndex: 999,
  },
  likeStamp: {
    left: 20,
    borderColor: '#34C759',
  },
  dislikeStamp: {
    right: 20,
    borderColor: '#FF3B30',
  },
  stampText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  matchImageContainer: {
    height: '60%',
    position: 'relative',
  },
  matchImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  matchPercentageContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  matchPercentage: {
    color: COLORS.SECONDARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  matchInfo: {
    padding: 16,
    height: '40%',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  matchNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  likeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  matchDistance: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  matchBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 12,
    color: COLORS.SECONDARY,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  cardActionText: {
    color: COLORS.SECONDARY,
    fontSize: 12,
    marginLeft: 4,
  },
  section: {
    padding: 16,
    paddingTop: 8,
    marginTop: 8,
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
  seeAllText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  newMatchesList: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  newMatchItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  newMatchImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.SECONDARY,
  },
  newMatchName: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    marginTop: 8,
  },
  newMatchPercentage: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  viewMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  viewMoreText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  suggestedList: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  suggestedItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginRight: 20,
    width: 260,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  suggestedImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  suggestedInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  suggestedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 4,
  },
  suggestedLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  suggestedInterests: {
    flexDirection: 'row',
  },
  suggestedInterest: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
});

export default MatchesTab;
