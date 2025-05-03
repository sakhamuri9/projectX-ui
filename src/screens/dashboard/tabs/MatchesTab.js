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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../styles/theme';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.85, 400);
const CARD_HEIGHT = Math.min(height * 0.6, CARD_WIDTH * 1.5);
const CARD_STACK_OFFSET = 8; // Offset for stacked cards

const MatchesTab = () => {
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLikeOverlay, setShowLikeOverlay] = useState(false);
  const [showDislikeOverlay, setShowDislikeOverlay] = useState(false);
  
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
  
  useEffect(() => {
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
  
  const swipeLeft = () => {
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
  };
  
  const swipeRight = () => {
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

  const matches = [
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
            <Text style={styles.matchPercentage}>{match.matchPercentage}%</Text>
            <Text style={styles.matchText}>Match</Text>
          </View>
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
              
              <View style={styles.interestsContainer}>
                {match.interests.map((interest, i) => (
                  <View key={i} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Matches</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color={COLORS.SECONDARY} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
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
          <Text style={styles.indicatorText}>LIKE</Text>
        </View>
        
        <View style={[styles.swipeIndicator, styles.dislikeIndicator, showDislikeOverlay && styles.activeIndicator]}>
          <Ionicons name="close-circle" size={40} color="#8E8E93" />
          <Text style={styles.indicatorText}>NOPE</Text>
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
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested For You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedList}
        >
          {matches.slice().reverse().map((match) => (
            <TouchableOpacity key={match.id} style={styles.suggestedItem}>
              <Image source={{ uri: match.image }} style={styles.suggestedImage} />
              <View style={styles.suggestedInfo}>
                <Text style={styles.suggestedName}>{match.name}, {match.age}</Text>
                <Text style={styles.suggestedLocation}>{match.location}</Text>
                <View style={styles.suggestedInterests}>
                  {match.interests.slice(0, 1).map((interest, i) => (
                    <Text key={i} style={styles.suggestedInterest}>{interest}</Text>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
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
