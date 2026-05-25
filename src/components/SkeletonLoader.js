import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import colors from '../styles/colors';

export function SkeletonBox({ width = '100%', height = 40, style, shimmer = true }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!shimmer) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: false })
      ])
    ).start();
  }, [shimmer]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1]
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, opacity: shimmer ? opacity : 0.6 },
        style
      ]}
    />
  );
}

export function PatientCardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <SkeletonBox width="30%" height={50} style={{ borderRadius: 8 }} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonBox width="70%" height={14} style={{ marginBottom: 8, borderRadius: 4 }} />
        <SkeletonBox width="50%" height={12} style={{ borderRadius: 4 }} />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 5, renderItem = () => <PatientCardSkeleton /> }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ marginBottom: 12 }}>
          {renderItem()}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.bordas,
    borderRadius: 6
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 12
  }
});
