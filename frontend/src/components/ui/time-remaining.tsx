import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Card from './card';
import {Colors} from '../../utils/colors';
import client from '../../API/client';
import {useUser} from '../../storage/use-user';
import {useCountdown} from '../../hooks/use-countdown';

export type Schedule = {
  schedule_id: string;
  owner_id: number;
  schedule: {
    id: string;
    time_to_turn_on: string;
    time_to_turn_off: string;
  }[];
};

const TimeRemaining = ({schedule}) => {
  const date = useCountdown();

  const calculateRemainingTime = () => {
    const currentTime = new Date();
    const currentTimeHours = currentTime.getHours();
    const currentTimeMinutes = currentTime.getMinutes();
    const currentTimeSeconds = currentTime.getSeconds();

    for (const scheduleItem of schedule) {
      for (const item of scheduleItem.schedule) {
        const startTime = new Date(item.time_to_turn_on);
        const endTime = new Date(item.time_to_turn_off);

        const startTimeHours = startTime.getHours();
        const startTimeMinutes = startTime.getMinutes();
        const startTimeSeconds = startTime.getSeconds();

        const endTimeHours = endTime.getHours();
        const endTimeMinutes = endTime.getMinutes();
        const endTimeSeconds = endTime.getSeconds();

        const elapsedStart =
          startTimeHours * 3600 + startTimeMinutes * 60 + startTimeSeconds;
        const elapsedEnd =
          endTimeHours * 3600 + endTimeMinutes * 60 + endTimeSeconds;
        const elapsedCur =
          currentTimeHours * 3600 +
          currentTimeMinutes * 60 +
          currentTimeSeconds;

        if (elapsedStart <= elapsedCur && elapsedCur <= elapsedEnd) {
          const remaining = elapsedEnd - elapsedCur;
          return formatElapsedTime(remaining);
        } else if (elapsedCur < elapsedStart) {
          const remaining = elapsedStart - elapsedCur;
          return formatElapsedTime(remaining);
        } else if (elapsedCur > elapsedEnd) {
          const remaining = 24*3600 - elapsedCur + elapsedStart ;
          return formatElapsedTime(remaining);
        }
      }
    }

    // If no schedule found for tomorrow, return default values
    return '00:00:00';
  };

  const padZero = (num: number) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  function formatElapsedTime(elapsedTime) {
    let hours = Math.floor(elapsedTime / 3600);
    let minutes = Math.floor((elapsedTime % 3600) / 60);
    let seconds = Math.floor(elapsedTime % 60);
    return `${padZero(hours)} : ${padZero(minutes)} : ${padZero(seconds)}`;
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.timeRemainingText}>Time Remaining</Text>
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{calculateRemainingTime()}</Text>
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
    fontSize: 45,
    fontWeight: '700',
    color: Colors.Black,
  },
  timeContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
