import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import React from 'react';
import {Colors} from '../utils/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ImageStrings} from '../assets/image-strings';
import {StackScreenProps} from '@react-navigation/stack';
import {UsersStackNavigationParams} from '../navigation/users-stack-navigation';
import {formatDate} from '../utils/date-utils';
import Card from '../components/ui/card';
import ScreenHeader from '../components/ui/screen-header';
import PaymentItem from '../components/ui/payment-item';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import CarouselIndicators from '../components/ui/carousel-indicators';
import AssignmentItem from '../components/ui/assignment-item';

type EmployeeDetailsScreenProps = StackScreenProps<
  UsersStackNavigationParams,
  'EmployeeDetailsScreen'
>;

export type Payment = {
  id: number;
  date: Date;
  status: 'To be Paid' | 'Paid' | 'Pending';
  total: number;
};

export type Assignment = {
  id: number;
  title: string;
  status: 'Done' | 'Not Done';
  date: Date;
};

export const DUMMY_ASSIGNMENTS: Assignment[] = [
  {id: 1, date: new Date(), status: 'Done', title: 'Testing One'},
  {id: 2, date: new Date(), status: 'Done', title: 'Testing One'},
  {id: 3, date: new Date(), status: 'Done', title: 'Testing One'},
  {id: 4, date: new Date(), status: 'Done', title: 'Testing One'},
];

export const DUMMY_ASSIGNMENTS_2: Assignment[] = [
  {id: 5, date: new Date(), status: 'Not Done', title: 'Testing One'},
  {id: 6, date: new Date(), status: 'Done', title: 'Testing One'},
  {id: 7, date: new Date(), status: 'Not Done', title: 'Testing One'},
  {id: 8, date: new Date(), status: 'Done', title: 'Testing One'},
];

export const DUMMY_PAYMENTS: Payment[] = [
  {
    id: 1,
    date: new Date('2024-01-24'),
    status: 'To be Paid',
    total: 200,
  },
  {
    id: 2,
    date: new Date('2024-01-24'),
    status: 'Pending',
    total: 100,
  },
  {
    id: 3,
    date: new Date('2024-01-24'),
    status: 'Paid',
    total: 100,
  },
  {
    id: 4,
    date: new Date('2024-01-24'),
    status: 'Paid',
    total: 100,
  },
  {
    id: 5,
    date: new Date('2024-01-24'),
    status: 'Paid',
    total: 100,
  },
];
export const DUMMY_PAYMENTS_2: Payment[] = [
  {
    id: 10,
    date: new Date('2024-01-24'),
    status: 'To be Paid',
    total: 200,
  },
  {
    id: 11,
    date: new Date('2024-01-24'),
    status: 'Pending',
    total: 100,
  },
  {
    id: 12,
    date: new Date('2024-01-24'),
    status: 'Paid',
    total: 100,
  },
  {
    id: 13,
    date: new Date('2024-01-24'),
    status: 'Paid',
    total: 100,
  },
  {
    id: 14,
    date: new Date('2024-01-24'),
    status: 'Paid',
    total: 100,
  },
];

const EmployeeDetailsScreen = ({
  navigation,
  route: {params},
}: EmployeeDetailsScreenProps) => {
  const {employee} = params;

  const {width} = useWindowDimensions();

  const insets = useSafeAreaInsets();

  const scrollOffsetX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler(({contentOffset}) => {
    scrollOffsetX.value = contentOffset.x / (width - 61);
  });

  return (
    <View style={[styles.screen, {paddingTop: insets.top}]}>
      <View style={styles.topItemsContainer}>
        <Pressable
          onPress={() =>
            navigation.navigate('AddUserOrEmployee', {
              employee,
            })
          }>
          <Image source={{uri: ImageStrings.EditIcon, height: 43, width: 43}} />
        </Pressable>
        <Image source={{uri: ImageStrings.TrashIcon, height: 21, width: 21}} />
      </View>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.gap15,
          {paddingBottom: insets.bottom + 25},
        ]}>
        <View style={styles.topTextContainer}>
          <Text style={styles.nameText}>
            {employee.name} <Text style={styles.idText}>#{employee.id}</Text>
          </Text>
          <Text style={styles.dateJoinedText}>
            Date Joined - {formatDate(employee.date_joined)}
          </Text>
        </View>
        <View style={styles.accountsUserNameContainer}>
          {/* Change these from API and the user */}
          <Text style={styles.text}>{employee.name}</Text>
        </View>
        <View style={styles.accountsUserNameContainer}>
          <Text style={styles.text}>Salary: ${employee.salary}</Text>
        </View>
        <ScreenHeader>
          <View />
        </ScreenHeader>
        <View style={styles.flatlistContainer}>
          <View style={styles.flatlistTextPadding}>
            <Text style={styles.bigTitle}>Assigned</Text>
          </View>
          <Animated.FlatList
            horizontal
            data={[DUMMY_ASSIGNMENTS, DUMMY_ASSIGNMENTS_2]}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.containerFlatListStyle}
            onScroll={onScroll}
            renderItem={({item}) => {
              return (
                <View style={styles.flatlistArrayContainer}>
                  {item.map((it, idx) => (
                    <AssignmentItem key={it.id} item={it} index={idx} />
                  ))}
                </View>
              );
            }}
          />
          <CarouselIndicators
            items={[DUMMY_PAYMENTS, DUMMY_PAYMENTS_2]}
            animatedIndex={scrollOffsetX}
          />
        </View>
        <Card>
          <Text style={styles.text}>Address:</Text>
          <Text style={styles.text}>{employee.address}</Text>
        </Card>
        <View style={styles.flatlistContainer}>
          <View style={styles.flatlistTextPadding}>
            <Text style={styles.bigTitle}>Salary Payments</Text>
          </View>
          <Animated.FlatList
            horizontal
            data={[DUMMY_PAYMENTS, DUMMY_PAYMENTS_2]}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.containerFlatListStyle}
            onScroll={onScroll}
            renderItem={({item}) => {
              return (
                <View style={styles.flatlistArrayContainer}>
                  {item.map((it, idx) => (
                    <PaymentItem key={it.id} item={it} index={idx} />
                  ))}
                </View>
              );
            }}
          />
          <CarouselIndicators
            items={[DUMMY_PAYMENTS, DUMMY_PAYMENTS_2]}
            animatedIndex={scrollOffsetX}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default EmployeeDetailsScreen;

const styles = StyleSheet.create({
  flatlistTextPadding: {paddingHorizontal: 15},
  flatlistContainer: {
    backgroundColor: Colors.LightGray,
    borderRadius: 25,
    paddingVertical: 15,
  },
  text: {
    color: Colors.Black,
    fontWeight: '700',
  },
  bigTitle: {
    color: Colors.Black,
    fontWeight: '700',
    fontSize: 16,
  },
  flatlistArrayContainer: {
    width: Dimensions.get('screen').width - 61,
    paddingHorizontal: 25,
  },
  containerFlatListStyle: {
    backgroundColor: Colors.LightGray,
    borderRadius: 25,
  },
  smallWeight: {fontSize: 14, fontWeight: '400'},
  saveButtonText: {fontWeight: '700', color: Colors.White, fontSize: 18},
  saveButtonContainer: {alignSelf: 'center'},
  addBillForm: {gap: 25},
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 5,
  },
  textInputStyle: {
    borderRadius: 8,
    padding: 4,
    flex: 0,
    width: '25%',
    textAlign: 'center',
    backgroundColor: Colors.White,
  },
  infoStyle: {
    padding: 4,
    borderRadius: 8,
    width: '25%',
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Gray,
  },
  infoText: {color: Colors.Black, fontWeight: '700'},
  textInputCOntainerBottom: {justifyContent: 'center'},
  paymentContainerStyle: {width: '100%'},
  usernamesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 13,
    borderStyle: 'dotted',
  },
  accountsUserNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  screen: {flex: 1, backgroundColor: Colors.Background, paddingHorizontal: 15},
  gap15: {gap: 15},
  topItemsContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  topTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontWeight: '700',
    fontSize: 24,
    color: Colors.Black,
    lineHeight: 24 * 1.3,
  },
  idText: {fontSize: 14},
  dateJoinedText: {
    fontWeight: '700',
    fontSize: 14,
    color: Colors.Black,
    lineHeight: 14 * 1.3,
  },
  addBillText: {fontWeight: '700', color: Colors.White, fontSize: 16},
});
