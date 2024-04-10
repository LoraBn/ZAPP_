import {
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
import {CustomerHomeStackNavigationParams} from '../navigation/customer-home-stack-navigation';
import TimeRemaining from '../components/ui/time-remaining';
import Schedule from '../components/ui/schedule';
import {useUser} from '../storage/use-user';
import client from '../API/client';
import {ioString} from '../API/io';
import {io} from 'socket.io-client';
import AnnouncementItem from '../components/alerts/announcement-item';

export type Equipment = {
  id: number;
  name: string;
  price: number;
  description: string;
  status: 'Active' | 'Inactive';
};

type CustomerHomeScreenProps = StackScreenProps<
  CustomerHomeStackNavigationParams,
  'HomeScreen'
>;

const CustomerHomeScreen = ({navigation}: CustomerHomeScreenProps) => {
  const insets = useSafeAreaInsets();

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const {socket, setSocket, accessToken, type} = useUser(state => state);

  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    establishWebSocketConnection();
  }, []);

  useEffect(() => {
    fetchSchedule();
    fetchAnnouncements();
    fetchPrice();
    fetchRemaining();
  }, [refresh]);

  const [price, setPrice] = useState<any>('0');

  const fetchPrice = async () => {
    try {
      const response = await client.get(`/${type}/price`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (response && response.data.price) {
        setPrice(response.data.price);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const [remaining, setRemaining] = useState<any>();

  const fetchRemaining = async () => {
    try {
      const response = await client.get(`${type}/remaining`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (response && response.data.remaining_amount) {
        setRemaining(response.data.remaining_amount);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      return;
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
          authorization: `Bearer ${accessToken}`, // Replace with your actual token
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

  const establishWebSocketConnection = () => {
    let newSocket = socket;
    if (!socket) {
      newSocket = io(ioString);
      setSocket(newSocket);
    }
    if (newSocket) {
      newSocket.on('newAnnouncement', (data: any) => {
        console.log('New announcement received:', data);
        setAnnouncements(prevAnnouncements => [data, ...prevAnnouncements]);
      });

      newSocket.on('ScheduleUpdate', (data: any) => {
        setRefresh(prev => !prev);
      });

      newSocket.on('newPrice', data => {
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
      <View style={styles.profitFeesContainer}>
        <Text style={styles.profitText}>Kwh Price</Text>
        <WhiteCard style={styles.amountContainer}>
          <Text style={styles.amountText}>$ {price}</Text>
        </WhiteCard>
        <Text style={styles.profitText} numberOfLines={2}>
          Pending
        </Text>
        <WhiteCard
          style={[styles.amountContainer, {backgroundColor: Colors.White}]}>
          <Text style={styles.amountText}>$ {remaining || 0}</Text>
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
              data={announcements?.slice(0, 3)}
              scrollEnabled={false}
              renderItem={AnnouncementItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('Announcements')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
      <TimeRemaining schedule={scheduleData} />
      <Schedule schedule={scheduleData} />
    </ScrollView>
  );
};

export default CustomerHomeScreen;

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
