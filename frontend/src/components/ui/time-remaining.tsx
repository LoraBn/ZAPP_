import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Card from './card';
import {Colors} from '../../utils/colors';
import {useCountdown} from '../../hooks/use-countdown';

const TimeRemaining = () => {
  const date = useCountdown();

  // FORMAT THEDATE AS YOU WISH :)
  return (
    <Card style={styles.container}>
      <Text style={styles.timeRemainingText}>Time Remaining</Text>
      <View style={styles.timeContainer}>
        <Text
          style={
            styles.time
          }>{`${date.days}:${date.hours}:${date.minutes}:${date.seconds}`}</Text>
      </View>
    </Card>
  );
};

export default TimeRemaining;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRemainingText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Black,
  },
  time: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.Black,
  },
  timeContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
