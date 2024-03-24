import {Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {Announcement} from '../../screens/announcements';
import {Colors} from '../../utils/colors';
import {formatDate} from '../../utils/date-utils';

type AnnouncementListItemProps = {
  item: Announcement;
  index: number;
};

const AnnouncementListItem = ({item}: AnnouncementListItemProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const bottomWidth = {borderBottomWidth: isVisible ? 1 : 0};

  return (
    <Pressable
      style={styles.container}
      onPress={() => setIsVisible(prevIsVisible => !prevIsVisible)}>
      <View style={[styles.titleContainer, bottomWidth]}>
        <Text style={[styles.text, styles.bold]}>{item.title}</Text>
        <Text style={styles.text}>{formatDate(item.date)}</Text>
      </View>
      {isVisible && (
        <View>
          <Text style={styles.text}>{item.description}</Text>
        </View>
      )}
    </Pressable>
  );
};

export default AnnouncementListItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.Gray,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    borderBottomColor: Colors.Black,
    paddingBottom: 5,
  },
  text: {color: Colors.Black, fontWeight: '700'},
  bold: {fontSize: 16},
});
