import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const defaultAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 512,
  h: 512,
  nm: "Fireworks Fallback",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [100] },
            { t: 30, s: [100], e: [0] },
            { t: 60, s: [0] }
          ]
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [256, 256, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [0, 0, 100], e: [100, 100, 100] },
            { t: 30, s: [100, 100, 100], e: [0, 0, 100] },
            { t: 60, s: [0, 0, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "el",
          d: 1,
          s: { a: 0, k: [100, 100] },
          p: { a: 0, k: [0, 0] }
        },
        {
          ty: "fl",
          c: { a: 0, k: [1, 1, 1, 1] },
          o: { a: 0, k: 100 }
        }
      ]
    }
  ]
};

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
        source={defaultAnimation}
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
