import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Announcements from '../screens/announcements';
import CustomerHomeScreen from '../screens/customer-home-screen';

export type CustomerHomeStackNavigationParams = {
  HomeScreen: undefined;
  Announcements: undefined;
};

const CustomerHomeStackNavigator =
  createStackNavigator<CustomerHomeStackNavigationParams>();

export default function CustomerHomeStackNavigation() {
  return (
    <CustomerHomeStackNavigator.Navigator screenOptions={{headerShown: false}}>
      <CustomerHomeStackNavigator.Screen
        name="HomeScreen"
        component={CustomerHomeScreen}
      />
      <CustomerHomeStackNavigator.Screen
        name="Announcements"
        component={Announcements}
      />
    </CustomerHomeStackNavigator.Navigator>
  );
}
