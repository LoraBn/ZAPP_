import {
  Alert as RNAlert,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../../utils/colors';
import {formatDate} from '../../utils/date-utils';
import TextInput from './text-input';
import {useForm} from 'react-hook-form';
import ElevatedCard from './elevated-card';
import {useUser} from '../../storage/use-user';
import client from '../../API/client';
import {ALERT} from '../../screens/user-alert-system';

type UserAlertItemProps = {
  item: ALERT;
  index: number;
};

type ReplyToAlertForm = {
  replyText: string;
};

const UserAlertItem = ({item}: UserAlertItemProps) => {
  const userType = useUser(state => state.type);

  const {control, handleSubmit, reset} = useForm<ReplyToAlertForm>({
    defaultValues: {replyText: ''},
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const {accessToken, socket, setSocket} = useUser(state => state);
  const [alert, setAlert] = useState<ALERT>(item);

  const titleContainerBottomWidth = {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Black,
    paddingBottom: 15,
  };

  const onClose = async () => {
    try {
      let endpoint;
      if (item.alert_id) {
        endpoint = `/${userType}/issues/${item.alert_id}/close`;
      } else if (item.ticket_id) {
        endpoint = `/${userType}/ticket/${item.ticket_id}/close`;
      }
      const response = await client.put(endpoint, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      // Check if there is an error message in the response
      if (response.data.error_message) {
        Alert.alert(response.data.error_message);
      } else {
        Alert.alert('Closed Successfully');
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error_message) {
        Alert.alert(error.response.data.error_message);
      } else {
        Alert.alert('An error occurred while closing the ticket');
      }
    }
  };
  

  async function AssignSelf() {
    try {
      const responce = await client.post(
        `${userType}/issues/${item.alert_id}/assign`,
        null,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (responce) {
        Alert.alert('Assigned!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function onSubmit({replyText}: ReplyToAlertForm) {
    console.log(replyText);

    try {
      let endpoint;
      if (item.alert_id) {
        endpoint = `/${userType}/issue/${item.alert_id}/reply`;
      } else if (item.ticket_id) {
        endpoint = `/${userType}/ticket/${item.ticket_id}/reply`;
      }
      const responce = await client.post(
        endpoint,
        {replyText},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (responce) {
        reset();
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Pressable
      style={styles.container}
      onPress={() => setIsExpanded(prevIsExpanded => !prevIsExpanded)}>
      <View
        style={[
          styles.titleContainer,
          isExpanded && titleContainerBottomWidth,
        ]}>
        {userType !== 'customer' && (
          <Text
            style={[
              styles.exclamationMark,
              {color: !item.is_closed ? Colors.Red : Colors.Black},
            ]}>
            !
          </Text>
        )}
        <Text style={styles.text}>{item.created_by}</Text>
        <Text style={styles.text}>{item.alert_type}</Text>
        <Text style={styles.text}>{formatDate(item.created_at)}</Text>
      </View>
      {isExpanded && (
        <View>
          <Text style={styles.text}>
            Description: {item.alert_message || item.ticket_message}
          </Text>
        </View>
      )}
      {isExpanded && item.replies && (
        <>
          <View style={styles.itemsContainer}>
            {item.replies &&
              item.replies.map((reply, index) => (
                <View style={styles.userOwnerContainer} key={index}>
                  <Text style={[styles.text, styles.ownerUserText]}>
                    {reply.sender_username}
                  </Text>
                  <Text style={[styles.text, styles.descriptionText]}>
                    {reply.reply_text}
                  </Text>
                </View>
              ))}
          </View>
          {!item.is_closed && (
            <View>
              <TextInput
                control={control}
                name="replyText"
                backgroundColor={Colors.White}
                textColor={Colors.Black}
                placeholder="Reply..."
                multiline
              />
              {item.assigned_usernames && 
              <View style = {styles.assignedPeopleContainer}>
                <Text>Assigned To:</Text>
                <View style={styles.assignedPeopleContainer}>
                  {item.assigned_usernames.map((username, index) => (
                    <Text key={index} style={styles.assignedUsername}>
                      {username}
                    </Text>
                  ))}
                </View>
              </View>}

              <View style={styles.closeOrSubmitElevatedButtonContainer}>
                {<ElevatedCard
                  textStyle={styles.elButtonsText}
                  onPress={handleSubmit(onClose)}>
                  Close
                </ElevatedCard>}
                {userType === 'employee' &&  (
                  <ElevatedCard
                    textStyle={styles.elButtonsText}
                    onPress={handleSubmit(AssignSelf)}>
                    Assign Self
                  </ElevatedCard>
                )}
                <ElevatedCard
                  textStyle={styles.elButtonsText}
                  onPress={handleSubmit(onSubmit)}>
                  Send
                </ElevatedCard>
              </View>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
};

export default UserAlertItem;

const styles = StyleSheet.create({
  elButtons: {},
  elButtonsText: {color: Colors.White, fontWeight: '700', fontSize: 18},
  closeOrSubmitElevatedButtonContainer: {
    paddingTop: 25,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionText: {top: 20},
  itemsContainer: {gap: 42, padding: 10},
  ownerUserText: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Black,
    borderStyle: 'dashed',
  },
  userOwnerContainer: {flexDirection: 'row', alignItems: 'center', gap: 10},
  selfEnd: {alignSelf: 'flex-end'},
  container: {
    backgroundColor: Colors.Gray,
    borderRadius: 25,
    padding: 15,
    gap: 32,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  text: {color: Colors.Black, fontWeight: '700', fontSize: 16, maxWidth: "90%"},
  exclamationMark: {
    position: 'absolute',
    zIndex: 25,
    color: Colors.Black,
    fontSize: 42,
    fontWeight: '700',
    left: 0,
    top: -25,
  },
  assignedPeopleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  assignedUsername: {
    marginRight: 10, // Adjust spacing between usernames
  },
  
});
