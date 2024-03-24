import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Settings from '../screens/settings';
import BillingHistory from '../screens/billing-history';
import UserAlertSystem from '../screens/user-alert-system';
import CustomerBottomTab from '../components/navigation/customer-bottom-tab';
import CustomerHomeStackNavigation from './customer-home-stack-navigation';

type CustomerBottomTabParams = {
  BillingHistory: undefined;
  Home: undefined;
  Alerts: undefined;
  Settings: undefined;
};

const CustomerBottomTabNavigator =
  createBottomTabNavigator<CustomerBottomTabParams>();

export default function CustomerBottomNavigation() {
  return (
    <CustomerBottomTabNavigator.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="Home"
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBar={props => <CustomerBottomTab {...props} />}>
      <CustomerBottomTabNavigator.Screen
        name="BillingHistory"
        component={BillingHistory}
      />
      <CustomerBottomTabNavigator.Screen
        name="Home"
        component={CustomerHomeStackNavigation}
      />
      <CustomerBottomTabNavigator.Screen
        name="Alerts"
        component={UserAlertSystem}
      />
      <CustomerBottomTabNavigator.Screen name="Settings" component={Settings} />
    </CustomerBottomTabNavigator.Navigator>
  );
}
