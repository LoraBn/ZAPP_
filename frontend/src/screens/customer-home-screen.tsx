import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {Colors} from '../utils/colors';
import WhiteCard from '../components/ui/white-card';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Card from '../components/ui/card';
import {ImageStrings} from '../assets/image-strings';
import AlertItem from '../components/alerts/alert-item';
import ViewAll from '../components/ui/view-all';
import {StackScreenProps} from '@react-navigation/stack';
import {CustomerHomeStackNavigationParams} from '../navigation/customer-home-stack-navigation';
import TimeRemaining from '../components/ui/time-remaining';
import Schedule from '../components/ui/schedule';

export const DUMMY_ALERTS = [
  {
    id: 1,
    user: {name: 'User'},
    alert:
      'Lorem ipsum dolor dolor dolor dolor samira  dolor dolor dolor dolor',
    date: new Date(),
  },
  {
    id: 2,
    user: {name: 'User'},
    alert:
      'Lorem ipsum dolor dolor dolor dolor samira  dolor dolor dolor dolor',
    date: new Date(),
  },
  {
    id: 3,
    user: {name: 'User'},
    alert:
      'Lorem ipsum dolor dolor dolor dolor samira dolor dolor dolor dolor',
    date: new Date(),
  },
];

export type Equipment = {
  id: number;
  name: string;
  price: number;
  description: string;
  status: 'Active' | 'Inactive';
};

export const DUMMY_EQUIPMENT: Equipment[] = [
  {
    description: 'Descriptionets',
    id: 1,
    name: 'Motor 1',
    price: 200,
    status: 'Active',
  },
  {
    description: 'Descriptionets',
    id: 2,
    name: 'Motor 2',
    price: 200,
    status: 'Active',
  },
  {
    description: 'Descriptionets',
    id: 3,
    name: 'Motor 3',
    price: 200,
    status: 'Active',
  },
  {
    description: 'Descriptionets',
    id: 4,
    name: 'Motor 4',
    price: 200,
    status: 'Inactive',
  },
  {
    description: 'Descriptionets',
    id: 5,
    name: 'Motor 5',
    price: 300,
    status: 'Active',
  },
  {
    description: 'Descriptionets',
    id: 6,
    name: 'Motor 6',
    price: 100,
    status: 'Active',
  },
];

type CustomerHomeScreenProps = StackScreenProps<
  CustomerHomeStackNavigationParams,
  'HomeScreen'
>;

const CustomerHomeScreen = ({navigation}: CustomerHomeScreenProps) => {
  const insets = useSafeAreaInsets();

  const isPaid = false;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollViewContent,
        {paddingTop: insets.top + 15},
      ]}
      style={styles.screen}>
      <View style={styles.profitFeesContainer}>
        <Text style={styles.profitText}>Kwh Price</Text>
        <WhiteCard style={styles.amountContainer}>
          <Text style={styles.amountText}>$ 56666</Text>
        </WhiteCard>
        <Text style={styles.profitText} numberOfLines={2}>
          Pending
        </Text>
        <WhiteCard
          style={[
            styles.amountContainer,
            {backgroundColor: isPaid ? Colors.Green : Colors.White},
          ]}>
          <Text style={styles.amountText}>{isPaid ? 'PAID' : '$ 100'}</Text>
        </WhiteCard>
      </View>
      <View>
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertTitle}>Announcements</Text>
          <Pressable onPress={() => navigation.navigate('Announcements')}>
            <Image source={{uri: ImageStrings.Alert, height: 45, width: 45}} />
          </Pressable>
        </View>
        <Card style={styles.alertContainer}>
          <WhiteCard variant="secondary">
            <FlatList
              contentContainerStyle={styles.flatlistContainer}
              data={DUMMY_ALERTS}
              scrollEnabled={false}
              renderItem={AlertItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('Announcements')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
      <TimeRemaining />
      <Schedule />
    </ScrollView>
  );
};

export default CustomerHomeScreen;

const styles = StyleSheet.create({
  h45: {height: 45},
  alertContainer: {padding: 20},
  flatlistContainer: {
    paddingTop: 10,
  },
  scrollViewContent: {gap: 15, paddingHorizontal: 15, paddingBottom: 45},
  analyticsText: {
    textAlign: 'center',
    color: Colors.White,
    elevation: 4,
    fontSize: 24,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  name: {color: Colors.White},
  profitFeesContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderStyle: 'dotted',
    gap: 4,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  profitText: {fontSize: 14, color: Colors.Black},
  amountText: {fontWeight: '400', fontSize: 14, color: Colors.Black},
  amountContainer: {
    marginTop: 15,
  },
  alertTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: Colors.Black,
    lineHeight: 16 * 1.3,
  },
  alertTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
