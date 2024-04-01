import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../utils/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ImageStrings} from '../assets/image-strings';
import {formatDate} from '../utils/date-utils';
import ElevatedCard from '../components/ui/elevated-card';
import Card from '../components/ui/card';
import {BillingStackNavigatorParams} from '../navigation/billing-stack-navigation';
import {StackScreenProps} from '@react-navigation/stack';

type Payment = {
  id: number;
  date: Date;
  status: 'to_be_paid' | 'paid' | 'pending';
  total: number;
};

export const DUMMY_PAYMENTS: Payment[] = [
  {
    id: 1,
    date: new Date('2024-01-24'),
    status: 'to_be_paid',
    total: 200,
  },
  {
    id: 2,
    date: new Date('2024-01-24'),
    status: 'pending',
    total: 100,
  },
  {
    id: 3,
    date: new Date('2024-01-24'),
    status: 'paid',
    total: 100,
  },
  {
    id: 4,
    date: new Date('2024-01-24'),
    status: 'paid',
    total: 100,
  },
  {
    id: 5,
    date: new Date('2024-01-24'),
    status: 'paid',
    total: 100,
  },
];

type BillingAfterChoosingUserProps = StackScreenProps<
  BillingStackNavigatorParams,
  'BillingAfterChoosingUser'
>;

const BillingAfterChoosingUser = ({
  route,
  navigation,
}: BillingAfterChoosingUserProps) => {
  const user = route?.params?.user;

  const insets = useSafeAreaInsets();

  console.log(user);

  return (
    <View
      style={[styles.screen, styles.containerStyle, {paddingTop: insets.top}]}>
      <View style={styles.topItemsContainer}>
        <Image source={{uri: ImageStrings.EditIcon, height: 43, width: 43}} />
        <Image source={{uri: ImageStrings.TrashIcon, height: 21, width: 21}} />
      </View>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.containerStyle, styles.gap15]}>
        <View style={styles.topTextContainer}>
          <Text style={styles.nameText}>
            {user?.name} <Text style={styles.idText}>#{user?.customer_id}</Text>
          </Text>
          <Text style={styles.dateJoinedText}>
            Date Of Bill - {formatDate(user?.created_at)}
          </Text>
        </View>
        <View style={styles.accountsUserNameContainer}>
          <ElevatedCard>{user.phone_number?.toString()}</ElevatedCard>
        </View>
        <View style={styles.accountsUserNameContainer}>
          <ElevatedCard onPress={() => navigation.goBack()}>Save</ElevatedCard>
        </View>
        <Card>
          <View style={styles.h200} />
        </Card>
        <Card>
          <View style={styles.h200} />
        </Card>
      </ScrollView>
    </View>
  );
};

export default BillingAfterChoosingUser;

const styles = StyleSheet.create({
  h200: {height: 200},
  paymentContainerStyle: {width: '100%'},
  usernamesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 13,
    borderStyle: 'dotted',
  },
  text: {color: Colors.Black, fontWeight: '700'},
  accountsUserNameContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  screen: {flex: 1, backgroundColor: Colors.Background},
  containerStyle: {paddingHorizontal: 15},
  gap15: {gap: 15},
  topItemsContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  topTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontWeight: '700',
    fontSize: 24,
    color: Colors.Black,
    lineHeight: 24 * 1.3,
  },
  idText: {fontSize: 14},
  dateJoinedText: {
    fontWeight: '700',
    fontSize: 14,
    color: Colors.Black,
    lineHeight: 14 * 1.3,
  },
});
