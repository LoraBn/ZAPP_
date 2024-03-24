import {StyleSheet, View} from 'react-native';
import React from 'react';

type ListSeperatorProps = {
  horizontal?: boolean;
};

const ListSeperator = ({horizontal}: ListSeperatorProps) => {
  if (horizontal) {
    return <View style={styles.containerHorizontal} />;
  }

  return <View style={styles.container} />;
};

export default ListSeperator;

const styles = StyleSheet.create({
  container: {height: 13},
  containerHorizontal: {width: 13},
});
