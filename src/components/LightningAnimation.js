import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const LightningAnimation = () => {
  const lightningOpacity1 = useRef(new Animated.Value(0)).current;
  const lightningOpacity2 = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const createLightningFlash = (opacityValue, delay = 0) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacityValue, {
          toValue: 0.7,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.delay(100),
        Animated.timing(opacityValue, {
          toValue: 0.5,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 30,
          useNativeDriver: true,
        }),
      ]);
    };

    const animateLightning = () => {
      const randomDelay = Math.random() * 10000 + 5000;
      
      const useBolt1 = Math.random() > 0.5;
      
      const lightningAnimation = createLightningFlash(
        useBolt1 ? lightningOpacity1 : lightningOpacity2,
        0
      );
      
      lightningAnimation.start(() => {
        setTimeout(animateLightning, randomDelay);
      });
    };

    const initialDelay = Math.random() * 5000 + 2000;
    setTimeout(animateLightning, initialDelay);
    
    return () => {
      lightningOpacity1.stopAnimation();
      lightningOpacity2.stopAnimation();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Lightning bolt 1 */}
      <Animated.View 
        style={[
          styles.lightning, 
          styles.lightning1, 
          { opacity: lightningOpacity1 }
        ]} 
      />
      
      {/* Lightning bolt 2 */}
      <Animated.View 
        style={[
          styles.lightning, 
          styles.lightning2, 
          { opacity: lightningOpacity2 }
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
    zIndex: 2,
    pointerEvents: 'none',
  },
  lightning: {
    position: 'absolute',
    backgroundColor: 'white',
  },
  lightning1: {
    top: height * 0.1,
    left: width * 0.3,
    width: 3,
    height: height * 0.3,
    transform: [{ rotate: '15deg' }],
  },
  lightning2: {
    top: height * 0.2,
    right: width * 0.25,
    width: 2,
    height: height * 0.25,
    transform: [{ rotate: '-10deg' }],
  },
});

export default LightningAnimation;
