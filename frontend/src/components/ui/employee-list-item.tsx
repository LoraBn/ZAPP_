import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Card from './card';
import {Employee} from '../../screens/users-dashboard';
import {Colors} from '../../utils/colors';
import {useNavigation} from '@react-navigation/native';
import {UsersStackNavigationParams} from '../../navigation/users-stack-navigation';
import {StackNavigationProp} from '@react-navigation/stack';

type EmployeeListItemProps = {
  item: Employee;
  index: number;
};

const EmployeeListItem = ({item}: EmployeeListItemProps) => {
  const navigation =
    useNavigation<
      StackNavigationProp<UsersStackNavigationParams, 'UsersDashboard'>
    >();

  return (
    <Card
      style={styles.cardContainer}
      onPress={() =>
        navigation.navigate('EmployeeDetailsScreen', {employee: item})
      }>
      <Text style={styles.text}>{item.name}</Text>
      <View style={styles.permContainer}>
        <Text style={styles.detailText}>{`$ ${item.salary}`}</Text>
      </View>
    </Card>
  );
};

export default EmployeeListItem;

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
