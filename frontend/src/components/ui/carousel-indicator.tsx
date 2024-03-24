import {StyleSheet, View} from 'react-native';
import React from 'react';
import Animated, {
  SharedValue,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {Colors} from '../../utils/colors';

type CarouselIndicatorProps = {
  animatedIndex: SharedValue<number>;
  index: number;
};

const CarouselIndicator = ({animatedIndex, index}: CarouselIndicatorProps) => {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      width: 18,
      height: 18,
      backgroundColor: interpolateColor(
        animatedIndex.value,
        [index - 1, index, index + 1],
        [Colors.Gray, Colors.Blue, Colors.Gray],
      ),
      borderRadius: 40,
    };
  });

  return (
    <View style={styles.containerStyle}>
      <Animated.View style={animatedStyles} />
    </View>
  );
};

export default CarouselIndicator;

const styles = StyleSheet.create({
  containerStyle: {
    width: 24,
    height: 24,
    backgroundColor: Colors.Gray,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
