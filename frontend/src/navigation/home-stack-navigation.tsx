import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OwnerHomePage from '../screens/owner-home-page';
import AnalyticsScreen from '../screens/analytics-screen';
import Announcements from '../screens/announcements';
import AddAnnouncements from '../screens/add-announcements';
import UserAlertSystem from '../screens/user-alert-system';
import Equipments from '../screens/equipments';

export type HomeStackNavigatorParams = {
  HomeScreen: undefined;
  AnalyticsScreen: undefined;
  Announcements: undefined;
  AddAnnouncements: undefined;
  UserAlertSystem: undefined;
  Equipments: undefined;
};

const HomeStackNavigator = createStackNavigator<HomeStackNavigatorParams>();

export default function HomeStackNavigation() {
  return (
    <HomeStackNavigator.Navigator screenOptions={{headerShown: false}}>
      <HomeStackNavigator.Screen name="HomeScreen" component={OwnerHomePage} />
      <HomeStackNavigator.Screen
        name="AnalyticsScreen"
        component={AnalyticsScreen}
      />
      <HomeStackNavigator.Screen
        name="Announcements"
        component={Announcements}
      />
      <HomeStackNavigator.Screen
        name="AddAnnouncements"
        component={AddAnnouncements}
      />
      <HomeStackNavigator.Screen
        name="UserAlertSystem"
        component={UserAlertSystem}
      />
      <HomeStackNavigator.Screen name="Equipments" component={Equipments} />
    </HomeStackNavigator.Navigator>
  );
}
