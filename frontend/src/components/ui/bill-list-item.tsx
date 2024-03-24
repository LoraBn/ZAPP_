import {Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../../utils/colors';
import {formatDate} from '../../utils/date-utils';
import {Bill} from '../../screens/bills-nav-page';

type BillListItemProps = {
  item: Bill;
  index: number;
};

const BillListItem = ({item}: BillListItemProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Item should come from api with prefetched data etc...
  return (
    <Pressable
      style={styles.container}
      onPress={() => setIsVisible(prevIsVisible => !prevIsVisible)}>
      <View style={styles.titleContainer}>
        <Text style={[styles.text, styles.bold]}>{item.status}</Text>
        <Text style={styles.text}>{formatDate(item.date)}</Text>
        <Text style={styles.text}>$ {item.amount}</Text>
      </View>
      {isVisible && (
        <View>
          <Text style={[styles.text, styles.fontsize16]}>
            Current Meter: 556565
          </Text>
          <Text style={[styles.text, styles.fontsize16]}>
            Previous Meter: 556565
          </Text>
          <View style={styles.h20} />
          <Text style={[styles.text, styles.fontsize16]}>
            Total Amount: 556565
          </Text>
          <Text style={[styles.text, styles.fontsize16]}>
            Amount Remaining: 556565
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export default BillListItem;

const styles = StyleSheet.create({
  h20: {height: 20},
  container: {
    backgroundColor: Colors.LightGray,
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
  fontsize16: {fontSize: 18},
  bold: {fontSize: 16},
});
