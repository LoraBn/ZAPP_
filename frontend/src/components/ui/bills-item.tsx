import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import {Bill} from '../../screens/bills-nav-page';
import {formatDate} from '../../utils/date-utils';

type BillsItemProps = {
  item: Bill;
  index: number;
};

const BillsItem = ({item}: BillsItemProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.userText}>{item.user.name}</Text>
      <Text style={styles.alertText}>{item.status}</Text>
      <View>
        <Text style={styles.alertText}>{`$ ${item.amount}`}</Text>
        <Text style={styles.alertText}>{formatDate(item.date)}</Text>
      </View>
    </View>
  );
};

export default BillsItem;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Black,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  userText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.Black,
  },
  alertText: {
    fontSize: 10,
    color: Colors.Black,
    fontWeight: '400',
    flex: 1,
    textAlign: 'center',
  },
  dateContainer: {justifyContent: 'space-between'},
  topDate: {color: Colors.Black, fontWeight: '400', fontSize: 5},
  bottomDate: {fontSize: 5, color: Colors.Black, fontWeight: '700'},
});
