import {FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../utils/colors';
import WhiteCard from '../components/ui/white-card';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Card from '../components/ui/card';
import ViewAll from '../components/ui/view-all';
import {StackScreenProps} from '@react-navigation/stack';
import EquipmentItem from '../components/ui/equipment-item';
import {BillingStackNavigatorParams} from '../navigation/billing-stack-navigation';
import {DUMMY_EQUIPMENT} from './owner-home-page';
import SubscriptionPlanItem from '../components/ui/subscription-plan-item';
import ExpensesItem from '../components/ui/expenses-item';
import {User} from './users-dashboard';
import {DUMMY_USERS} from './billing-management';
import BillsItem from '../components/ui/bills-item';

type BillsNavPageProps = StackScreenProps<
  BillingStackNavigatorParams,
  'BillsNavPage'
>;

export type Plan = {
  id: number;
  plan: string;
  price: number;
  date: Date;
};

export type Expense = {
  id: number;
  name: string;
  amount: number;
  description: string;
  date: Date;
};

export type Bill = {
  id: number;
  user: User;
  amount: number;
  status: 'Paid' | 'Partial' | 'Pending';
  date: Date;
};

export const NAMES = ['Simon', 'Jeoffrey', 'Barratheon', 'Linda', 'Stark'];

export const DUMMY_PLANS: Plan[] = [
  {id: 1, plan: '10Amp', price: 200, date: new Date()},
  {id: 2, plan: '5Amp', price: 100, date: new Date()},
  {id: 3, plan: '2Amp', price: 50, date: new Date()},
  {id: 4, plan: '1Amp', price: 25, date: new Date()},
];

export const DUMMY_EXPENSES: Expense[] = [
  {
    id: 1,
    amount: 400,
    description: 'Description',
    name: NAMES[0],
    date: new Date(),
  },
  {
    id: 2,
    amount: 300,
    description: 'Description',
    name: NAMES[3],
    date: new Date(),
  },
  {
    id: 3,
    amount: 200,
    description: 'Description',
    name: NAMES[2],
    date: new Date(),
  },
  {
    id: 4,
    amount: 100,
    description: 'Description',
    name: NAMES[1],
    date: new Date(),
  },
];

export const DUMMY_BILLS: Bill[] = [
  {
    id: 1,
    amount: 100,
    date: new Date('2023-03-23'),
    status: 'Paid',
    user: DUMMY_USERS[0],
  },
  {
    id: 2,
    amount: 200,
    date: new Date('2023-03-23'),
    status: 'Paid',
    user: DUMMY_USERS[0],
  },
  {
    id: 3,
    amount: 300,
    date: new Date('2023-04-23'),
    status: 'Paid',
    user: DUMMY_USERS[0],
  },
  {id: 4, amount: 400, date: new Date(), status: 'Paid', user: DUMMY_USERS[0]},
  {id: 5, amount: 500, date: new Date(), status: 'Paid', user: DUMMY_USERS[0]},
];

const BillsNavPage = ({navigation}: BillsNavPageProps) => {
  const insets = useSafeAreaInsets();

  const isPaid = false;

  // CHANGE DATA FROM API..
  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollViewContent,
        {paddingTop: insets.top + 15},
      ]}
      style={styles.screen}>
      <View style={styles.profitFeesContainer}>
        <Text style={styles.profitText}>Profit</Text>
        <WhiteCard style={styles.amountContainer}>
          <Text style={styles.amountText}>$ 56666</Text>
        </WhiteCard>
        <Text style={styles.profitText}>Fees</Text>
        <WhiteCard
          style={[
            styles.amountContainer,
            {backgroundColor: isPaid ? Colors.Green : Colors.White},
          ]}>
          <Text style={styles.amountText}>{isPaid ? 'PAID' : '$ 100'}</Text>
        </WhiteCard>
      </View>
      <View>
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertTitle}>Subscription Plans</Text>
          <View>
            <View style={styles.h45} />
          </View>
        </View>
        <Card style={styles.alertContainer}>
          <WhiteCard variant="secondary">
            <FlatList
              contentContainerStyle={styles.flatlistContainer}
              data={DUMMY_PLANS}
              scrollEnabled={false}
              renderItem={SubscriptionPlanItem}
              ListFooterComponent={() =>
                ViewAll({
                  onPress: () => navigation.navigate('SubscriptionPlans'),
                })
              }
            />
          </WhiteCard>
        </Card>
      </View>
      <View>
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertTitle}>Equipments</Text>
          <View>
            <View style={styles.h45} />
          </View>
        </View>
        <Card style={styles.alertContainer}>
          <WhiteCard variant="secondary">
            <FlatList
              contentContainerStyle={styles.flatlistContainer}
              data={DUMMY_EQUIPMENT}
              scrollEnabled={false}
              renderItem={EquipmentItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('Equipments')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
      <View>
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertTitle}>Bills</Text>
          <View>
            <View style={styles.h45} />
          </View>
        </View>
        <Card style={styles.alertContainer}>
          <WhiteCard variant="secondary">
            <FlatList
              contentContainerStyle={styles.flatlistContainer}
              data={DUMMY_BILLS}
              scrollEnabled={false}
              renderItem={BillsItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('Bills')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
      <View>
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertTitle}>Expenses</Text>
          <View>
            <View style={styles.h45} />
          </View>
        </View>
        <Card style={styles.alertContainer}>
          <WhiteCard variant="secondary">
            <FlatList
              contentContainerStyle={styles.flatlistContainer}
              data={DUMMY_EXPENSES}
              scrollEnabled={false}
              renderItem={ExpensesItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('Expenses')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
    </ScrollView>
  );
};

export default BillsNavPage;

const styles = StyleSheet.create({
  h45: {height: 45},
  alertContainer: {padding: 20},
  flatlistContainer: {
    paddingTop: 10,
  },
  scrollViewContent: {gap: 15, paddingHorizontal: 15, paddingBottom: 45},
  analyticsText: {
    textAlign: 'center',
    color: Colors.White,
    elevation: 4,
    fontSize: 24,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  name: {color: Colors.White},
  profitFeesContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderStyle: 'dotted',
    gap: 4,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  profitText: {fontSize: 16},
  amountText: {fontWeight: '400', fontSize: 24},
  amountContainer: {
    marginTop: 15,
  },
  alertTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: Colors.Black,
    lineHeight: 16 * 1.3,
  },
  alertTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
