import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import {formatDate} from '../../utils/date-utils';
import { ALERT} from '../../screens/user-alert-system';

type AssignmentItemProps = {
  item: ALERT;
  index: number;
};

const AssignmentItem = ({item}: AssignmentItemProps) => {
  return (
    <View style={[styles.container]}>
      <Text style={styles.text}>{item.alert_type}</Text>
      <Text style={styles.text}>{formatDate(item.created_at)}</Text>
      <Text style={styles.text}>{item.is_closed ? 'Closed': 'Open'}</Text>
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
