import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Card from './card';
import { Colors } from '../../utils/colors';
import client from '../../API/client';
import { useUser } from '../../storage/use-user';
import { useCountdown } from '../../hooks/use-countdown';

export type Schedule = {
  schedule_id: string;
  owner_id: number;
  schedule: {
    id: string;
    time_to_turn_on: string;
    time_to_turn_off: string;
  }[];
};

const TimeRemaining = () => {
  const date = useCountdown();
  const { type, accessToken } = useUser(state => state);
  const [scheduleData, setScheduleData] = useState<Schedule[]>([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await client.get(`/customer/electric-schedule`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      console.log(response.data.schedule);
      if (response.data.schedule.length > 0) {
        setScheduleData(response.data.schedule);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const calculateRemainingTime = () => {
    const currentTime = new Date().getTime();
    let nextScheduleTime = Infinity;

    for (const scheduleItem of scheduleData) {
      for (const item of scheduleItem.schedule) {
        const startTime = new Date(item.time_to_turn_on).getTime();
        const endTime = new Date(item.time_to_turn_off).getTime();

        if (startTime <= currentTime && currentTime <= endTime) {
          return formatTime(endTime - currentTime);
        }

        if (currentTime < startTime && startTime < nextScheduleTime) {
          nextScheduleTime = startTime;
        }
      }
    }

    return formatTime(nextScheduleTime - currentTime);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return `${padZero(hours)} : ${padZero(minutes)} : ${padZero(seconds)}`;
  };
  
  const padZero = (num: number) => {
    return num < 10 ? `0${num}` : `${num}`;
  };
  

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
