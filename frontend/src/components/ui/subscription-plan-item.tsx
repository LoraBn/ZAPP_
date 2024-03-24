import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import {Plan} from '../../screens/bills-nav-page';
import {formatDate} from '../../utils/date-utils';

type SubscriptionPlanItemProps = {
  item: Plan;
  index: number;
};

const SubscriptionPlanItem = ({item}: SubscriptionPlanItemProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.userText}>{item.plan}</Text>
      <Text style={styles.alertText}>{`$ ${item.price}`}</Text>
      <Text style={styles.alertText}>{formatDate(item.date)}</Text>
    </View>
  );
};

export default SubscriptionPlanItem;

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
