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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Card from '../components/ui/card';
import {ImageStrings} from '../assets/image-strings';
import AlertItem from '../components/alerts/alert-item';
import ViewAll from '../components/ui/view-all';
import {StackScreenProps} from '@react-navigation/stack';
import Schedule from '../components/ui/schedule';
import {EmployeeHomeStackNavigationParams} from '../navigation/employee-home-stack-navigation';
import client from '../API/client';
import {io} from 'socket.io-client';
import {useUser} from '../storage/use-user';
import AnnouncementItem from '../components/alerts/announcement-item';
import {ioString} from '../API/io';

type EmployeeHomeScreenProps = StackScreenProps<
  EmployeeHomeStackNavigationParams,
  'HomeScreen'
>;

const EmployeeHomeScreen = ({navigation}: EmployeeHomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  // const [socket, setSocket] = useState<any>(null);
  const {setSocket, socket, accessToken, type, setEquipments, setPlans} =
    useUser(state => state);

  useEffect(() => {
    fetchSalary();
    establishWebSocketConnection();
    return () => {
      if (socket != null) {
        socket.disconnect();
      }
    };
  }, []);

  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    fetchAnnouncements();
    fetchIssues();
    fetchSchedule();
    fetchPrice();
    fetchEquipments();
    fetchPlans();
  }, [refresh]);

  const fetchAnnouncements = async () => {
    try {
      const response = await client.get(`/${type}/announcements`, {
        headers: {
          authorization: `Bearer ${accessToken}`, // Replace with your actual token
        },
      });
      setAnnouncements(response.data.announcements.reverse());
    } catch (error: any) {
      console.log(error.data?.error_message)
    }
  };

  const fetchPlans = async () => {
    try {
      const responce = await client(`/${type}/plans`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      // const PlansArray = responce.data.plans.map((plan: any) => plan.plan_name);
      setPlans(responce.data.plans);
    } catch (error: any) {
      console.log(error);
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
      if (responce) {
        setIssues(responce.data.alert_ticket_list);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [salary, setSalary] = useState<any>();

  const fetchSalary = async () => {
    try {
      const response = await client.get(`/${type}/salary`,{
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      })

      if(response?.data.salary){
        setSalary(response.data.salary)
      }
    } catch (error: any) {
      console.log(error.data?.error_message)
    }
  }

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

  const [scheduleData, setScheduleData] = useState<any[]>([]);

  const fetchSchedule = async () => {
    try {
      const response = await client.get(`/${type}/electric-schedule`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      console.log(response.data.schedule);
      if (response.data.schedule.length > 0) {
        setScheduleData(response.data.schedule);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [kwhPrice, setPrice] = useState<any>('0');

  const fetchPrice = async () => {
    try {
      const response = await client.get(`/${type}/price`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      setPrice(response.data.price);
    } catch (error) {
      console.log(error);
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

    newSocket?.on('newIssue', data => {
      setIssues(prev => [data, ...prev]);
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
    
    newSocket?.on('newEquipment', (data: any) => {
      setRefresh(prev => !prev);
    });
    newSocket?.on('updateEquipment', (data: any) => {
      setRefresh(prev => !prev);
    });
    newSocket?.on('deleteEquipment', (data: any) => {
      setRefresh(prev => !prev);
    });
    
    newSocket?.on('ScheduleUpdate', (data: any) => {
      setRefresh(prev => !prev);
    });
    newSocket?.on('newPrice', data => {
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
      <View style={styles.profitFeesContainer}>
        <Text style={styles.profitText}>Kwh Price</Text>
        <WhiteCard style={styles.amountContainer}>
          <Text style={styles.amountText}>$ {kwhPrice}</Text>
        </WhiteCard>
        <Text style={styles.profitText} numberOfLines={2}>
          Salary
        </Text>
        <WhiteCard
          style={[styles.amountContainer, {backgroundColor: Colors.White}]}>
          <Text style={styles.amountText}>$ {salary}</Text>
        </WhiteCard>
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
              data={announcements.slice(0, 3)}
              scrollEnabled={false}
              renderItem={AnnouncementItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('Announcements')})
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
              data={issues?.slice(0, 3)}
              scrollEnabled={false}
              renderItem={AlertItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('UserAlertSystem')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
      <Schedule schedule={scheduleData} />
    </ScrollView>
  );
};

export default EmployeeHomeScreen;

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
  amountText: {fontWeight: '400', fontSize: 12, color: Colors.Black},
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
