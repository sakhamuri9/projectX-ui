import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const Fireworks = ({ play = false, style }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (play && animationRef.current && Platform.OS !== 'web') {
      animationRef.current.play();
    }
  }, [play]);

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <LottieView
        ref={animationRef}
        source={require('../../assets/fireworks.json')}
        style={styles.animation}
        autoPlay={play}
        loop={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 1,
    pointerEvents: 'none',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default Fireworks;
