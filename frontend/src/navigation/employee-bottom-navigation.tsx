import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import UsersStackNavigation from './users-stack-navigation';
import Settings from '../screens/settings';
import UserAlertSystem from '../screens/user-alert-system';
import EmployeeBottomTab from '../components/navigation/employee-tab';
import EmployeeHomeStackNavigation from './employee-home-stack-navigation';

type EmployeeBottomTabParams = {
  Alerts: undefined;
  Home: undefined;
  Users: undefined;
  Settings: undefined;
};

const EmployeeBottomTabNavigator =
  createBottomTabNavigator<EmployeeBottomTabParams>();

export default function EmployeeBottomNavigation() {
  return (
    <EmployeeBottomTabNavigator.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="Home"
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBar={props => <EmployeeBottomTab {...props} />}>
      <EmployeeBottomTabNavigator.Screen
        name="Alerts"
        component={UserAlertSystem}
      />
      <EmployeeBottomTabNavigator.Screen
        name="Home"
        component={EmployeeHomeStackNavigation}
      />
      <EmployeeBottomTabNavigator.Screen
        name="Users"
        component={UsersStackNavigation}
      />
      <EmployeeBottomTabNavigator.Screen name="Settings" component={Settings} />
    </EmployeeBottomTabNavigator.Navigator>
  );
}
