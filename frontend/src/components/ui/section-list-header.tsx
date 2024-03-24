import {SectionListData, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import {Alert} from '../../screens/user-alert-system';

type SectionListHeaderProps = {
  section: SectionListData<
    Alert,
    {
      data: Alert[];
      title: 'Open' | 'Closed';
    }
  >;
};

const SectionListHeader = ({section: {title}}: SectionListHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{`${title} Alerts`}</Text>
    </View>
  );
};

export default SectionListHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontWeight: '700',
    color: Colors.Black,
    fontSize: 24,
    lineHeight: 1.2 * 24,
  },
});
