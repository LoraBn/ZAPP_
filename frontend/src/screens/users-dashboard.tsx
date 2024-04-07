import {
  Alert,
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
import {io} from 'socket.io-client';
import {ioString} from '../API/io';

export const USERS_FILTERS = ['Done', 'Not Done'];
export const EMPLOYEE_FILTERS = [];

export interface User {
  customer_id: number;
  name: string;
  lastName: string;
  username: string;
  amount_to_pay: number;
  paid: number;
  due_date: Date;
  address: string;
  remark: string;
  plan: '10Amp' | '5Amp' | '2Amp' | '20Amp';
  equipment: string | null;
  payment_type: 'Fixed' | 'Not Fixed';
  profile_picture: string | null;
  created_at: Date;
  phone_number: number;
  is_cycled: boolean;
}

export interface Employee {
  employee_id: number;
  name: string;
  lastName: string;
  username: string;
  permissions: string[];
  address: string;
  remark: string;
  salary: number;
  profile_picture: string | null;
  role: string;
  created_at: Date;
}

type UsersDashboardProps = StackScreenProps<
  UsersStackNavigationParams,
  'UsersDashboard'
>;

const UsersDashboard = ({navigation}: UsersDashboardProps) => {
  const insets = useSafeAreaInsets();

  const userType = useUser(state => state.type);
  const {accessToken, socket, setSocket} = useUser(state => state);

  const [usersType, setUsersType] = useState<'customers' | 'employees'>(
    'customers',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [employeeFilters, setEmployeeFilters] = useState<string[]>([]);
  const [isBilling, setIsBilling] = useState(false);

  const [customers, setCustomers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  // Fetch data when the component mounts or filters change

  const [filteredUsers, setFilteredUsers] = useState<any[]>();

  useEffect(() => {
    if (userType !== 'customer') {
      let users = usersType === 'customers' ? customers : employees;
      const filteredUsers = filter(searchQuery, users);
      setFilteredUsers(filteredUsers);
    }
  }, [usersType, searchQuery]);

  const filter = (searchQ: string, users: (User | Employee)[]) => {
    if (!searchQ) {
      return users;
    }
    return users.filter(
      user =>
        user.username.toLowerCase().includes(searchQ.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQ.toLowerCase()),
    );
  };

  const fetchUsers = async () => {
    try {
      const response = await client.get(`/${userType}/${usersType}`, {
        headers: {authorization: `Bearer ${accessToken}`},
      });

      if (usersType === 'customers') {

        
        setCustomers(response.data.customers.filter(
          (customer: User) => {
            if(isBilling && filters.includes("Done")){
              return customer.is_cycled == true
            }
            else{
              return customer.is_cycled == false
            }
          },
        ));
        setFilteredUsers(response.data.customers.filter(
          (customer: User) => {
            if(isBilling && filters.includes("Done")){
              return customer.is_cycled == true
            }
            else{
              return customer.is_cycled == false
            }
          },
        ));
      } else if (usersType === 'employees') {
        setEmployees(response.data.employees);
        setFilteredUsers(response.data.employees);
      }
    } catch (error) {
      console.error(error);
    }
  };


  const fetchBillingCycle = async () => {
    try {
      const response = await client.get(`/${userType}/billing-cycle`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (response && response.data) {
        setIsBilling(!!response.data.cycleId);
      }
    } catch (error) {
      console.error(error);
      // Handle error appropriately, maybe show an alert or set a default value for isBilling
    }
  };

  const HandleBilling = async () => {
    try {
      let endpoint;
      if (!isBilling) {
        endpoint = `/${userType}/billing-cycle/start`;
      } else {
        endpoint = `/${userType}/billing-cycle/stop`;
      }
      console.log(endpoint);
      const response = await client.post(endpoint, null, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (response && response.data) {
        setIsBilling(prev => !prev);
        Alert.alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(response?.data?.message);
    }
  };

  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    establishWebSocketConnection();
  }, []);

  useEffect(() => {
    fetchBillingCycle();
    fetchUsers();
  }, [refresh, usersType, filters]);

  const establishWebSocketConnection = () => {
    if (!socket) {
      const newSocket = io(ioString);
      setSocket(newSocket);
      console.log('creating new socket');
    }
    if (socket) {
      socket.on('newEmployee', (data: Employee) => {
        setEmployees(prevEmps => [data, ...prevEmps]);
      });

      socket.on('newBill', data => {
        setRefresh(prev => !prev);
      });
      socket.on('refreshCycle', data => {
        if (userType != 'customer') {
          setRefresh(prev => !prev);
        }
      });

      socket.on('customersUpdate', data => {
        setRefresh(prev => !prev);
      });

      socket.on('employeeUpdate', data => {
        setRefresh(prev => !prev);
      });
    }
  };

  return (
    <View
      style={styles.screen}
      onTouchStart={() => {
        Keyboard.dismiss();
      }}>
      <View style={styles.topItemsContainer}>
        <Pressable
          onPress={() => HandleBilling()}
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
        {userType === 'owner' && (
          <View style={styles.empUsersContainer}>
            <Card
              onPress={() => setUsersType('employees')}
              style={styles.cardContainer}
              selected={usersType === 'employees'}>
              <Text style={styles.text}>Employees</Text>
            </Card>
            <Card
              onPress={() => setUsersType('customers')}
              style={styles.cardContainer}
              selected={usersType === 'customers'}>
              <Text style={styles.text}>Customers</Text>
            </Card>
          </View>
        )}
        <View style={styles.empUsersContainer}></View>
        <SearchTextInput value={searchQuery} setValue={setSearchQuery} />
        <View style={styles.h10} />
        <View style={styles.filtersContainer}>
          {usersType === 'customers' &&
            isBilling &&
            USERS_FILTERS.map(item => (
              <Card
                key={item}
                onPress={() => {
                  const alreadySelected = filters.find(fil => fil === item);

                  if (alreadySelected) {
                    return setFilters(prevFilters =>
                      prevFilters.filter(it => it !== item),
                    );
                  }
                  return setFilters(prevFilters => [item]);
                }}
                selected={!!filters.find(fil => fil === item)}
                style={styles.cardContainer}>
                <Text style={styles.text}>{item}</Text>
              </Card>
            ))}
          {usersType === 'employees' &&
            EMPLOYEE_FILTERS.map(item => (
              <Card
                key={item}
                onPress={() => {
                  const alreadySelected = employeeFilters.find(
                    fil => fil === item,
                  );

                  if (alreadySelected) {
                    return setEmployeeFilters(prevFilters =>
                      prevFilters.filter(it => it !== item),
                    );
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
      </View>
      <View style={styles.h10} />
      <FlatList
        contentContainerStyle={styles.topItemsContainer}
        data={filteredUsers}
        renderItem={props =>
          usersType === 'employees' ? (
            <EmployeeListItem {...props} />
          ) : (
            <UserListItem {...props} isBilling={isBilling} />
          )
        }
        ItemSeparatorComponent={ListSeperator}
      />
    </View>
  );
};

export default UsersDashboard;

const styles = StyleSheet.create({
  elevatedCardText: {
    color: Colors.White,
    fontSize: 14,
    fontWeight: '700',
  },
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
