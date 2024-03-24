import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import {Equipment} from '../../screens/owner-home-page';

type EquipmentItemProps = {
  item: Equipment;
  index: number;
};

const EquipmentItem = ({item}: EquipmentItemProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.userText}>{item.name}</Text>
      <Text style={styles.alertText}>{item.status}</Text>
    </View>
  );
};

export default EquipmentItem;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Black,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  userText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.Black,
  },
  alertText: {
    fontSize: 10,
    color: Colors.Black,
    fontWeight: '400',
    flex: 1,
    textAlign: 'center',
  },
  dateContainer: {justifyContent: 'space-between'},
  topDate: {color: Colors.Black, fontWeight: '400', fontSize: 5},
  bottomDate: {fontSize: 5, color: Colors.Black, fontWeight: '700'},
});
