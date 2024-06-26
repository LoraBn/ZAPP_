import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import {dateFromNow} from '../../utils/date-utils';

type AlertItemProps = {
  item: {
    alert_id: number;
    alert_message: string;
    alert_type: string;
    created_by: string;
    created_at: Date;
  };
  index: number;
};

const AlertItem = ({item}: AlertItemProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.userText}>{item.created_by}</Text>
      <Text style={styles.alertText}>{item.alert_type || item.ticket_message}</Text>
      <Text style={styles.bottomDate}>{dateFromNow(item.created_at)}</Text>
    </View>
  );
};

export default AlertItem;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Black,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  userText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.Black,
  },
  alertText: {fontSize: 10, color: Colors.Black, fontWeight: '400', flex: 1},
  dateContainer: {justifyContent: 'space-between'},
  topDate: {color: Colors.Black, fontWeight: '400', fontSize: 5},
  bottomDate: {
    fontSize: 5,
    color: Colors.Black,
    fontWeight: '700',
    alignSelf: 'flex-end',
  },
});
