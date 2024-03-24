import {Image, Pressable, StyleSheet, View} from 'react-native';
import React from 'react';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from '../../utils/colors';
import {ImageStrings} from '../../assets/image-strings';

const BottomTab = ({navigation}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom + 10}]}>
      <Pressable onPress={() => navigation.navigate('GeneratorOnOff')}>
        <Image source={{uri: ImageStrings.Calendar, height: 54, width: 54}} />
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Billing')}>
        <Image source={{uri: ImageStrings.Bill, height: 45, width: 45}} />
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Home')}>
        <Image source={{uri: ImageStrings.Zapp, height: 54, width: 68}} />
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Users')}>
        <Image source={{uri: ImageStrings.Network, height: 54, width: 54}} />
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Settings')}>
        <Image source={{uri: ImageStrings.Profile, height: 54, width: 54}} />
      </Pressable>
    </View>
  );
};

export default BottomTab;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.Blue,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 5,
  },
});
