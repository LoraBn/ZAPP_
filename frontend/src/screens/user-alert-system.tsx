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
import {ioString} from '../API/io';
import {io} from 'socket.io-client';
import CreateTicket from '../components/ui/create-ticket';

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

  if (alerts) {
    for (let i = 0; i < alerts.length; i++) {
      const alert = alerts[i];

      if (!alert.is_closed) {
        sections[0].data.push(alert);
      } else {
        sections[1].data.push(alert);
      }
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

  const {accessToken, socket, setSocket} = useUser(state => state);

  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    fetchIssues();
    fetchTickets();
  }, [usersType, refresh]);

  useEffect(() => {
    establishWebSocketConnection();
  }, []);

  const [sections, setSections] = useState<ALERT[] | undefined>(undefined);

  const [sections2, setSections2] = useState<ALERT[] | undefined>(undefined);

  const fetchTickets = async () => {
    try {
      const response = await client.get(`/${userType}/tickets`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (response) {
        const alertTicketList: ALERT[] = response.data.support_ticket_list;
        const formattedSections = formatAlertsForSectionList(alertTicketList);
        setSections2(formattedSections);
        console.log('success', sections);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
        const formattedSections = formatAlertsForSectionList(
          response.data.alert_ticket_list,
        );
        setSections(formattedSections);
        console.log('success', sections);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const establishWebSocketConnection = () => {
    if (!socket) {
      const newSocket = io(ioString);
      setSocket(newSocket);
      console.log('creating new socket');
    }

    if (socket) {
      socket.on('closedIssue', ({alert_id}) => {
        setSections(prevSections => {
          const updatedSections = [...prevSections];

          const openSectionIndex = updatedSections.findIndex(
            section => section.title === 'Open',
          );
          const closedSectionIndex = updatedSections.findIndex(
            section => section.title === 'Closed',
          );
          console.log(openSectionIndex, closedSectionIndex);

          const alertIndex = updatedSections[openSectionIndex].data.findIndex(
            alert => alert.alert_id === alert_id,
          );

          console.log(alertIndex);

          if (alertIndex !== -1) {
            const removedAlert = updatedSections[openSectionIndex].data.splice(
              alertIndex,
              1,
            )[0];
            console.log('removed:', removedAlert);

            updatedSections[closedSectionIndex].data.push(removedAlert);
          }

          console.log(updatedSections);
          return updatedSections;
        });
      });

      socket.on('newIssue', newAlert => {
        setSections(prevSections => {
          const updatedSections = [...prevSections];

          // Determine where to add the new alert based on its status (open/closed)
          const sectionIndex = newAlert.is_closed
            ? updatedSections.findIndex(section => section.title === 'Closed')
            : updatedSections.findIndex(section => section.title === 'Open');

          if (sectionIndex !== -1) {
            // Add the new alert to the appropriate section's data array at the beginning
            updatedSections[sectionIndex].data.unshift(newAlert);
            console.log(updatedSections);
          }

          console.log(updatedSections);
          return updatedSections;
        });
      });

      socket.on('newIssueReply', ({alert_id, message}) => {
        setSections(prevSections => {
          const updatedSections = [...prevSections];

          // Find the alert with the matching ID
          const sectionIndex = updatedSections.findIndex(section =>
            section.data.some(alert => alert.alert_id === alert_id),
          );

          if (sectionIndex !== -1) {
            // Find the index of the alert in the section's data array
            const alertIndex = updatedSections[sectionIndex].data.findIndex(
              alert => alert.alert_id === alert_id,
            );

            if (alertIndex !== -1) {
              // Update the alert with the new reply message
              updatedSections[sectionIndex].data[alertIndex].replies.push(
                message,
              );
            }
          }

          return updatedSections;
        });
      });

      socket.on('newTicketReply', data => {
        setRefresh(prev => !prev);
      });
      socket.on('newTicket', data => {
        setRefresh(prev => !prev);
      });

      socket.on('closeTicket', ({ticket_id}) => {
        setSections2(prevSections => {
          const updatedSections = [...prevSections];

          const openSectionIndex = updatedSections.findIndex(
            section => section.title === 'Open',
          );
          const closedSectionIndex = updatedSections.findIndex(
            section => section.title === 'Closed',
          );
          console.log(openSectionIndex, closedSectionIndex);

          const alertIndex = updatedSections[openSectionIndex].data.findIndex(
            ticket => ticket.ticket_id === ticket_id,
          );

          console.log(alertIndex);

          if (alertIndex !== -1) {
            const removedAlert = updatedSections[openSectionIndex].data.splice(
              alertIndex,
              1,
            )[0];
            console.log('removed:', removedAlert);

            updatedSections[closedSectionIndex].data.push(removedAlert);
          }
          return updatedSections;
        });
      });
    }
  };

  return (
    <View style={styles.screen}>
      {userType === 'owner' && (
        <>
          <ScreenHeader>Alert System</ScreenHeader>
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
          <View
            style={[
              styles.historyContainer,
              {marginBottom: insets.bottom + 25},
            ]}>
            <Pressable
              style={styles.container}
              onPress={() =>
                setIsCreatingAlert(prevIsCreatingAlert => !prevIsCreatingAlert)
              }>
              <Text style={styles.text}>{'Create Alert'}</Text>
            </Pressable>

            {sections && (
              <SectionList
                sections={usersType === 'employees' ? sections : sections2}
                ListHeaderComponent={() =>
                  isCreatingAlert ? (
                    <>
                      <CreateAlert
                        onSuccess={() => setIsCreatingAlert(false)}
                      />
                    </>
                  ) : null
                }
                renderSectionHeader={SectionListHeader}
                SectionSeparatorComponent={ListSeperator}
                ItemSeparatorComponent={ListSeperator}
                renderItem={props => <UserAlertItem {...props} />}
              />
            )}
          </View>
        </>
      )}

      {userType === 'employee' && (
        <>
          <ScreenHeader>Alert System</ScreenHeader>
          <View
            style={[
              styles.historyContainer,
              {marginBottom: insets.bottom + 25},
            ]}>
            <Pressable
              style={styles.container}
              onPress={() =>
                setIsCreatingAlert(prevIsCreatingAlert => !prevIsCreatingAlert)
              }>
              <Text style={styles.text}>{'Create Alert'}</Text>
            </Pressable>

            {sections && (
              <SectionList
                sections={sections?.filter(
                  section => section.title !== 'Closed',
                )}
                ListHeaderComponent={() =>
                  isCreatingAlert ? (
                    <>
                      <CreateAlert
                        onSuccess={() => setIsCreatingAlert(false)}
                      />
                    </>
                  ) : null
                }
                renderSectionHeader={SectionListHeader}
                SectionSeparatorComponent={ListSeperator}
                ItemSeparatorComponent={ListSeperator}
                renderItem={props => <UserAlertItem {...props} />}
              />
            )}
          </View>
        </>
      )}

      {userType === 'customer' && (
        <>
          <ScreenHeader>Support System</ScreenHeader>
          <View
            style={[
              styles.historyContainer,
              {marginBottom: insets.bottom + 25},
            ]}>
            <Pressable
              style={styles.container}
              onPress={() =>
                setIsCreatingAlert(prevIsCreatingAlert => !prevIsCreatingAlert)
              }>
              <Text style={styles.text}>{'Create Ticket'}</Text>
            </Pressable>

            {sections2 && (
              <SectionList
                sections={sections2?.filter(
                  section2 => section2.title !== 'Closed',
                )}
                ListHeaderComponent={() =>
                  isCreatingAlert ? (
                    <>
                      <CreateTicket
                        onSuccess={() => setIsCreatingAlert(false)}
                      />
                    </>
                  ) : null
                }
                renderSectionHeader={SectionListHeader}
                SectionSeparatorComponent={ListSeperator}
                ItemSeparatorComponent={ListSeperator}
                renderItem={props => <UserAlertItem {...props} />}
              />
            )}
          </View>
        </>
      )}
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
