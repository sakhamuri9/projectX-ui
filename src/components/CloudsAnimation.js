import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const CloudsAnimation = () => {
  const cloud1Position = useRef(new Animated.Value(-100)).current;
  const cloud2Position = useRef(new Animated.Value(-150)).current;
  const cloud3Position = useRef(new Animated.Value(-80)).current;
  
  const cloud1Opacity = useRef(new Animated.Value(0)).current;
  const cloud2Opacity = useRef(new Animated.Value(0)).current;
  const cloud3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateClouds = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(cloud1Opacity, {
            toValue: 0.4,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(cloud1Position, {
              toValue: width + 100,
              duration: 30000,
              useNativeDriver: true,
            }),
            Animated.timing(cloud1Opacity, {
              toValue: 0,
              duration: 5000,
              delay: 25000,
              useNativeDriver: true,
            }),
          ]),
        ]),
        
        Animated.sequence([
          Animated.delay(5000),
          Animated.timing(cloud2Opacity, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(cloud2Position, {
              toValue: width + 150,
              duration: 40000,
              useNativeDriver: true,
            }),
            Animated.timing(cloud2Opacity, {
              toValue: 0,
              duration: 5000,
              delay: 35000,
              useNativeDriver: true,
            }),
          ]),
        ]),
        
        Animated.sequence([
          Animated.delay(10000),
          Animated.timing(cloud3Opacity, {
            toValue: 0.5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(cloud3Position, {
              toValue: width + 80,
              duration: 35000,
              useNativeDriver: true,
            }),
            Animated.timing(cloud3Opacity, {
              toValue: 0,
              duration: 5000,
              delay: 30000,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        cloud1Position.setValue(-100);
        cloud2Position.setValue(-150);
        cloud3Position.setValue(-80);
        cloud1Opacity.setValue(0);
        cloud2Opacity.setValue(0);
        cloud3Opacity.setValue(0);
        animateClouds();
      });
    };

    animateClouds();
    
    return () => {
      cloud1Position.stopAnimation();
      cloud2Position.stopAnimation();
      cloud3Position.stopAnimation();
      cloud1Opacity.stopAnimation();
      cloud2Opacity.stopAnimation();
      cloud3Opacity.stopAnimation();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Cloud 1 - Wispy cloud at top */}
      <Animated.View 
        style={[
          styles.cloud, 
          styles.cloud1, 
          { 
            transform: [{ translateX: cloud1Position }],
            opacity: cloud1Opacity
          }
        ]} 
      />
      
      {/* Cloud 2 - Wispy cloud in middle */}
      <Animated.View 
        style={[
          styles.cloud, 
          styles.cloud2, 
          { 
            transform: [{ translateX: cloud2Position }],
            opacity: cloud2Opacity
          }
        ]} 
      />
      
      {/* Cloud 3 - Wispy cloud at bottom */}
      <Animated.View 
        style={[
          styles.cloud, 
          styles.cloud3, 
          { 
            transform: [{ translateX: cloud3Position }],
            opacity: cloud3Opacity
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 50,
  },
  cloud1: {
    top: height * 0.1,
    width: 120,
    height: 30,
    borderRadius: 30,
  },
  cloud2: {
    top: height * 0.3,
    width: 180,
    height: 40,
    borderRadius: 40,
  },
  cloud3: {
    top: height * 0.6,
    width: 150,
    height: 35,
    borderRadius: 35,
  },
});

export default CloudsAnimation;
