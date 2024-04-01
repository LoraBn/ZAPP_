import {createStackNavigator} from '@react-navigation/stack';
import React, { useEffect } from 'react';
import AuthStackNavigation from './auth-stack-navigation';
import BottomNavigation from './main-bottom-navigation';
import {useUser} from '../storage/use-user';
import CustomerBottomNavigation from './customer-bottom-navigation';
import EmployeeBottomNavigation from './employee-bottom-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../API/client';

export type MainAppNavigationParams = {
  AuthStackNavigation: undefined;
  BottomTabNavigation: undefined;
  CustomerTabNavigation: undefined;
  EmployeeTabNavigation: undefined;
};

const MainStackNavigator = createStackNavigator<MainAppNavigationParams>();

export default function MainStackNavigation() {
  const {accessToken, type, setAccessToken, setType} = useUser(state => state);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userType = await AsyncStorage.getItem('userType');
        if (token && userType) {
          const response = await client.get('/auth', {
            headers: {
              authorization: `Bearer ${token}`,
              type: userType,
            },
          });
  
          // Assuming the response includes a 'success' property
          if (response.data.success) {
            console.log('Hi auth')
            setAccessToken(token);
            setType(userType);
            console.log(type)
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
  
  

  console.log(type);
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
