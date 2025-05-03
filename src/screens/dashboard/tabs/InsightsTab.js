import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/theme';

const InsightsTab = () => {
  const profileViews = 128;
  const likesReceived = 43;
  const matchRate = 68; // percentage
  const profileCompleteness = 85; // percentage
  
  const weeklyData = [
    { day: 'Mon', views: 12 },
    { day: 'Tue', views: 18 },
    { day: 'Wed', views: 25 },
    { day: 'Thu', views: 15 },
    { day: 'Fri', views: 30 },
    { day: 'Sat', views: 42 },
    { day: 'Sun', views: 22 },
  ];
  
  const maxViews = Math.max(...weeklyData.map(item => item.views));
  
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Insights</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={COLORS.SECONDARY} />
        </TouchableOpacity>
      </View>
      
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
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Profile Activity</Text>
          <TouchableOpacity>
            <Text style={styles.cardAction}>Details</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.activityStats}>
          <View style={styles.activityStat}>
            <Text style={styles.activityStatValue}>{profileViews}</Text>
            <Text style={styles.activityStatLabel}>Profile Views</Text>
          </View>
          <View style={styles.activityStat}>
            <Text style={styles.activityStatValue}>{likesReceived}</Text>
            <Text style={styles.activityStatLabel}>Likes Received</Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Profile Views</Text>
          <View style={styles.chart}>
            {weeklyData.map((item, index) => (
              <View key={index} style={styles.chartColumn}>
                <View 
                  style={[
                    styles.chartBar, 
                    { 
                      height: `${(item.views / maxViews) * 100}%`,
                      backgroundColor: item.views === maxViews ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                    }
                  ]} 
                />
                <Text style={styles.chartLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Improve Your Profile</Text>
        </View>
        
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="camera" size={20} color={COLORS.SECONDARY} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Add more photos</Text>
              <Text style={styles.tipDescription}>
                Profiles with 4+ photos get 40% more matches
              </Text>
            </View>
            <TouchableOpacity style={styles.tipAction}>
              <Text style={styles.tipActionText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="text" size={20} color={COLORS.SECONDARY} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Complete your bio</Text>
              <Text style={styles.tipDescription}>
                A detailed bio increases your chances by 30%
              </Text>
            </View>
            <TouchableOpacity style={styles.tipAction}>
              <Text style={styles.tipActionText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="heart" size={20} color={COLORS.SECONDARY} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Add more interests</Text>
              <Text style={styles.tipDescription}>
                Shared interests are the #1 conversation starter
              </Text>
            </View>
            <TouchableOpacity style={styles.tipAction}>
              <Text style={styles.tipActionText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  cardAction: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  activityStat: {
    alignItems: 'center',
  },
  activityStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  activityStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  chart: {
    flexDirection: 'row',
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 2,
  },
  tipDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tipAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginLeft: 8,
  },
  tipActionText: {
    fontSize: 12,
    color: COLORS.SECONDARY,
    fontWeight: 'bold',
  },
});

export default InsightsTab;
