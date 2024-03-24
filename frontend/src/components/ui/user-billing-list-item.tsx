import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Card from './card';
import {User} from '../../screens/users-dashboard';
import {Colors} from '../../utils/colors';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {BillingStackNavigatorParams} from '../../navigation/billing-stack-navigation';

type UserBillingListItemProps = {
  item: User;
  index: number;
};

const UserBillingListItem = ({item}: UserBillingListItemProps) => {
  const navigation =
    useNavigation<
      StackNavigationProp<BillingStackNavigatorParams, 'BillingManagement'>
    >();

  const isPending = item.amount_to_pay > item.paid;

  return (
    <Card
      style={styles.cardContainer}
      onPress={() => {
        navigation.navigate('UserDetails', {user: item});
      }}>
      <Text style={styles.text}>{item.name}</Text>
      <View style={styles.whiteCardStyle}>
        <Text style={styles.detailText}>{isPending ? 'X' : '/'}</Text>
      </View>
    </Card>
  );
};

export default UserBillingListItem;

const styles = StyleSheet.create({
  whiteCardStyle: {
    borderRadius: 5,
    height: 25,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.White,
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
