import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Card from './card';
import { Colors } from '../../utils/colors';

export type Schedule = {
  schedule_id: string;
  owner_id: number;
  schedule: {
    id: string;
    time_to_turn_on: string;
    time_to_turn_off: string;
  }[];
};

const Schedule = ({schedule}) => {

  return (
    <Card style={styles.container}>
      <Text style={styles.ScheduleText}>Schedule</Text>
      {schedule && schedule.map(scheduleItem => (
        <View key={scheduleItem.schedule_id}>
          {scheduleItem.schedule.map(item => (
            <View key={item.id} style={styles.timeContainer}>
              <View style={styles.timeNumbersContainer}>
                <Text style={styles.text}>
                  {new Date(item.time_to_turn_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.text}>
                  {new Date(item.time_to_turn_off).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.onOffContainer}>
                <View style={styles.seperatorLeftOrRight} />
                <Text style={styles.smallText}>ON</Text>
                <View style={styles.middleSeperator} />
                <Text style={styles.smallText}>OFF</Text>
                <View style={styles.seperatorLeftOrRight} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </Card>
  );
};

export default Schedule;

const styles = StyleSheet.create({
  middleSeperator: {
    flex: 1,
    borderBottomWidth: 1,
    height: 1,
    borderBottomColor: Colors.Black,
    borderStyle: 'dashed',
  },
  seperatorLeftOrRight: {
    width: '5%',
    borderBottomWidth: 1,
    height: 1,
    borderBottomColor: Colors.Black,
    borderStyle: 'dashed',
  },
  onOffContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  text: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Black,
  },
  smallText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.Black,
    marginHorizontal: 15,
  },
  timeNumbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  ScheduleText: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
