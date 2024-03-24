import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Announcements from '../screens/announcements';
import EmployeeHomeScreen from '../screens/employee-home-screen';
import UserAlertSystem from '../screens/user-alert-system';

export type EmployeeHomeStackNavigationParams = {
  HomeScreen: undefined;
  Announcements: undefined;
  UserAlertSystem: undefined;
};

const EmployeeHomeStackNavigator =
  createStackNavigator<EmployeeHomeStackNavigationParams>();

export default function EmployeeHomeStackNavigation() {
  return (
    <EmployeeHomeStackNavigator.Navigator screenOptions={{headerShown: false}}>
      <EmployeeHomeStackNavigator.Screen
        name="HomeScreen"
        component={EmployeeHomeScreen}
      />
      <EmployeeHomeStackNavigator.Screen
        name="Announcements"
        component={Announcements}
      />
      <EmployeeHomeStackNavigator.Screen
        name="UserAlertSystem"
        component={UserAlertSystem}
      />
    </EmployeeHomeStackNavigator.Navigator>
  );
}
