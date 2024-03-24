import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Card from './card';
import {Employee} from '../../screens/users-dashboard';
import {Colors} from '../../utils/colors';

type EmployeeBillingListItemProps = {
  item: Employee;
  index: number;
};

const EmployeeBillingListItem = ({item}: EmployeeBillingListItemProps) => {
  return (
    <Card style={styles.cardContainer}>
      <Text style={styles.text}>{item.name}</Text>
      <View style={styles.permContainer}>
        {item.permissions.map(perm => (
          <Text key={perm} style={styles.detailText}>
            {perm}
          </Text>
        ))}
      </View>
    </Card>
  );
};

export default EmployeeBillingListItem;

const styles = StyleSheet.create({
  permContainer: {flexDirection: 'row', gap: 5},
  cardContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: Colors.Black,
    fontSize: 24,
    lineHeight: 24 * 1.3,
    fontWeight: '700',
  },
  detailText: {
    color: Colors.Black,
    fontSize: 15,
    lineHeight: 15 * 1.3,
    fontWeight: '700',
  },
});
