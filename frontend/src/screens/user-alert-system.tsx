import {Pressable, SectionList, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../utils/colors';
import ScreenHeader from '../components/ui/screen-header';
import Card from '../components/ui/card';
import ListSeperator from '../components/ui/list-seperator';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DUMMY_USERS, User} from './users-dashboard';
import UserAlertItem from '../components/ui/user-alert-item';
import SectionListHeader from '../components/ui/section-list-header';
import CreateAlert from '../components/ui/create-alert';
import {useUser} from '../storage/use-user';

export type Alert = {
  id: number;
  user: User;
  owner: string;
  user_description: string;
  owner_description: string;
  owner_reply: string;
  urgent: boolean;
  title: string;
  date: Date;
  open: boolean;
};

export const DUMMY_ALERTS: Alert[] = [
  {
    id: 1,
    owner: 'Samira',
    owner_description: 'Description',
    owner_reply: 'REplied here',
    urgent: true,
    user: DUMMY_USERS[0],
    user_description: 'Shou bed',
    title: 'Djontirrr',
    date: new Date(),
    open: false,
  },
  {
    id: 2,
    owner: 'Samira',
    owner_description: 'Description',
    owner_reply: 'REplied here',
    urgent: true,
    user: DUMMY_USERS[0],
    user_description: 'Shou bed',
    title: 'Djontirrr',
    date: new Date(),
    open: true,
  },
  {
    id: 3,
    owner: 'Samira',
    owner_description: 'Description',
    owner_reply: 'REplied here',
    urgent: true,
    user: DUMMY_USERS[0],
    user_description: 'Shou bed',
    title: 'Djontirrrdsa',
    date: new Date(),
    open: false,
  },
];

function formatAlertsForSectionList(alerts: Alert[]) {
  const sections: {data: Alert[]; title: 'Open' | 'Closed'}[] = [
    {data: [], title: 'Open'},
    {data: [], title: 'Closed'},
  ];

  for (let i = 0; i < alerts.length; i++) {
    const alert = alerts[i];

    if (alert.open) {
      sections[0].data.push(alert);
    } else {
      sections[1].data.push(alert);
    }
  }

  return sections;
}

const UserAlertSystem = () => {
  const insets = useSafeAreaInsets();

  const userType = useUser(state => state.type);

  const [isCreatingAlert, setIsCreatingAlert] = useState(false);

  const [usersType, setUsersType] = useState<'users' | 'employees'>('users');
  const [filter, setFilter] = useState<'urgent' | 'not_urgent' | null>(null);

  const sections = formatAlertsForSectionList(DUMMY_ALERTS);

  // DID NOT MAKE SENSE TO ADD FILTERS ON OPEN CLOSE I DID NOT ADD IT, IF YOU WANT TO ADD IT GO AHEAD BUT IT JUST DOESNT MAKE SENSE SINCE THE LIST IS ALREADY SEPERATED
  return (
    <View style={styles.screen}>
      <ScreenHeader>Alert System</ScreenHeader>
      {userType === 'owner' && (
        <View style={styles.topItemsContainer}>
          <Card
            selected={usersType === 'employees'}
            onPress={() => setUsersType('employees')}>
            <Text style={styles.topItemText}>Employee</Text>
          </Card>
          <Card
            selected={usersType === 'users'}
            onPress={() => setUsersType('users')}>
            <Text style={styles.topItemText}>Customer</Text>
          </Card>
        </View>
      )}
      <View
        style={[styles.historyContainer, {marginBottom: insets.bottom + 25}]}>
        {userType !== 'customer' && (
          <View style={styles.flatlistHeaderContainer}>
            <Card
              selected={filter === 'urgent'}
              style={[
                styles.historyTextContainer,
                {
                  backgroundColor:
                    filter === 'urgent'
                      ? Colors.LightBlue
                      : Colors.SuperLightBlue,
                },
              ]}
              onPress={() => {
                if (filter === 'urgent') {
                  return setFilter(null);
                }

                return setFilter('urgent');
              }}>
              <Text style={styles.historyTitle}>Urgent</Text>
            </Card>
            <Card
              selected={filter === 'not_urgent'}
              style={[
                styles.historyTextContainer,
                {
                  backgroundColor:
                    filter === 'not_urgent'
                      ? Colors.LightBlue
                      : Colors.SuperLightBlue,
                },
              ]}
              onPress={() => {
                if (filter === 'not_urgent') {
                  return setFilter(null);
                }

                return setFilter('not_urgent');
              }}>
              <Text style={styles.historyTitle}>Not Urgent</Text>
            </Card>
          </View>
        )}
        <Pressable
          style={styles.container}
          onPress={() =>
            setIsCreatingAlert(prevIsCreatingAlert => !prevIsCreatingAlert)
          }>
          <Text style={styles.text}>{'Create Alert'}</Text>
        </Pressable>
        <SectionList
          sections={sections}
          // eslint-disable-next-line react/no-unstable-nested-components
          ListHeaderComponent={() =>
            isCreatingAlert ? (
              <>
                <CreateAlert onSuccess={() => setIsCreatingAlert(false)} />
              </>
            ) : null
          }
          renderSectionHeader={SectionListHeader}
          SectionSeparatorComponent={ListSeperator}
          ItemSeparatorComponent={ListSeperator}
          renderItem={props => <UserAlertItem {...props} />}
        />
      </View>
    </View>
  );
};

export default UserAlertSystem;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontWeight: '700',
    color: Colors.Black,
    fontSize: 18,
    lineHeight: 1.2 * 18,
  },
  flatlistHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 25,
    paddingBottom: 10,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.Background,
    paddingHorizontal: 15,
    gap: 15,
  },
  topItemsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 25,
  },
  topItemText: {
    color: Colors.White,
    fontSize: 18,
    fontWeight: '700',
  },
  historyContainer: {
    backgroundColor: Colors.VeryLightBlue,
    padding: 10,
    borderRadius: 25,
    flex: 1,
    gap: 20,
  },
  historyTitle: {
    color: Colors.Black,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 18 * 1.2,
  },
  historyTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 10,
    backgroundColor: Colors.SuperLightBlue,
    paddingHorizontal: 15,
    borderRadius: 25,
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
