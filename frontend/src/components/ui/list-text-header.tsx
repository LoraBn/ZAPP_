import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';

type ListTextHeaderProps = {
  children?: string;
};

const ListTextHeader = ({children}: ListTextHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
};

export default ListTextHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  text: {color: Colors.Black, fontSize: 24, fontWeight: '700'},
});
