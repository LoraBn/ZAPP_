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
    const currentTimeHours = currentTime.getHours() +16;
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
        }

        
      }
    }
    
    const {closestSchedule} = findTheClosestSchedule(schedule)

    console.log(closestSchedule)
    // If no schedule found for today, return default values
    return '00:00:00';
  };

  const padZero = (num: number) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  const findTheClosestSchedule = (scheduleData) => {

    let closestTime = Infinity;

    let closestSchedule = [];

    const currentTime = new Date();
    const currentTimeHours = currentTime.getHours();
    const currentTimeMinutes = currentTime.getMinutes();
    const currentTimeSeconds = currentTime.getSeconds();

    const elapsedCur =
        currentTimeHours * 3600 +
        currentTimeMinutes * 60 +
        currentTimeSeconds;

    for (const scheduleItem of scheduleData) {
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

            if (elapsedCur <= elapsedStart) {
                const remaining = elapsedStart - elapsedCur;
                if (remaining < closestTime) {
                    closestTime = remaining;
                    closestSchedule = [item];
                }
            }

            else{
              const remaining = 24 * 3600 + elapsedCur - elapsedStart
                if (remaining < closestTime) {
                    closestTime = remaining;
                    closestSchedule = [item];
                }
                console.log(remaining)
            }
        }
    }
    return { closestSchedule};
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
