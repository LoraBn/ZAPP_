import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Payment} from '../../screens/user-details-screen';
import {Colors} from '../../utils/colors';
import {formatDate} from '../../utils/date-utils';

type PaymentItemProps = {
  item: Payment;
  index: number;
};

const PaymentItem = ({item}: PaymentItemProps) => {
  return (
    <View style={[styles.container]}>
      <Text style={styles.text}>$ {item.amount}</Text>
      <Text style={styles.text}>{formatDate(item.expense_date)}</Text>
      <Text style={styles.text}>Paid</Text>
    </View>
  );
};

export default PaymentItem;

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
