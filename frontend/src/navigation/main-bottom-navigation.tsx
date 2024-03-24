import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BottomTab from '../components/navigation/bottom-tab';
import HomeStackNavigation from './home-stack-navigation';
import UsersStackNavigation from './users-stack-navigation';
import Settings from '../screens/settings';
import GeneratorOnOff from '../screens/generator-on-off';
import BillingStackNavigation from './billing-stack-navigation';

type BottomTabParams = {
  GeneratorOnOff: undefined;
  Home: undefined;
  Billing: undefined;
  Users: undefined;
  Settings: undefined;
};

const BottomNavigator = createBottomTabNavigator<BottomTabParams>();

export default function BottomNavigation() {
  return (
    <BottomNavigator.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="Home"
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBar={props => <BottomTab {...props} />}>
      <BottomNavigator.Screen
        name="GeneratorOnOff"
        component={GeneratorOnOff}
      />
      <BottomNavigator.Screen
        name="Billing"
        component={BillingStackNavigation}
      />
      <BottomNavigator.Screen name="Home" component={HomeStackNavigation} />
      <BottomNavigator.Screen name="Users" component={UsersStackNavigation} />
      <BottomNavigator.Screen name="Settings" component={Settings} />
    </BottomNavigator.Navigator>
  );
}
