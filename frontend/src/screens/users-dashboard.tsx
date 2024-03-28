import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../utils/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Card from '../components/ui/card';
import SearchTextInput from '../components/ui/search-text-input';
import ListSeperator from '../components/ui/list-seperator';
import EmployeeListItem from '../components/ui/employee-list-item';
import UserListItem from '../components/ui/user-list-item';
import {StackScreenProps} from '@react-navigation/stack';
import {UsersStackNavigationParams} from '../navigation/users-stack-navigation';
import ScreenHeader from '../components/ui/screen-header';
import {useUser} from '../storage/use-user';
import client from '../API/client';

export const USERS_FILTERS = ['Done', 'Not Done', 'Pending'];
export const EMPLOYEE_FILTERS = ['Paid', 'Not Paid'];

export interface User {
  customer_id: number;
  name: string;
  last_name: string;
  username: string;
  amount_to_pay: number;
  paid: number;
  due_date: Date;
  address: string;
  remark: string;
  plan: '10Amp' | '5Amp' | '2Amp' | '20Amp';
  payment_type: 'Fixed' | 'Not Fixed';
  profile_picture: string | null;
  created_at: Date;
  phone_number: number;
}

export interface Employee {
  employee_id: number;
  name: string;
  username: string;
  permissions: string[];
  address: string;
  remark: string;
  salary: number;
  profile_picture: string | null;
  role: string;
  created_at: Date;
}

export const DUMMY_USERS: User[] = [
  {
    id: 1,
    due_date: new Date('2024-03-13'),
    address: 'Hone',
    amount_to_pay: 100,
    name: 'Test',
    paid: 24,
    payment_type: 'Fixed',
    plan: '10Amp',
    remark: 'Remark',
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

// export const DUMMY_EMPLOYEES: Employee[] = [
//   {
//     id: 1,
//     address: 'Home',
//     name: 'Greeter',
//     permissions: ['admin', 'user', 'owner'],
//     remark: 'Dummy fetch this from api',
//     salary: 1000,
//     profile_picture: null,
//     role: 'admin',
//     date_joined: new Date(),
//   },
//   {
//     id: 2,
//     address: 'Office',
//     name: 'Greetings',
//     permissions: ['owner'],
//     remark: 'Dummy fetch this from api',
//     salary: 2000,
//     profile_picture: null,
//     role: 'normal',
//     date_joined: new Date(),
//   },
// ];

type UsersDashboardProps = StackScreenProps<
  UsersStackNavigationParams,
  'UsersDashboard'
>;

const UsersDashboard = ({navigation}: UsersDashboardProps) => {
  const insets = useSafeAreaInsets();

  const userType = useUser(state => state.type);
  const {accessToken} = useUser(state => state);

  const [usersType, setUsersType] = useState<'customers' | 'employees'>(
    'customers',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [employeeFilters, setEmployeeFilters] = useState<string[]>([]);
  const [isBilling, setIsBilling] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  // Fetch data when the component mounts or filters change

  const fetchUsers = async () => {
    console.log(usersType);
    const responce = await client.get(`/${userType}/${usersType}`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (usersType == 'customers') {
      setCustomers(responce.data.customers);
    } else if (usersType == 'employees') {
      setEmployees(responce.data.employees);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [usersType]);

  return (
    <View
      style={styles.screen}
      onTouchStart={() => {
        Keyboard.dismiss();
      }}>
      <View style={styles.topItemsContainer}>
        <Pressable
          onPress={() => setIsBilling(prevIsBilling => !prevIsBilling)}
          style={[
            styles.elevatedCardBillingStyle,
            {marginTop: insets.top + 15},
          ]}>
          <Text style={styles.elevatedCardText}>
            {isBilling ? 'Stop Billing' : 'Start Billing'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('AddUserOrEmployee', {})}
          style={[styles.elevatedCardAddStyle, {marginTop: insets.top + 15}]}>
          <Text style={styles.elevatedCardText}>ADD</Text>
        </Pressable>
        <View style={[styles.topTextContainer, {paddingTop: insets.top + 15}]}>
          <ScreenHeader>
            {usersType === 'customers' ? 'Customers' : 'Employees'}
          </ScreenHeader>
        </View>
        <View style={styles.empUsersContainer}>
          {userType === 'owner' && (
            <Card
              onPress={() => setUsersType('employees')}
              style={styles.cardContainer}
              selected={usersType === 'employees'}>
              <Text style={styles.text}>Employees</Text>
            </Card>
          )}
          <Card
            onPress={() => setUsersType('customers')}
            style={styles.cardContainer}
            selected={usersType === 'customers'}>
            <Text style={styles.text}>Customers</Text>
          </Card>
        </View>
        <SearchTextInput value={searchQuery} setValue={setSearchQuery} />
        <View style={styles.h10} />
        {usersType === 'customers' ? (
          <View style={styles.filtersContainer}>
            {USERS_FILTERS.map(item => (
              <Card
                key={item}
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
            ))}
          </View>
        ) : (
          <View style={styles.filtersContainer}>
            {EMPLOYEE_FILTERS.map(item => (
              <Card
                key={item}
                onPress={() => {
                  const alreadySelected = employeeFilters.find(
                    fil => fil === item,
                  );

                  if (alreadySelected) {
                    return setEmployeeFilters(prevFilters => [
                      ...prevFilters.filter(it => it !== item),
                    ]);
                  }
                  return setEmployeeFilters(prevFilters => [
                    ...prevFilters,
                    item,
                  ]);
                }}
                selected={!!employeeFilters.find(fil => fil === item)}
                style={styles.cardContainer}>
                <Text style={styles.text}>{item}</Text>
              </Card>
            ))}
          </View>
        )}
      </View>
      <View style={styles.h10} />
      <FlatList
        contentContainerStyle={styles.topItemsContainer}
        data={usersType === 'customers' ? customers : employees}
        renderItem={props => {
          if (usersType === 'employees') {
            return <EmployeeListItem {...props} />;
          }

          return <UserListItem {...props} isBilling={isBilling} />;
        }}
        ItemSeparatorComponent={ListSeperator}
      />
    </View>
  );
};

export default UsersDashboard;

const styles = StyleSheet.create({
  elevatedCardText: {color: Colors.White, fontSize: 14, fontWeight: '700'},
  elevatedCardBillingStyle: {
    position: 'absolute',
    padding: 5,
    paddingHorizontal: 15,
    left: 15,
    borderRadius: 100,
    backgroundColor: Colors.Blue,
    zIndex: 200,
  },
  elevatedCardAddStyle: {
    position: 'absolute',
    padding: 5,
    paddingHorizontal: 15,
    right: 15,
    borderRadius: 100,
    backgroundColor: Colors.Blue,
    zIndex: 200,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
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
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
});
