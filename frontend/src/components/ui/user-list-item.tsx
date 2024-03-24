import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Card from './card';
import {User} from '../../screens/users-dashboard';
import {Colors} from '../../utils/colors';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {UsersStackNavigationParams} from '../../navigation/users-stack-navigation';

type UserListItemProps = {
  item: User;
  index: number;
  isBilling?: boolean;
};

const UserListItem = ({item, isBilling}: UserListItemProps) => {
  const navigation =
    useNavigation<
      StackNavigationProp<UsersStackNavigationParams, 'UsersDashboard'>
    >();

  const isPending = item.amount_to_pay > item.paid;

  return (
    <Card
      style={styles.cardContainer}
      onPress={() => navigation.navigate('UserDetails', {user: item})}>
      <Text style={styles.text}>{item.name}</Text>
      {isBilling && (
        <View
          style={[
            styles.isBillingView,
            {backgroundColor: isPending ? Colors.Red : Colors.Green},
          ]}
        />
      )}
    </Card>
  );
};

export default UserListItem;

const styles = StyleSheet.create({
  isBillingView: {
    height: 25,
    width: 25,
    borderRadius: 4,
  },
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
