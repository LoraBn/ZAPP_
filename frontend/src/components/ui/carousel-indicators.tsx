import {StyleSheet, View} from 'react-native';
import React from 'react';
import {SharedValue} from 'react-native-reanimated';
import CarouselIndicator from './carousel-indicator';

type CarouselIndicatorsProps = {
  items?: any[];
  animatedIndex: SharedValue<number>;
};

const CarouselIndicators = ({
  animatedIndex,
  items,
}: CarouselIndicatorsProps) => {
  return (
    <View style={styles.container}>
      {items?.map((item, idx) => (
        <CarouselIndicator
          key={idx}
          animatedIndex={animatedIndex}
          index={idx}
        />
      ))}
    </View>
  );
};

export default CarouselIndicators;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingTop: 25,
  },
});
