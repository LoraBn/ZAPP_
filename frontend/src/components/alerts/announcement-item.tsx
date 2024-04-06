import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import {dateFromNow} from '../../utils/date-utils';

type AlertItemProps = {
  item: {
    _id: "1",
    owner_id: 1,
    target_type: "BOTH",
    announcement_title: "Test Title",
    announcement_message: "announcement meajjbiubafabfa",
    announcement_date: "2024-03-24T21:13:54.552Z"
    owner_username: string;
}
  index: number;
};

const AnnouncementItem = ({item}: AlertItemProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.userText}>{item.owner_username}</Text>
      <Text style={styles.alertText}>{item.announcement_title}</Text>
      <Text style={styles.bottomDate}>{item.announcement_date}</Text>
    </View>
  );
};

export default AnnouncementItem;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Black,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  userText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.Black,
  },
  alertText: {fontSize: 10, color: Colors.Black, fontWeight: '400', flex: 1},
  dateContainer: {justifyContent: 'space-between'},
  topDate: {color: Colors.Black, fontWeight: '400', fontSize: 5},
  bottomDate: {
    fontSize: 5,
    color: Colors.Black,
    fontWeight: '700',
    alignSelf: 'flex-end',
  },
});
