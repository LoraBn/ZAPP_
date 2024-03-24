import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import {formatDate} from '../../utils/date-utils';
import {Assignment} from '../../screens/employee-details-screen';

type AssignmentItemProps = {
  item: Assignment;
  index: number;
};

const AssignmentItem = ({item}: AssignmentItemProps) => {
  return (
    <View style={[styles.container]}>
      <Text style={styles.text}>{item.title}</Text>
      <Text style={styles.text}>{formatDate(item.date)}</Text>
      <Text style={styles.text}>{item.status}</Text>
    </View>
  );
};

export default AssignmentItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Black,
  },
  text: {
    color: Colors.Black,
    fontWeight: '700',
  },
});
