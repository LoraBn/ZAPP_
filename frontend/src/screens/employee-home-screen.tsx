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
import React, { useEffect ,useState} from 'react';
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
import { io } from 'socket.io-client';
import { useUser } from '../storage/use-user';
import AnnouncementItem from '../components/alerts/announcement-item';
import { ioString } from '../API/io';


export const DUMMY_ALERTS = [
  {
    id: 1,
    user: {name: 'Owner'},
    alert:
      'Lorem ipsum dolor dolor dolor dolor  dolor dolor dolor dolor',
    date: new Date(),
  },
  {
    id: 2,
    user: {name: 'User'},
    alert:
      'Lorem ipsum dolor dolor dolor dolor dolor dolor dolor dolor',
    date: new Date(),
  },
  {
    id: 3,
    user: {name: 'User'},
    alert:
      'Lorem ipsum dolor dolor dolor dolor samira  dolor dolor dolor dolor',
    date: new Date(),
  },
];

type EmployeeHomeScreenProps = StackScreenProps<
  EmployeeHomeStackNavigationParams,
  'HomeScreen'
>;

const EmployeeHomeScreen = ({navigation}: EmployeeHomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  // const [socket, setSocket] = useState<any>(null);
   const {setSocket, socket, accessToken, type} = useUser(
    state => state,
  );

  useEffect(() => {
    fetchAnnouncements();
    establishWebSocketConnection();
    fetchIssues();
    return () => {
      if (socket != null) {
        socket.disconnect();
      }
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await client.get(`/${type}/announcements`, {
        headers: {
          authorization: `Bearer ${accessToken}`, // Replace with your actual token
        },
      });
      setAnnouncements(response.data.announcements.reverse());
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const [issues, setIssues] = useState<Alert>([])
  const fetchIssues = async ()=> {
    try {
      const responce = await client.get(`/${type}/issues`, {
        headers:{
          Authorization: `Bearer ${accessToken}`
        }
      });
      if(responce){
        setIssues(responce.data.alert_ticket_list);
      }
    } catch (error) {
      console.log(error)
    }
  }

  const establishWebSocketConnection = () => {
    const newSocket = io(ioString);
    setSocket(newSocket)
    newSocket.on('newAnnouncement', (data: any) => {
      console.log('New announcement received:', data);
      setAnnouncements((prevAnnouncements) => [...prevAnnouncements, data]);
    });

    socket?.on('newIssue', data => {
      setIssues((prev) => [data, ...prev]);
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
          <Text style={styles.amountText}>$ 56666</Text>
        </WhiteCard>
        <Text style={styles.profitText} numberOfLines={2}>
          Assigned Alerts
        </Text>
        <WhiteCard
          style={[styles.amountContainer, {backgroundColor: Colors.White}]}>
          <Text style={styles.amountText}>3</Text>
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
              data={announcements.slice(0,3)}
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
              data={issues?.slice(0,3)}
              scrollEnabled={false}
              renderItem={AlertItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('UserAlertSystem')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
      <Schedule />
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
