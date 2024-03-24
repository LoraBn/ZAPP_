import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Card from './card';
import {Colors} from '../../utils/colors';

const Schedule = () => {
  //REPLACE THE TIME NUMBERS FROM THE API YOU CAN DO THE API CALL HERE
  //OR PASS THE DATES ETC... AS PROPS WHICHEVER YOU PREFER
  //I didnt use the figma date fonts, but feel free to add them
  // They dont look too good to look at
  return (
    <Card style={styles.container}>
      <Text style={styles.ScheduleText}>Schedule</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeNumbersContainer}>
          <Text style={styles.text}>
            00:00
            <Text style={styles.smallText}>Am</Text>
          </Text>
          <Text style={styles.text}>
            00:00
            <Text style={styles.smallText}>Am</Text>
          </Text>
        </View>
        <View style={styles.onOffContainer}>
          <View style={styles.seperatorLeftOrRight} />
          <Text style={styles.smallText}>ON</Text>
          <View style={styles.middleSeperator} />
          <Text style={styles.smallText}>OFF</Text>
          <View style={styles.seperatorLeftOrRight} />
        </View>
        <View style={styles.timeNumbersContainer}>
          <Text style={styles.text}>
            00:00
            <Text style={styles.smallText}>Am</Text>
          </Text>
          <Text style={styles.text}>
            00:00
            <Text style={styles.smallText}>Am</Text>
          </Text>
        </View>
      </View>
      <View style={styles.onOffContainer}>
        <View style={styles.seperatorLeftOrRight} />
        <Text style={styles.smallText}>ON</Text>
        <View style={styles.middleSeperator} />
        <Text style={styles.smallText}>OFF</Text>
        <View style={styles.seperatorLeftOrRight} />
      </View>
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
