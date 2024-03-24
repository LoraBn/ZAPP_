import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Signin from '../screens/signin';
import Signup from '../screens/signup';

export type AuthStackParams = {
  Signin: undefined;
  Signup: undefined;
};

const AuthStackNavigator = createStackNavigator<AuthStackParams>();

export default function AuthStackNavigation() {
  return (
    <AuthStackNavigator.Navigator screenOptions={{headerShown: false}}>
      <AuthStackNavigator.Screen name="Signin" component={Signin} />
      <AuthStackNavigator.Screen name="Signup" component={Signup} />
    </AuthStackNavigator.Navigator>
  );
}
