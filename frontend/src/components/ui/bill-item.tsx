import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Bill, Payment} from '../../screens/user-details-screen';
import {Colors} from '../../utils/colors';
import {formatDate} from '../../utils/date-utils';

type BillItemProps = {
  item: Bill;
  index: number;
};

const BillItem = ({item}: BillItemProps) => {
  return (
    <View style={[styles.container]}>
      <Text style={styles.text}>$ {Number(item.total_amount)?.toFixed(2)}</Text>
      <Text style={styles.text}>{formatDate(item.billing_date)}</Text>
      <Text style={styles.text}>{item.billing_status}</Text>
    </View>
  );
};

export default BillItem;

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
