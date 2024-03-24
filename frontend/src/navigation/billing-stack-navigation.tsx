import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import BillingManagement from '../screens/billing-management';
import {User} from '../screens/users-dashboard';
import UserDetailsScreen from '../screens/user-details-screen';
import BillingAfterChoosingUser from '../screens/billing-after-choosing-user';
import Equipments from '../screens/equipments';
import BillsNavPage from '../screens/bills-nav-page';
import SubscriptionPlans from '../screens/subscription-plans';
import Expenses from '../screens/expenses';
import Bills from '../screens/bills';

export type BillingStackNavigatorParams = {
  BillsNavPage: undefined;
  BillingManagement: undefined;
  UserDetails: {user: User};
  BillingAfterChoosingUser: {user: User};
  Equipments: undefined;
  SubscriptionPlans: undefined;
  Expenses: undefined;
  Bills: undefined;
};

const BillingStackNavigator =
  createStackNavigator<BillingStackNavigatorParams>();

export default function BillingStackNavigation() {
  return (
    <BillingStackNavigator.Navigator screenOptions={{headerShown: false}}>
      <BillingStackNavigator.Screen
        name="BillsNavPage"
        component={BillsNavPage}
      />
      <BillingStackNavigator.Screen
        name="BillingManagement"
        component={BillingManagement}
      />
      <BillingStackNavigator.Screen
        name="UserDetails"
        component={UserDetailsScreen}
      />
      <BillingStackNavigator.Screen
        name="BillingAfterChoosingUser"
        component={BillingAfterChoosingUser}
      />
      <BillingStackNavigator.Screen name="Equipments" component={Equipments} />
      <BillingStackNavigator.Screen
        name="SubscriptionPlans"
        component={SubscriptionPlans}
      />
      <BillingStackNavigator.Screen name="Expenses" component={Expenses} />
      <BillingStackNavigator.Screen name="Bills" component={Bills} />
    </BillingStackNavigator.Navigator>
  );
}
