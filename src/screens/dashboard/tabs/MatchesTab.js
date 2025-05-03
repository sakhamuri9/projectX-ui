import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

const MatchesTab = () => {
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

  const scrollX = new Animated.Value(0);

  const renderMatchCard = (match, index) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });
    
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View 
        key={match.id}
        style={[
          styles.matchCard,
          { 
            transform: [{ scale }],
            opacity,
          }
        ]}
      >
        <View style={styles.matchImageContainer}>
          <Image source={{ uri: match.image }} style={styles.matchImage} />
          <View style={styles.matchPercentageContainer}>
            <Text style={styles.matchPercentage}>{match.matchPercentage}%</Text>
            <Text style={styles.matchText}>Match</Text>
          </View>
        </View>
        
        <View style={styles.matchInfo}>
          <View style={styles.matchNameRow}>
            <Text style={styles.matchName}>{match.name}, {match.age}</Text>
            <TouchableOpacity style={styles.likeButton}>
              <Ionicons name="heart" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.matchLocationRow}>
            <Ionicons name="location-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.matchLocation}>{match.location}</Text>
          </View>
          
          <Text style={styles.matchDistance}>{match.distance}</Text>
          
          <Text style={styles.matchBio} numberOfLines={2}>{match.bio}</Text>
          
          <View style={styles.interestsContainer}>
            {match.interests.map((interest, i) => (
              <View key={i} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.cardActionButton}>
              <MaterialCommunityIcons name="message-text-outline" size={20} color={COLORS.SECONDARY} />
              <Text style={styles.cardActionText}>Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cardActionButton}>
              <Ionicons name="person-outline" size={20} color={COLORS.SECONDARY} />
              <Text style={styles.cardActionText}>Profile</Text>
            </TouchableOpacity>
          </View>
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
      
      <View style={styles.matchesContainer}>
        <Animated.FlatList
          horizontal
          data={matches}
          renderItem={({ item, index }) => renderMatchCard(item, index)}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={styles.matchesList}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
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
  matchesContainer: {
    height: CARD_HEIGHT,
    marginBottom: 16,
  },
  matchesList: {
    paddingHorizontal: 16,
  },
  matchCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  cardActionText: {
    color: COLORS.SECONDARY,
    fontSize: 12,
    marginLeft: 4,
  },
  section: {
    padding: 16,
    paddingTop: 0,
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
    paddingVertical: 8,
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
    paddingVertical: 8,
  },
  suggestedItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    width: 240,
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
