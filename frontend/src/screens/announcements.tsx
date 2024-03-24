import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../utils/colors';
import ListTextHeader from '../components/ui/list-text-header';
import {StackScreenProps} from '@react-navigation/stack';
import {HomeStackNavigatorParams} from '../navigation/home-stack-navigation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AnnouncementListItem from '../components/ui/announcement-list-item';
import ListSeperator from '../components/ui/list-seperator';
import {useUser} from '../storage/use-user';

export type Announcement = {
  id: number;
  title: string;
  description: string;
  attachments: string[];
  date: Date;
};

export const DUMMY_ANNOUNCEMENTS: Announcement[] = [
  {
    attachments: ['samiraaa'],
    date: new Date(),
    description: 'axdaxd',
    id: 1,
    title: 'Samira',
  },
  {
    attachments: ['samiraaa'],
    date: new Date(),
    description:
      'asdasdasd asdasdasd asdasdasd asdasdasd asdasdasd asdasdasd asdasdasd asdasdasd asdasdasd asdasdasd asdasdasd asdasdasd asdasdasd asdasdasd',
    id: 2,
    title: 'jamal',
  },
  {
    attachments: ['samiraaa'],
    date: new Date(),
    description: 'misadasd',
    id: 3,
    title: 'kamal',
  },
  {
    attachments: ['samiraaa'],
    date: new Date(),
    description: 'misadasd',
    id: 4,
    title: 'kamal',
  },
  {
    attachments: ['samiraaa'],
    date: new Date(),
    description: 'misadasd',
    id: 5,
    title: 'kamal',
  },
  {
    attachments: ['samiraaa'],
    date: new Date(),
    description: 'misadasd',
    id: 6,
    title: 'kamal',
  },
  {
    attachments: ['samiraaa'],
    date: new Date(),
    description: 'misadasd',
    id: 7,
    title: 'kamal',
  },
  {
    attachments: ['samiraaa'],
    date: new Date(),
    description: 'misadasd',
    id: 8,
    title: 'kamal',
  },
  {
    attachments: ['samiraaa'],
    date: new Date(),
    description: 'misadasd',
    id: 9,
    title: 'kamal',
  },
];

type AnnouncementsProps = StackScreenProps<
  HomeStackNavigatorParams,
  'Announcements'
>;

const Announcements = ({navigation}: AnnouncementsProps) => {
  const userType = useUser(state => state.type);

  const insets = useSafeAreaInsets();

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
          data={DUMMY_ANNOUNCEMENTS}
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
