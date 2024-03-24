import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import React, { useEffect, useState } from 'react';
import {Colors} from '../utils/colors';
import ListTextHeader from '../components/ui/list-text-header';
import {StackScreenProps} from '@react-navigation/stack';
import {HomeStackNavigatorParams} from '../navigation/home-stack-navigation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AnnouncementListItem from '../components/ui/announcement-list-item';
import ListSeperator from '../components/ui/list-seperator';
import {useUser} from '../storage/use-user';
import client from '../API/client';
import { io } from 'socket.io-client';

export type Announcement = {
  id: number;
  owner_id : number;
  target_type: string;
  announcement_title: string;
  announcement_message: string;
  announcement_date: Date;
};

type AnnouncementsProps = StackScreenProps<
  HomeStackNavigatorParams,
  'Announcements'
>;

const Announcements = ({navigation}: AnnouncementsProps) => {
  const userType = useUser(state => state.type);
  const insets = useSafeAreaInsets();

  const user = useUser();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    fetchAnnouncements();
    establishWebSocketConnection();
    return () => {
        socket.disconnect();
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const accessToken = user.accessToken;
      const response = await client.get('/employee/announcements', {
        headers: {
          authorization: `Bearer ${accessToken}`, // Replace with your actual token
        },
      });
      setAnnouncements(response.data.announcements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const establishWebSocketConnection = () => {
    const newSocket = io('http://192.168.1.5:3000');
    setSocket(newSocket);
    newSocket.on('newAnnouncement', (data: any) => {
      console.log('New announcement received:', data);
      setAnnouncements((prevAnnouncements) => [...prevAnnouncements, data]);
    });
  };

  return (
    <View style={styles.screen}>
      <ListTextHeader>Announcements</ListTextHeader>
      <View
        style={[styles.historyContainer, {marginBottom: insets.bottom + 25}]}>
        <View style={styles.historyTextContainer}>
          <Text style={styles.historyTitle}>History</Text>
          {userType === 'owner' && (
            <Pressable
              style={styles.plusContainer}
              onPress={() => navigation.navigate('AddAnnouncements')}>
              <Text style={styles.historyTitle}>+</Text>
            </Pressable>
          )}
        </View>
        <FlatList
          data={announcements.reverse()}
          ItemSeparatorComponent={ListSeperator}
          renderItem={props => <AnnouncementListItem {...props} />}
        />
      </View>
    </View>
  );
};

export default Announcements;

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.Background, paddingHorizontal: 15},
  historyContainer: {
    backgroundColor: Colors.VeryLightBlue,
    padding: 10,
    borderRadius: 25,
    flex: 1,
  },
  historyTitle: {
    color: Colors.White,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 24 * 1.2,
  },
  historyTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 10,
  },
  plusContainer: {
    backgroundColor: Colors.Blue,
    borderRadius: 100,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
