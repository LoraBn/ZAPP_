import {Pressable, SectionList, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
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
import client from '../API/client';

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

export type ALERT = {
  alert_id: number;
  owner_id: number;
  owner_username: string;
  alert_type: string;
  alert_message: string;
  is_assigned: boolean;
  is_closed: boolean;
  created_at: Date;
  created_by: string;
  replies: {sender_username: string; reply_text: string}[];
};

export type Ticket = {
  ticket_id: number;
  customer_id: number;
  ticket_message: string;
  is_closed: boolean;
  created_at: Date;
  is_urgent: boolean;
  created_by_owner: boolean;
};

export const DUMMY_ALERTS: ALERT[] = [
  {
    alert_id: 1,
    owner_id: 1,
    owner_username: 'Samira',
    alert_type: 'Type',
    alert_message: 'Message',
    is_assigned: false,
    is_closed: false,
    created_at: new Date(),
    created_by: 'User 1',
    replies: [],
  },
  {
    alert_id: 2,
    owner_id: 1,
    owner_username: 'Samira',
    alert_type: 'Type',
    alert_message: 'Message',
    is_assigned: false,
    is_closed: false,
    created_at: new Date(),
    created_by: 'User 1',
    replies: [],
  },
  {
    alert_id: 3,
    owner_id: 1,
    owner_username: 'Samira',
    alert_type: 'Type',
    alert_message: 'Message',
    is_assigned: false,
    is_closed: true,
    created_at: new Date(),
    created_by: 'User 1',
    replies: [],
  },
];

function formatAlertsForSectionList(alerts: ALERT[]) {
  const sections: {data: ALERT[]; title: 'Open' | 'Closed'}[] = [
    {data: [], title: 'Open'},
    {data: [], title: 'Closed'},
  ];

  for (let i = 0; i < alerts.length; i++) {
    const alert = alerts[i];

    if (!alert.is_closed) {
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

  const [usersType, setUsersType] = useState<'customers' | 'employees'>(
    'customers',
  );
  const [filter, setFilter] = useState<'urgent' | 'not_urgent' | null>(null);


  const {accessToken} = useUser(state => state);

  useEffect(() => {
    fetchIssues();
  }, [usersType]);

  const [sections, setSections] = useState<ALERT[] | undefined>(undefined);

// Change the fetchIssues function to update the sections state:
const fetchIssues = async () => {
  try {
    const response = await client.get(`/${userType}/issues`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (response) {
      const alertTicketList: ALERT[] = response.data.alert_ticket_list;
      const formattedSections = formatAlertsForSectionList(alertTicketList);
      setSections(formattedSections);
      console.log(alertTicketList)
    }
  } catch (error: any) {
    console.log(error.message);
  }
};

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
            selected={usersType === 'customers'}
            onPress={() => setUsersType('customers')}>
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
        {usersType === 'employees' && (
          <Pressable
            style={styles.container}
            onPress={() =>
              setIsCreatingAlert(prevIsCreatingAlert => !prevIsCreatingAlert)
            }>
            <Text style={styles.text}>{'Create Alert'}</Text>
          </Pressable>
        )}
        {sections && <SectionList
          sections={sections}
          ListHeaderComponent={() =>
            usersType === 'employees' && isCreatingAlert ? (
              <>
                <CreateAlert onSuccess={() => setIsCreatingAlert(false)} />
              </>
            ) : null
          }
          renderSectionHeader={SectionListHeader}
          SectionSeparatorComponent={ListSeperator}
          ItemSeparatorComponent={ListSeperator}
          renderItem={props => <UserAlertItem {...props} />}
        />}
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
});
