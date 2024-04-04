import {createStackNavigator} from '@react-navigation/stack';
import React, { useEffect } from 'react';
import AuthStackNavigation from './auth-stack-navigation';
import BottomNavigation from './main-bottom-navigation';
import {useUser} from '../storage/use-user';
import CustomerBottomNavigation from './customer-bottom-navigation';
import EmployeeBottomNavigation from './employee-bottom-navigation';

export type MainAppNavigationParams = {
  AuthStackNavigation: undefined;
  BottomTabNavigation: undefined;
  CustomerTabNavigation: undefined;
  EmployeeTabNavigation: undefined;
};

const MainStackNavigator = createStackNavigator<MainAppNavigationParams>();

export default function MainStackNavigation() {
  const {accessToken, type} = useUser(state => state);

  return (
    <MainStackNavigator.Navigator screenOptions={{headerShown: false}}>
      {!accessToken ? (
        <MainStackNavigator.Screen
          name="AuthStackNavigation"
          component={AuthStackNavigation}
        />
      ) : type === 'owner' ? (
        <MainStackNavigator.Screen
          name="BottomTabNavigation"
          component={BottomNavigation}
        />
      ) : type === 'employee' ? (
        <MainStackNavigator.Screen
          name="EmployeeTabNavigation"
          component={EmployeeBottomNavigation}
        />
      ) : (
        <MainStackNavigator.Screen
          name="CustomerTabNavigation"
          component={CustomerBottomNavigation}
        />
      )}
    </MainStackNavigator.Navigator>
  );
}
