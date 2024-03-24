import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../utils/colors';
import WhiteCard from '../components/ui/white-card';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Card from '../components/ui/card';
import {BarChart} from 'react-native-gifted-charts';
import {ImageStrings} from '../assets/image-strings';
import AlertItem from '../components/alerts/alert-item';
import ViewAll from '../components/ui/view-all';
import {StackScreenProps} from '@react-navigation/stack';
import {HomeStackNavigatorParams} from '../navigation/home-stack-navigation';
import EquipmentItem from '../components/ui/equipment-item';

export const DUMMY_ALERTS = [
  {
    id: 1,
    user: {name: 'User'},
    alert:
      'Lorem ipsum dolor dolor dolor dolor dolor dolor dolor dolor',
    date: new Date(),
  },
  {
    id: 2,
    user: {name: 'User'},
    alert:
      'Lorem ipsum dolor dolor dolor dolor dolor dolor dolor dolor',
    date: new Date(),
  },
  {
    id: 3,
    user: {name: 'User'},
    alert:
      'Lorem ipsum dolor dolor dolor dolor  dolor dolor dolor dolor',
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

type OwnerHomePageProps = StackScreenProps<
  HomeStackNavigatorParams,
  'HomeScreen'
>;

const OwnerHomePage = ({navigation}: OwnerHomePageProps) => {
  const insets = useSafeAreaInsets();

  const [width, setWidth] = useState(0);

  const isPaid = false;
  const barData = [
    {value: 1.5, label: 'A', frontColor: '#3373a1'},
    {value: 3, label: 'B', frontColor: '#e1812b'},
    {value: 4.5, label: 'C', frontColor: '#3a923b'},
    {value: 2, label: 'D', frontColor: '#bf3d3d'},
    {value: 5, label: 'E', frontColor: '#9272b1'},
  ];

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollViewContent,
        {paddingTop: insets.top + 15},
      ]}
      style={styles.screen}>
      <View style={styles.profitFeesContainer}>
        <Text style={styles.profitText}>Profit</Text>
        <WhiteCard style={styles.amountContainer}>
          <Text style={styles.amountText}>$ 56666</Text>
        </WhiteCard>
        <Text style={styles.profitText}>Fees</Text>
        <WhiteCard
          style={[
            styles.amountContainer,
            {backgroundColor: isPaid ? Colors.Green : Colors.White},
          ]}>
          <Text style={styles.amountText}>{isPaid ? 'PAID' : '$ 100'}</Text>
        </WhiteCard>
      </View>
      <Card
        onLayout={({
          nativeEvent: {
            layout: {width: wid},
          },
        }) => {
          setWidth(wid);
        }}
        onPress={() => navigation.navigate('AnalyticsScreen')}>
        <Text style={styles.analyticsText}>Analytics</Text>
        <Text style={styles.name}>Name</Text>
        <BarChart data={barData} width={width - 120} maxValue={5} />
      </Card>
      <View>
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertTitle}>Equipments</Text>
          <View>
            <View style={styles.h45} />
          </View>
        </View>
        <Card style={styles.alertContainer}>
          <WhiteCard variant="secondary">
            <FlatList
              contentContainerStyle={styles.flatlistContainer}
              data={DUMMY_EQUIPMENT}
              scrollEnabled={false}
              renderItem={EquipmentItem}
              ListFooterComponent={() =>
                ViewAll({onPress: () => navigation.navigate('Equipments')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
      <View>
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertTitle}>Employee Alerts</Text>
          <Pressable onPress={() => navigation.navigate('UserAlertSystem')}>
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
                ViewAll({onPress: () => navigation.navigate('UserAlertSystem')})
              }
            />
          </WhiteCard>
        </Card>
      </View>
      <View>
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertTitle}>Customers Alerts</Text>
          <Pressable onPress={() => navigation.navigate('UserAlertSystem')}>
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
                ViewAll({onPress: () => navigation.navigate('UserAlertSystem')})
              }
            />
          </WhiteCard>
        </Card>
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
    </ScrollView>
  );
};

export default OwnerHomePage;

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
