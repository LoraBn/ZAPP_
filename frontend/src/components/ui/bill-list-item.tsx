import {Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../../utils/colors';
import {formatDate} from '../../utils/date-utils';
import {Bill} from '../../screens/user-details-screen';

type BillListItemProps = {
  item: Bill;
  index: number;
};

const BillListItem = ({item}: BillListItemProps) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <Pressable
      style={styles.container}
      onPress={() => setIsVisible(prevIsVisible => !prevIsVisible)}>
      <View style={styles.titleContainer}>
        <Text style={[styles.text, styles.bold]}>{item.billing_status}</Text>
        <Text style={styles.text}>{formatDate(item.billing_date)}</Text>
        <Text style={styles.text}>$ {item.total_amount}</Text>
      </View>
      {isVisible && (
        <View>
          <Text style={[styles.text, styles.fontsize16]}>
            Current Meter: {item.current_meter}
          </Text>
          <Text style={[styles.text, styles.fontsize16]}>
            Previous Meter: {item.previous_meter}
          </Text>
          <View style={styles.h20} />
          <Text style={[styles.text, styles.fontsize16]}>
            Total Amount: {item.total_amount}
          </Text>
          <Text style={[styles.text, styles.fontsize16]}>
           {item.billing_status === "PAID"?'Amount Remained: ' : "Amount Remaining:" }{item.remaining_amount || 0}
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
