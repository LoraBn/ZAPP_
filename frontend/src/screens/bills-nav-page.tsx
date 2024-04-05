import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../utils/colors';
import WhiteCard from '../components/ui/white-card';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Card from '../components/ui/card';
import ViewAll from '../components/ui/view-all';
import {StackScreenProps} from '@react-navigation/stack';
import EquipmentItem from '../components/ui/equipment-item';
import {BillingStackNavigatorParams} from '../navigation/billing-stack-navigation';
import SubscriptionPlanItem from '../components/ui/subscription-plan-item';
import ExpensesItem from '../components/ui/expenses-item';
import {User} from './users-dashboard';
import BillsItem from '../components/ui/bills-item';
import client from '../API/client';
import {useUser} from '../storage/use-user';
import {ioString} from '../API/io';
import {io} from 'socket.io-client';
import OwnerHeader from '../components/ui/owner-header';

type BillsNavPageProps = StackScreenProps<
  BillingStackNavigatorParams,
  'BillsNavPage'
>;

export type Plan = {
  plan_id: number;
  plan_name: string;
  plan_price: number;
  date: Date;
};

export type Expense = {
  expense_id: number;
  username: string;
  amount: number;
  description: string;
  expense_date: Date;
};

export type Bill = {
  id: number;
  user: User;
  amount: number;
  status: 'Paid' | 'Partial' | 'Pending';
  date: Date;
};

const BillsNavPage = ({navigation}: BillsNavPageProps) => {
  const insets = useSafeAreaInsets();

  const {setSocket, socket, accessToken, type} = useUser(state => state);

  const [plans, setPlans] = useState<any[]>([]);
  const fetchPlans = async () => {
    try {
      const responce = await client(`/${type}/plans`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      setPlans(responce.data.plans.reverse());
    } catch (error: any) {
      Alert.alert(error.message);
      console.log(error);
    }
  };

  const [equipments, setEquipments] = useState<any[]>([]);
  const fetchEquipments = async () => {
    try {
      const response = await client.get(`/${type}/equipments`, {
        headers: {
          authorization: `Bearer ${accessToken}`, // Replace with your actual token
        },
      });
      setEquipments(response.data.equipments.reverse());
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const [expenses, setExpenses] = useState<any[]>([]);
  const fetchExpense = async () => {
    try {
      const responce = await client.get(`${type}/expenses`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      setExpenses(responce.data.expenses.reverse());
    } catch (error) {}
  };

  const [bills, setBills] = useState<any>([]);

  const fetchAllBills = async () => {
    try {
      const responce = await client.get(`/${type}/bills`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (responce) {
        setBills(responce.data.bills);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllBills();
    fetchEquipments();
    fetchExpense();
    fetchPlans(), 
    establishWebSocketConnection();
  }, []);

  const [refresh, setRefresh]= useState<boolean>(false)

  useEffect(() => {
    fetchProfit()
    fetchPrice()
  }, [refresh]);

  const [kwhPrice, setKwhPrice] = useState<string>('No Price');

  const fetchPrice = async () => {
    try {
      const response = await client.get(`/${type}/price`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      setKwhPrice(`${response.data.price.kwh_price}`);
    } catch (error) {
      console.log(error);
    }
  };

  const [profit, setProfit] = useState<number>();
  const fetchProfit = async () => {
    try {
      const responce = await client.get(`/${type}/profit`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (responce) {
        setProfit(parseInt(responce.data.profit));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const establishWebSocketConnection = () => {
    if (!socket) {
      const newSocket = io(ioString);
      setSocket(newSocket);
      console.log('creating new socket');
    }
    if (socket) {
      socket.on('newEquipment', (data: any) => {
        setEquipments(prevEquipments => [data, ...prevEquipments]);
      });

      //equipments
      socket.on('updateEquipment', (data: any) => {
        const {oldName, name, price, description, status} = data;
        const newEq = {name, price, description, status};
        setEquipments(prevEquipments => {
          const filtered = prevEquipments.filter(item => item.name != oldName);
          return [newEq, ...filtered];
        });
      });
      socket.on('deleteEquipment', (data: any) => {
        const {deletedName} = data;
        setEquipments(prevEquipments => {
          return prevEquipments.filter(item => item.name !== deletedName);
        });
      });

      //plans
      socket.on('newPlan', (data: any) => {
        console.log(data);
        setPlans(prevPlans => [data, ...prevPlans]);
      });
      socket.on('updatePlan', (data: any) => {
        console.log('Im here');
        const {plan_id} = data;
        setEquipments(prevPlans => {
          const filtered = prevPlans.filter(item => item.plan_id != plan_id);
          return [data, ...filtered];
        });
      });
      socket.on('deletePlan', (data: any) => {
        const {plan_id} = data;
        setPlans(prevPlans => {
          return prevPlans.filter(item => item.plan_id !== plan_id);
        });
      });
      //expense
      socket.on('newExpense', (data: any) => {
        setExpenses(prevExpenses => [data, ...prevExpenses]);
        setRefresh(prev => !prev);
      });
      socket.on('updateExpense', (data: any) => {
        const {oldId, username, amount, description, expense_date} = data;
        const newExpense = {username, amount, description, expense_date};
        setExpenses(prevExpenses => {
          const filtered = prevExpenses.filter(
            item => item.expense_id != oldId,
          );
          return [newExpense, ...filtered];
        });
        setRefresh(prev => !prev);
      });
      socket.on('deleteExpense', (data: any) => {
        const {deletedId} = data;
        setExpenses(prevExpenses => {
          const updatedExpenses = prevExpenses.filter(
            item => item.expense_id != deletedId,
          );
          return updatedExpenses;
        });
        setRefresh(prev => !prev);
      });
       

      //bills
      socket.on('newBill', data => {
        setRefresh(prev => !prev);
      });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollViewContent,
        {paddingTop: insets.top + 15},
      ]}
      style={styles.screen}>
      <OwnerHeader kwhPrice={kwhPrice || 'No price'} profit={profit || "0"}/>
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
              data={plans.slice(0, 3)}
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
              data={equipments.slice(0, 3)}
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
              data={bills.slice(0,3)}
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
              data={expenses.slice(0, 3)}
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
