import {Pressable, StyleSheet, Text} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';

type ViewAllProps = {
  onPress?: () => void;
};

const ViewAll = ({onPress}: ViewAllProps) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={styles.viewAllText}>View All</Text>
    </Pressable>
  );
};

export default ViewAll;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
    justifyContent: 'center',
  },
  viewAllText: {
    fontSize: 15,
    lineHeight: 15 * 1.5,
    color: Colors.Black,
    fontWeight: '700',
  },
});
