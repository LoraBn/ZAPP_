import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../utils/colors';
import WhiteCard from '../components/ui/white-card';
import OwnerHeader from '../components/ui/owner-header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Card from '../components/ui/card';
import {BarChart} from 'react-native-gifted-charts';
import {ImageStrings} from '../assets/image-strings';
import AlertItem from '../components/alerts/alert-item';
import ViewAll from '../components/ui/view-all';
import {StackScreenProps} from '@react-navigation/stack';
import {HomeStackNavigatorParams} from '../navigation/home-stack-navigation';
import EquipmentItem from '../components/ui/equipment-item';
import client from '../API/client';
import {io} from 'socket.io-client';
import AnnouncementItem from '../components/alerts/announcement-item';
import {useUser} from '../storage/use-user';
import {ioString} from '../API/io';

export type Equipment = {
  id: number;
  name: string;
  price: number;
  description: string;
  status: 'Active' | 'Inactive';
};

type OwnerHomePageProps = StackScreenProps<
  HomeStackNavigatorParams,
  'HomeScreen'
>;

const OwnerHomePage = ({navigation}: OwnerHomePageProps) => {
  const insets = useSafeAreaInsets();

  const [width, setWidth] = useState(0);

  const isPaid = false;
  const barData = [
    {value: 1.5, label: 'A', frontColor: '#3373a1'},
    {value: 3, label: 'B', frontColor: '#e1812b'},
    {value: 4.5, label: 'C', frontColor: '#3a923b'},
    {value: 2, label: 'D', frontColor: '#bf3d3d'},
    {value: 5, label: 'E', frontColor: '#9272b1'},
  ];

  const [profit, setProfit] = useState<number>();
  const fetchProfit = async () => {
    try {
      const responce = await client.get(`/${type}/profit`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (responce && responce.data.profit) {
        setProfit(parseInt(responce.data.profit));
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  //Equipments

  const fetchEquipments = async () => {
    try {
      const response = await client.get(`/${type}/equipments`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (response && response.data.equipments) {
        setEquipments(response.data.equipments.reverse());
      } else {
        return;
      }
    } catch (error) {
      console.error('Error fetching Equipments:', error);
      return;
    }
  };

  //Announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const {
    setSocket,
    socket,
    accessToken,
    type,
    setEmployees,
    employees,
    setPlans,
    setEquipments,
    equipments,
  } = useUser(state => state);

  useEffect(() => {
    fetchAnnouncements();
    establishWebSocketConnection();
    fetchIssues();
    fetchTickets();
    return () => {
      if (socket != null) {
        socket.disconnect();
      }
    };
  }, []);

  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    fetchEmployees();
    fetchProfit();
    fetchPrice();
    fetchPlans();
    fetchEquipments();
  }, [refresh]);

  const fetchPlans = async () => {
    try {
      const responce = await client(`/${type}/plans`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      // const PlansArray = responce.data.plans.map((plan: any) => plan.plan_name);
      if (responce && responce.data.plans) {
        setPlans(responce.data.plans);
      } else {
        return;
      }
    } catch (error: any) {
      console.log(error);
      return;
    }
  };

  const [issues, setIssues] = useState<Alert>([]);
  const fetchIssues = async () => {
    try {
      const responce = await client.get(`/${type}/issues`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (responce && responce.data.alert_ticket_list) {
        setIssues(responce.data.alert_ticket_list);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const [tickets, setTickets] = useState<any>([]);
  const fetchTickets = async () => {
    try {
      const response = await client.get(`/${type}/tickets`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (response && response.data.support_ticket_list) {
        setTickets(response.data.support_ticket_list);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await client.get(`/${type}/announcements`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (response && response.data.announcements) {
        setAnnouncements(response.data.announcements);
      } else {
        return;
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return;
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await client.get(`/${type}/employees`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (response && response.data) {
        const employeesArray = response.data.employees.map(
          (employee: any) => employee.username,
        );
        setEmployees(employeesArray);
      } else {
        return;
      }
    } catch (error: any) {
      console.log(error.message);
      return;
    }
  };

  const [kwhPrice, setKwhPrice] = useState<string>('No Price');

  const fetchPrice = async () => {
    try {
      const response = await client.get(`/${type}/price`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (response && response.data.price) {
        setKwhPrice(`${response.data.price.kwh_price}`);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const establishWebSocketConnection = () => {
    let newSocket = socket;
    if (!socket) {
      newSocket = io(ioString);
      setSocket(newSocket);
    }

    newSocket.on('newAnnouncement', (data: any) => {
      console.log('New announcement received:', data);
      setAnnouncements(prevAnnouncements => [...prevAnnouncements, data]);
    });
    newSocket.on('newEquipment', (data: any) => {
      setRefresh(prev => !prev);
    });
    newSocket.on('updateEquipment', (data: any) => {
      setRefresh(prev => !prev);
    });
    newSocket.on('deleteEquipment', (data: any) => {
      setRefresh(prev => !prev);
    });

    //Issues
    newSocket.on('newIssue', data => {
      setIssues(prev => [data, ...prev]);
    });

    newSocket.on('newExpense', (data: any) => {
      setRefresh(prev => !prev);
    });
    newSocket.on('updateExpense', (data: any) => {
      setRefresh(prev => !prev);
    });
    newSocket.on('deleteExpense', (data: any) => {
      setRefresh(prev => !prev);
    });

    newSocket.on('newBill', data => {
      setRefresh(prev => !prev);
    });

    newSocket?.on('newPlan', (data: any) => {
      setRefresh(prev => !prev);
    });
    newSocket?.on('updatePlan', (data: any) => {
      setRefresh(prev => !prev);
    });
    newSocket?.on('deletePlan', (data: any) => {
      setRefresh(prev => !prev);
    });

    newSocket?.on('employeeUpdate', data => {
      setRefresh(prev => !prev);
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollViewContent,
        {paddingTop: insets.top + 15},
      ]}
      style={styles.screen}>
      <OwnerHeader kwhPrice={kwhPrice} profit={profit} />
      <Card
        onLayout={({
          nativeEvent: {
            layout: {width: wid},
          },
        }) => {
          setWidth(wid);
        }}
        onPress={() => navigation.navigate('AnalyticsScreen')}>
        <Text style={styles.analyticsText}>Analytics</Text>
        <Text style={styles.name}>Name</Text>
        <BarChart data={barData} width={width - 120} maxValue={5} />
      </Card>
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
              data={
                equipments.length
                  ? equipments?.slice(0, 3)
                  : [{name: 'NO EQUIPMENT'}]
              }
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
          <Text style={styles.alertTitle}>Employee Alerts</Text>
          <Pressable onPress={() => navigation.navigate('UserAlertSystem')}>
            <Image source={{uri: ImageStrings.Alert, height: 45, width: 45}} />
          </Pressable>
        </View>
        <Card style={styles.alertContainer}>
          <WhiteCard variant="secondary">
            <FlatList
              contentContainerStyle={styles.flatlistContainer}
              data={
                issues.length ? issues.slice(0, 3) : [{created_by: 'NO ALERTS'}]
              }
              scrollEnabled={false}
              renderItem={AlertItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('UserAlertSystem')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
      <View>
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertTitle}>Customers Alerts</Text>
          <Pressable onPress={() => navigation.navigate('UserAlertSystem')}>
            <Image source={{uri: ImageStrings.Alert, height: 45, width: 45}} />
          </Pressable>
        </View>
        <Card style={styles.alertContainer}>
          <WhiteCard variant="secondary">
            <FlatList
              contentContainerStyle={styles.flatlistContainer}
              data={
                tickets.length
                  ? tickets.slice(0, 3)
                  : [{created_by: 'NO TICKETS'}]
              }
              scrollEnabled={false}
              renderItem={AlertItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('UserAlertSystem')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
      <View>
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertTitle}>Announcements</Text>
          <Pressable onPress={() => navigation.navigate('Announcements')}>
            <Image source={{uri: ImageStrings.Alert, height: 45, width: 45}} />
          </Pressable>
        </View>
        <Card style={styles.alertContainer}>
          <WhiteCard variant="secondary">
            <FlatList
              contentContainerStyle={styles.flatlistContainer}
              data={
                announcements.length
                  ? announcements.slice(0, 3)
                  : [{owner_username: 'No Announcement'}]
              }
              scrollEnabled={false}
              renderItem={AnnouncementItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('Announcements')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
    </ScrollView>
  );
};

export default OwnerHomePage;

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
  profitText: {fontSize: 14, color: Colors.Black},
  amountText: {fontWeight: '400', fontSize: 14, color: Colors.Black},
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
