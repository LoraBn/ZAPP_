import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../utils/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Card from '../components/ui/card';
import SearchTextInput from '../components/ui/search-text-input';
import ListSeperator from '../components/ui/list-seperator';
import {StackScreenProps} from '@react-navigation/stack';
import {BillingStackNavigatorParams} from '../navigation/billing-stack-navigation';
import EmployeeBillingListItem from '../components/ui/employee-billing-list-item';
import UserBillingListItem from '../components/ui/user-billing-list-item';

export const USERS_FILTERS = [
  'Pending',
  'Paid',
  'Role',
  'Date',
  'Alphabetical',
];

export interface User {
  id: number;
  name: string;
  amount_to_pay: number;
  paid: number;
  due_date: Date;
  address: string;
  remark: string;
  plan: '10Amp' | '5Amp' | '2Amp' | '20Amp';
  payment_type: 'Fixed' | 'Not Fixed';
  profile_picture: string | null;
  date_joined: Date;
  phone_number: number;
}

export interface Employee {
  id: number;
  name: string;
  permissions: string[];
  address: string;
  remark: string;
  salary: number;
  profile_picture: string | null;
  role: string;
}

export const DUMMY_USERS: User[] = [
  {
    id: 1,
    due_date: new Date('2024-03-13'),
    address: 'Hone',
    amount_to_pay: 100,
    name: 'Jamal',
    paid: 24,
    payment_type: 'Fixed',
    plan: '10Amp',
    remark: 'Dummy fetch this from api',
    profile_picture: null,
    date_joined: new Date('2024-01-30'),
    phone_number: 12312312,
  },
  {
    id: 2,
    due_date: new Date('2024-03-10'),
    address: 'Honike',
    amount_to_pay: 200,
    name: 'Kalvin',
    paid: 200,
    payment_type: 'Fixed',
    plan: '20Amp',
    remark: 'Dummy fetch this from api',
    profile_picture: null,
    date_joined: new Date('2024-01-30'),
    phone_number: 12312312,
  },
];

export const DUMMY_EMPLOYEES: Employee[] = [
  {
    id: 1,
    address: 'Testing',
    name: 'Jeffrrey',
    permissions: ['admin', 'user', 'owner'],
    remark: 'Soo Testing',
    salary: 1000,
    profile_picture: null,
    role: 'admin',
  },
  {
    id: 2,
    address: 'Yemkten bl neit',
    name: 'Jreeette',
    permissions: ['owner'],
    remark: 'Soo Testing',
    salary: 2000,
    profile_picture: null,
    role: 'normal',
  },
];

type BillingManagementProps = StackScreenProps<
  BillingStackNavigatorParams,
  'BillingManagement'
>;

const BillingManagement = ({}: BillingManagementProps) => {
  const insets = useSafeAreaInsets();

  const [usersType, setUsersType] = useState<'users' | 'employees'>(
    'employees',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);

  return (
    <View
      style={styles.screen}
      onTouchStart={() => {
        Keyboard.dismiss();
      }}>
      <View style={styles.topItemsContainer}>
        <View style={[styles.topTextContainer, {paddingTop: insets.top + 15}]}>
          <Text style={styles.titleText}>
            {usersType === 'users' ? 'Users' : 'Employees'}
          </Text>
        </View>
        <View style={styles.empUsersContainer}>
          <View />
          <Card
            onPress={() => setUsersType('employees')}
            style={styles.cardContainer}
            selected={usersType === 'employees'}>
            <Text style={styles.text}>Employees</Text>
          </Card>
          <Card
            onPress={() => setUsersType('users')}
            style={styles.cardContainer}
            selected={usersType === 'users'}>
            <Text style={styles.text}>Users</Text>
          </Card>
          <Pressable
            onPress={() => {
              // navigation.navigate();
            }}>
            <Text style={styles.addStyle}>+</Text>
          </Pressable>
        </View>
        <SearchTextInput value={searchQuery} setValue={setSearchQuery} />
        <View style={styles.h10} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={USERS_FILTERS}
          ItemSeparatorComponent={() => ListSeperator({horizontal: true})}
          renderItem={({item}) => (
            <Card
              onPress={() => {
                const alreadySelected = filters.find(fil => fil === item);

                if (alreadySelected) {
                  return setFilters(prevFilters => [
                    ...prevFilters.filter(it => it !== item),
                  ]);
                }
                return setFilters(prevFilters => [...prevFilters, item]);
              }}
              selected={!!filters.find(fil => fil === item)}
              style={styles.cardContainer}>
              <Text style={styles.text}>{item}</Text>
            </Card>
          )}
        />
      </View>
      <View style={styles.h10} />
      <FlatList
        contentContainerStyle={styles.topItemsContainer}
        data={usersType === 'users' ? DUMMY_USERS : (DUMMY_EMPLOYEES as any)}
        renderItem={props => {
          if (usersType === 'employees') {
            return <EmployeeBillingListItem {...props} />;
          }

          return <UserBillingListItem {...props} />;
        }}
        ItemSeparatorComponent={ListSeperator}
      />
    </View>
  );
};

export default BillingManagement;

const styles = StyleSheet.create({
  h10: {height: 10},
  topItemsContainer: {paddingHorizontal: 15},
  text: {
    color: Colors.Black,
    fontSize: 11,
    lineHeight: 11 * 1.3,
    fontWeight: '700',
  },
  cardContainer: {
    paddingVertical: 1,
  },
  addStyle: {
    color: Colors.Black,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 24 * 1.4,
  },
  screen: {flex: 1, backgroundColor: Colors.Background},
  topTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 24,
    lineHeight: 24 * 1.2,
    fontWeight: '700',
    color: Colors.Black,
  },
  empUsersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
