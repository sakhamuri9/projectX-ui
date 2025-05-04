import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../../styles/theme';
import { PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InsightsTab = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [profileViews, setProfileViews] = useState(0);
  const [likesReceived, setLikesReceived] = useState(0);
  const [matchRate, setMatchRate] = useState(0);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [personalityData, setPersonalityData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [completionTasks, setCompletionTasks] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [topPhoto, setTopPhoto] = useState(null);
  const [vibeRatings, setVibeRatings] = useState([]);
  const [boostRecommendation, setBoostRecommendation] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  
  const screenWidth = Dimensions.get('window').width;
  
  const fetchInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userId = await AsyncStorage.getItem('userId') || '1';
      
      const performanceResponse = await ApiService.insights.getProfilePerformance();
      
      if (performanceResponse && performanceResponse.data) {
        const performance = performanceResponse.data;
        
        setProfileViews(performance.views || 128);
        setLikesReceived(performance.likes || 43);
        setMatchRate(performance.matchRate || 68);
        setProfileCompleteness(performance.profileCompleteness || 85);
      }
      
      const personalityResponse = await ApiService.insights.getPersonalityInsights();
      
      if (personalityResponse && personalityResponse.data) {
        setPersonalityData(personalityResponse.data.map(item => ({
          name: item.trait,
          population: item.percentage,
          color: item.color || getRandomColor(),
          legendFontColor: '#FFF',
          legendFontSize: 12,
        })));
      } else {
        setPersonalityData([
          {
            name: 'Creative',
            population: 35,
            color: '#FF6B6B',
            legendFontColor: '#FFF',
            legendFontSize: 12,
          },
          {
            name: 'Ambitious',
            population: 40,
            color: '#4ECDC4',
            legendFontColor: '#FFF',
            legendFontSize: 12,
          },
          {
            name: 'Adventurous',
            population: 25,
            color: '#FFD166',
            legendFontColor: '#FFF',
            legendFontSize: 12,
          },
        ]);
      }
      
      const locationResponse = await ApiService.insights.getLocationHeatmap();
      
      if (locationResponse && locationResponse.data) {
        setLocationData(locationResponse.data.map(item => ({
          city: item.location,
          views: item.views,
          percentage: item.percentage,
        })));
      } else {
        setLocationData([
          { city: 'New York', views: 42, percentage: 300 },
          { city: 'Los Angeles', views: 28, percentage: 200 },
          { city: 'Chicago', views: 15, percentage: 100 },
        ]);
      }
      
      const engagementResponse = await ApiService.insights.getEngagementTiming();
      
      if (engagementResponse && engagementResponse.data) {
        setEngagementData(engagementResponse.data);
      } else {
        setEngagementData([
          { day: 'Mon', morning: 5, afternoon: 7, evening: 12, night: 8 },
          { day: 'Tue', morning: 6, afternoon: 8, evening: 15, night: 10 },
          { day: 'Wed', morning: 8, afternoon: 10, evening: 18, night: 12 },
          { day: 'Thu', morning: 7, afternoon: 9, evening: 14, night: 9 },
          { day: 'Fri', morning: 9, afternoon: 12, evening: 22, night: 18 },
          { day: 'Sat', morning: 10, afternoon: 15, evening: 25, night: 20 },
          { day: 'Sun', morning: 8, afternoon: 11, evening: 16, night: 14 },
        ]);
      }
      
      const completionResponse = await ApiService.insights.getProfileCompletionTasks();
      
      if (completionResponse && completionResponse.data) {
        setCompletionTasks(completionResponse.data);
      } else {
        setCompletionTasks([
          { task: 'Add 1 more interest', completed: false },
          { task: 'Upload 1 more photo', completed: false },
          { task: 'Answer 1 prompt', completed: false },
        ]);
      }
      
      const tagsResponse = await ApiService.insights.getTrendingTags();
      
      if (tagsResponse && tagsResponse.data) {
        setTrendingTags(tagsResponse.data.map(item => ({
          tag: item.name,
          popularity: item.popularity,
        })));
      } else {
        setTrendingTags([
          { tag: 'Photography', popularity: 92 },
          { tag: 'Hiking', popularity: 87 },
          { tag: 'Cooking', popularity: 78 },
          { tag: 'Yoga', popularity: 72 },
          { tag: 'Travel', popularity: 68 },
        ]);
      }
      
      const photoResponse = await ApiService.insights.getTopPerformingPhoto();
      
      if (photoResponse && photoResponse.data) {
        setTopPhoto({
          url: photoResponse.data.url,
          likeRate: photoResponse.data.likeRate,
        });
      } else {
        setTopPhoto({
          url: 'https://randomuser.me/api/portraits/men/32.jpg',
          likeRate: 60,
        });
      }
      
      const vibeResponse = await ApiService.insights.getVibeRatings();
      
      if (vibeResponse && vibeResponse.data) {
        setVibeRatings(vibeResponse.data);
      } else {
        setVibeRatings(['Mysterious', 'Stylish', 'Witty']);
      }
      
      const boostResponse = await ApiService.insights.getBoostRecommendation();
      
      if (boostResponse && boostResponse.data) {
        setBoostRecommendation(boostResponse.data);
      } else {
        setBoostRecommendation({
          day: 'Friday',
          time: '8:00 PM',
          multiplier: '10x',
        });
      }
      
      const weeklyResponse = await ApiService.insights.getWeeklyViews();
      
      if (weeklyResponse && weeklyResponse.data) {
        setWeeklyData(weeklyResponse.data);
      } else {
        setWeeklyData([
          { day: 'Mon', views: 12 },
          { day: 'Tue', views: 18 },
          { day: 'Wed', views: 25 },
          { day: 'Thu', views: 15 },
          { day: 'Fri', views: 30 },
          { day: 'Sat', views: 42 },
          { day: 'Sun', views: 22 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError('Failed to load insights data. Please try again.');
      
      setPersonalityData([
        {
          name: 'Creative',
          population: 35,
          color: '#FF6B6B',
          legendFontColor: '#FFF',
          legendFontSize: 12,
        },
        {
          name: 'Ambitious',
          population: 40,
          color: '#4ECDC4',
          legendFontColor: '#FFF',
          legendFontSize: 12,
        },
        {
          name: 'Adventurous',
          population: 25,
          color: '#FFD166',
          legendFontColor: '#FFF',
          legendFontSize: 12,
        },
      ]);
      
      setLocationData([
        { city: 'New York', views: 42, percentage: 300 },
        { city: 'Los Angeles', views: 28, percentage: 200 },
        { city: 'Chicago', views: 15, percentage: 100 },
      ]);
      
      setEngagementData([
        { day: 'Mon', morning: 5, afternoon: 7, evening: 12, night: 8 },
        { day: 'Tue', morning: 6, afternoon: 8, evening: 15, night: 10 },
        { day: 'Wed', morning: 8, afternoon: 10, evening: 18, night: 12 },
        { day: 'Thu', morning: 7, afternoon: 9, evening: 14, night: 9 },
        { day: 'Fri', morning: 9, afternoon: 12, evening: 22, night: 18 },
        { day: 'Sat', morning: 10, afternoon: 15, evening: 25, night: 20 },
        { day: 'Sun', morning: 8, afternoon: 11, evening: 16, night: 14 },
      ]);
      
      setCompletionTasks([
        { task: 'Add 1 more interest', completed: false },
        { task: 'Upload 1 more photo', completed: false },
        { task: 'Answer 1 prompt', completed: false },
      ]);
      
      setTrendingTags([
        { tag: 'Photography', popularity: 92 },
        { tag: 'Hiking', popularity: 87 },
        { tag: 'Cooking', popularity: 78 },
        { tag: 'Yoga', popularity: 72 },
        { tag: 'Travel', popularity: 68 },
      ]);
      
      setTopPhoto({
        url: 'https://randomuser.me/api/portraits/men/32.jpg',
        likeRate: 60,
      });
      
      setVibeRatings(['Mysterious', 'Stylish', 'Witty']);
      
      setBoostRecommendation({
        day: 'Friday',
        time: '8:00 PM',
        multiplier: '10x',
      });
      
      setWeeklyData([
        { day: 'Mon', views: 12 },
        { day: 'Tue', views: 18 },
        { day: 'Wed', views: 25 },
        { day: 'Thu', views: 15 },
        { day: 'Fri', views: 30 },
        { day: 'Sat', views: 42 },
        { day: 'Sun', views: 22 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  useEffect(() => {
    fetchInsights();
  }, []);
  
  const maxViews = weeklyData.length > 0 ? Math.max(...weeklyData.map(item => item.views)) : 0;
  
  const shareInsights = async () => {
    try {
      await Share.share({
        message: 'Check out my SoulNest Stats! 💖\n\n' +
                 `Profile Views: ${profileViews}\n` +
                 `Likes: ${likesReceived}\n` +
                 `Match Rate: ${matchRate}%\n\n` +
                 '#SoulNestStats',
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const ProgressRing = ({ percentage, size = 80, strokeWidth = 8, label, value }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <View style={styles.progressRingContainer}>
        <View style={{ width: size, height: size }}>
          <View style={styles.progressRingBackground}>
            <View
              style={[
                styles.progressRingCircle,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: strokeWidth,
                },
              ]}
            />
          </View>
          <View style={styles.progressRingForeground}>
            <View
              style={[
                styles.progressRingCircle,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: strokeWidth,
                  borderColor: COLORS.SECONDARY,
                  borderTopColor: 'transparent',
                  borderRightColor: percentage > 25 ? COLORS.SECONDARY : 'transparent',
                  borderBottomColor: percentage > 50 ? COLORS.SECONDARY : 'transparent',
                  borderLeftColor: percentage > 75 ? COLORS.SECONDARY : 'transparent',
                  transform: [{ rotateZ: `-${percentage * 3.6}deg` }],
                },
              ]}
            />
          </View>
          <View style={styles.progressRingContent}>
            <Text style={styles.progressRingValue}>{value}</Text>
          </View>
        </View>
        <Text style={styles.progressRingLabel}>{label}</Text>
      </View>
    );
  };
  
  const EngagementTimeBlock = ({ value, maxValue, isHighest }) => {
    const intensity = Math.min(value / maxValue, 1);
    const backgroundColor = isHighest 
      ? 'rgba(255, 255, 255, 0.9)' 
      : `rgba(255, 255, 255, ${0.2 + intensity * 0.6})`;
    
    return (
      <View 
        style={[
          styles.timeBlock, 
          { backgroundColor }
        ]} 
      />
    );
  };
  
  const ShareableCard = ({ visible, onClose }) => {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.shareableCard}>
            <View style={styles.shareableCardHeader}>
              <Text style={styles.shareableCardTitle}>SoulNest Stats</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.SECONDARY} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.shareableCardContent}>
              <View style={styles.shareableStat}>
                <Ionicons name="eye" size={24} color={COLORS.SECONDARY} />
                <Text style={styles.shareableStatValue}>{profileViews}</Text>
                <Text style={styles.shareableStatLabel}>Profile Views</Text>
              </View>
              
              <View style={styles.shareableStat}>
                <Ionicons name="heart" size={24} color={COLORS.SECONDARY} />
                <Text style={styles.shareableStatValue}>{likesReceived}</Text>
                <Text style={styles.shareableStatLabel}>Likes</Text>
              </View>
              
              <View style={styles.shareableStat}>
                <Ionicons name="flash" size={24} color={COLORS.SECONDARY} />
                <Text style={styles.shareableStatValue}>{matchRate}%</Text>
                <Text style={styles.shareableStatLabel}>Match Rate</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.shareButton} onPress={() => {
              onClose();
              shareInsights();
            }}>
              <Text style={styles.shareButtonText}>Share Stats</Text>
              <Ionicons name="share-social" size={18} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            
            <Text style={styles.shareableCardFooter}>#SoulNestStats</Text>
          </View>
        </View>
      </Modal>
    );
  };
  
  const PhotoModal = ({ visible, onClose, photo }) => {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.photoModalCard}>
            <View style={styles.photoModalHeader}>
              <Text style={styles.photoModalTitle}>Your Top-Performing Photo</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.SECONDARY} />
              </TouchableOpacity>
            </View>
            
            <Image source={{ uri: photo.url }} style={styles.fullSizePhoto} />
            
            <Text style={styles.photoModalStats}>
              This photo gets you {photo.likeRate}% more right swipes
            </Text>
            
            <TouchableOpacity style={styles.setAsDefaultButton}>
              <Text style={styles.setAsDefaultButtonText}>Set as Profile Picture</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.SECONDARY} />
        <Text style={styles.loadingText}>Loading insights...</Text>
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
          onPress={fetchInsights}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Insights</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.shareInsightButton}
            onPress={() => setShowShareModal(true)}
          >
            <Ionicons name="share-social" size={20} color={COLORS.SECONDARY} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchInsights}
          >
            <Ionicons name="refresh" size={20} color={COLORS.SECONDARY} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>This Week's Summary</Text>
        <Text style={styles.summarySubtitle}>May 1 - May 7</Text>
        
        <View style={styles.statsRow}>
          <ProgressRing 
            percentage={matchRate} 
            label="Match Rate" 
            value={`${matchRate}%`} 
          />
          <ProgressRing 
            percentage={profileCompleteness} 
            label="Profile" 
            value={`${profileCompleteness}%`} 
          />
          <ProgressRing 
            percentage={(likesReceived / profileViews) * 100} 
            label="Like Rate" 
            value={`${Math.round((likesReceived / profileViews) * 100)}%`} 
          />
        </View>
      </View>
      
      {/* 1. Match Personality Insights */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Match Personality Insights</Text>
          <TouchableOpacity>
            <Text style={styles.cardAction}>Details</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.cardSubtitle}>
          Who's viewing your profile — and what type they are?
        </Text>
        
        <View style={styles.pieChartContainer}>
          <PieChart
            data={personalityData}
            width={screenWidth - 64}
            height={180}
            chartConfig={{
              backgroundColor: COLORS.PRIMARY,
              backgroundGradientFrom: COLORS.PRIMARY,
              backgroundGradientTo: COLORS.PRIMARY,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
        
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationTitle}>Recommended Matches:</Text>
          <View style={styles.recommendationTags}>
            <View style={[styles.recommendationTag, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}>
              <Text style={styles.recommendationTagText}>Sarah, Creative</Text>
            </View>
            <View style={[styles.recommendationTag, { backgroundColor: 'rgba(78, 205, 196, 0.2)' }]}>
              <Text style={styles.recommendationTagText}>Michael, Ambitious</Text>
            </View>
            <View style={[styles.recommendationTag, { backgroundColor: 'rgba(255, 209, 102, 0.2)' }]}>
              <Text style={styles.recommendationTagText}>Emma, Adventurous</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* 2. Location Heatmap */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Location Heatmap</Text>
        </View>
        
        <Text style={styles.cardSubtitle}>
          Where are most of your profile views coming from?
        </Text>
        
        <View style={styles.locationList}>
          {locationData.map((location, index) => (
            <View key={index} style={styles.locationItem}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationCity}>{location.city}</Text>
                <Text style={styles.locationViews}>{location.views} views</Text>
              </View>
              <View style={styles.locationBar}>
                <View 
                  style={[
                    styles.locationBarFill, 
                    { width: `${(location.percentage / 300) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.locationInsight}>
          <Ionicons name="flame" size={20} color="#FF6B6B" />
          <Text style={styles.locationInsightText}>
            People near New York view your profile 3x more often
          </Text>
        </View>
      </View>
      
      {/* 3. Engagement Timing Graph */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Engagement Timing</Text>
        </View>
        
        <Text style={styles.cardSubtitle}>
          Best times to get noticed?
        </Text>
        
        <View style={styles.timingContainer}>
          <View style={styles.timingLabels}>
            <Text style={styles.timingLabel}>Morning</Text>
            <Text style={styles.timingLabel}>Afternoon</Text>
            <Text style={styles.timingLabel}>Evening</Text>
            <Text style={styles.timingLabel}>Night</Text>
          </View>
          
          <View style={styles.timingGrid}>
            {engagementData.map((day, dayIndex) => (
              <View key={dayIndex} style={styles.timingColumn}>
                <Text style={styles.timingDay}>{day.day}</Text>
                <View style={styles.timingBlocks}>
                  {Object.entries(day)
                    .filter(([key]) => key !== 'day')
                    .map(([timeOfDay, value], timeIndex) => {
                      const maxValue = Math.max(
                        ...engagementData.map(d => d[timeOfDay])
                      );
                      const isHighest = value === maxValue && maxValue > 15;
                      
                      return (
                        <EngagementTimeBlock 
                          key={timeIndex}
                          value={value}
                          maxValue={25}
                          isHighest={isHighest}
                        />
                      );
                    })}
                </View>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.timingInsight}>
          <Ionicons name="time" size={20} color="#4ECDC4" />
          <Text style={styles.timingInsightText}>
            Post stories at 8PM on Friday for max exposure
          </Text>
        </View>
      </View>
      
      {/* 4. Profile Completion Score */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Profile Completion</Text>
        </View>
        
        <View style={styles.completionScoreContainer}>
          <View style={styles.completionScoreCircle}>
            <Text style={styles.completionScoreValue}>{profileCompleteness}%</Text>
          </View>
          <View style={styles.completionDetails}>
            <Text style={styles.completionTitle}>Almost there!</Text>
            <Text style={styles.completionSubtitle}>Complete these tasks:</Text>
          </View>
        </View>
        
        <View style={styles.completionTasks}>
          {completionTasks.map((task, index) => (
            <View key={index} style={styles.completionTask}>
              <View style={styles.completionCheckbox}>
                {task.completed ? (
                  <Ionicons name="checkmark" size={16} color={COLORS.PRIMARY} />
                ) : null}
              </View>
              <Text style={styles.completionTaskText}>{task.task}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* 5. Trending Profile Tags */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Trending Profile Tags</Text>
        </View>
        
        <Text style={styles.cardSubtitle}>
          What's popular this week in your region?
        </Text>
        
        <View style={styles.trendingTagsContainer}>
          {trendingTags.map((tag, index) => (
            <View key={index} style={styles.trendingTagItem}>
              <View style={styles.trendingTagInfo}>
                <Text style={styles.trendingTagName}>{tag.tag}</Text>
                <View style={styles.trendingTagPopularity}>
                  <Ionicons 
                    name="trending-up" 
                    size={14} 
                    color={COLORS.SECONDARY} 
                    style={styles.trendingIcon}
                  />
                  <Text style={styles.trendingTagScore}>{tag.popularity}%</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.addTagButton}>
                <Text style={styles.addTagButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      
      {/* 6. Most-Liked Photo Suggestion */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Most-Liked Photo</Text>
        </View>
        
        <Text style={styles.cardSubtitle}>
          This photo gets you {topPhoto.likeRate}% more right swipes
        </Text>
        
        <TouchableOpacity 
          style={styles.topPhotoContainer}
          onPress={() => setShowPhotoModal(true)}
        >
          <Image 
            source={{ uri: topPhoto.url }} 
            style={styles.topPhoto}
          />
          <View style={styles.topPhotoOverlay}>
            <Text style={styles.topPhotoText}>View Full Size</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.setAsProfileButton}>
          <Text style={styles.setAsProfileButtonText}>Set as Profile Picture</Text>
        </TouchableOpacity>
      </View>
      
      {/* 7. Vibe Rating */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Your Vibe</Text>
        </View>
        
        <View style={styles.vibeContainer}>
          {vibeRatings.map((vibe, index) => (
            <View key={index} style={styles.vibeTag}>
              <Text style={styles.vibeTagText}>{vibe}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.vibeDescription}>
          Based on match feedback and interaction patterns
        </Text>
      </View>
      
      {/* 8. Boost Recommendation */}
      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.05)']}
          style={styles.boostCard}
        >
          <View style={styles.boostHeader}>
            <Ionicons name="flash" size={24} color="#FF6B6B" />
            <Text style={styles.boostTitle}>Boost Recommendation</Text>
          </View>
          
          <Text style={styles.boostDescription}>
            Boost now to reach {boostRecommendation.multiplier} more people!
          </Text>
          
          <View style={styles.boostDetails}>
            <View style={styles.boostDetail}>
              <Ionicons name="calendar" size={16} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.boostDetailText}>{boostRecommendation.day}</Text>
            </View>
            <View style={styles.boostDetail}>
              <Ionicons name="time" size={16} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.boostDetailText}>{boostRecommendation.time}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.boostButton}>
            <Text style={styles.boostButtonText}>Boost Now</Text>
            <Ionicons name="flash" size={16} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
      
      {/* 9. Shareable Insight Card Button */}
      <TouchableOpacity 
        style={styles.shareInsightsButton}
        onPress={() => setShowShareModal(true)}
      >
        <Ionicons name="share-social" size={20} color={COLORS.PRIMARY} />
        <Text style={styles.shareInsightsButtonText}>Share Your Stats</Text>
      </TouchableOpacity>
      
      {/* Modals */}
      <ShareableCard 
        visible={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />
      
      <PhotoModal 
        visible={showPhotoModal} 
        onClose={() => setShowPhotoModal(false)} 
        photo={topPhoto} 
      />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareInsightButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  progressRingContainer: {
    alignItems: 'center',
  },
  progressRingBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingForeground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingCircle: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ rotateZ: '-90deg' }],
  },
  progressRingContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  progressRingLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  card: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  cardAction: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  pieChartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  recommendationsContainer: {
    marginTop: 16,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 8,
  },
  recommendationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recommendationTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  recommendationTagText: {
    fontSize: 12,
    color: COLORS.SECONDARY,
    fontWeight: '500',
  },
  
  locationList: {
    marginVertical: 16,
  },
  locationItem: {
    marginBottom: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  locationCity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  locationViews: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  locationBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  locationBarFill: {
    height: '100%',
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 3,
  },
  locationInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  locationInsightText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
  },
  
  timingContainer: {
    marginVertical: 16,
  },
  timingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  timingLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    width: '25%',
    textAlign: 'center',
  },
  timingGrid: {
    flexDirection: 'row',
    height: 120,
    justifyContent: 'space-between',
  },
  timingColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timingDay: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  timingBlocks: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  timeBlock: {
    flex: 1,
    margin: 1,
    borderRadius: 2,
  },
  timingInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  timingInsightText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
  },
  
  completionScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  completionScoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 3,
    borderColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  completionScoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  completionDetails: {
    flex: 1,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 4,
  },
  completionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  completionTasks: {
    marginTop: 8,
  },
  completionTask: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  completionTaskText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  trendingTagsContainer: {
    marginVertical: 16,
  },
  trendingTagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  trendingTagInfo: {
    flex: 1,
  },
  trendingTagName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 2,
  },
  trendingTagPopularity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingIcon: {
    marginRight: 4,
  },
  trendingTagScore: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  addTagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  addTagButtonText: {
    fontSize: 12,
    color: COLORS.SECONDARY,
    fontWeight: 'bold',
  },
  
  topPhotoContainer: {
    marginVertical: 16,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  topPhoto: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  topPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    alignItems: 'center',
  },
  topPhotoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  setAsProfileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  setAsProfileButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  
  vibeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 16,
  },
  vibeTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  vibeTagText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  vibeDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  
  boostCard: {
    padding: 16,
    borderRadius: 12,
  },
  boostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  boostTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginLeft: 8,
  },
  boostDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  boostDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  boostDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  boostDetailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 6,
  },
  boostButton: {
    backgroundColor: COLORS.SECONDARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  boostButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginRight: 6,
  },
  
  shareInsightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SECONDARY,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  shareInsightsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginLeft: 8,
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  shareableCard: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  shareableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  shareableCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareableCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  shareableStat: {
    alignItems: 'center',
  },
  shareableStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginTop: 8,
    marginBottom: 4,
  },
  shareableStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  shareButton: {
    backgroundColor: COLORS.SECONDARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginRight: 6,
  },
  shareableCardFooter: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  
  photoModalCard: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  photoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  fullSizePhoto: {
    width: '100%',
    height: 350,
    borderRadius: 8,
    marginBottom: 16,
  },
  photoModalStats: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  setAsDefaultButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  setAsDefaultButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
});

export default InsightsTab;
