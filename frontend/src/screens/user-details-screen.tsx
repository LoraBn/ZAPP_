import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../utils/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ImageStrings} from '../assets/image-strings';
import {StackScreenProps} from '@react-navigation/stack';
import {UsersStackNavigationParams} from '../navigation/users-stack-navigation';
import {formatDate} from '../utils/date-utils';
import ElevatedCard from '../components/ui/elevated-card';
import Card from '../components/ui/card';
import ScreenHeader from '../components/ui/screen-header';
import TextInput from '../components/ui/text-input';
import {useForm} from 'react-hook-form';
import PaymentItem from '../components/ui/payment-item';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import CarouselIndicators from '../components/ui/carousel-indicators';
import client from '../API/client';
import {useUser} from '../storage/use-user';
import BillItem from '../components/ui/bill-item';
import {chunkArray} from './employee-details-screen';
import {ioString} from '../API/io';

type UserDetailsScreenProps = StackScreenProps<
  UsersStackNavigationParams,
  'UserDetails'
>;

export type Payment = {
  expense_id: number;
  expense_date: Date;
  status: 'To be Paid' | 'Paid' | 'Pending';
  amount: number;
};

export type Bill = {
  bill_id: number;
  customer_id: number;
  owner_id: number;
  previous_meter: string;
  current_meter: string;
  total_kwh: string;
  total_amount: string;
  billing_status: string;
  remaining_amount: string;
  billing_date: Date;
  cycle_id: number;
};

type AddBillForm = {
  previousMeter: string;
  currentMeter: string;
  amountPaid: string;
};

const UserDetailsScreen = ({
  navigation,
  route: {params},
}: UserDetailsScreenProps) => {
  const {user} = params;

  const {width} = useWindowDimensions();

  const insets = useSafeAreaInsets();

  const {type, accessToken, socket, setSocket} = useUser(state => state);
  const [previousMeter, setPreviousMeter] = useState<number | null>(null); // State to hold previous meter value

  const {control, reset, handleSubmit, setValue} = useForm<AddBillForm>({
    defaultValues: {
      amountPaid: '0',
      currentMeter: '0',
      previousMeter: '0',
    },
  });

  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    fetchPreviousMeter();
    fetchAllBills();
    establishWebSocketConnection();
  }, []);

  useEffect(() => {
    fetchPreviousMeter();
    fetchAllBills();
  }, [refresh]);

  const fetchPreviousMeter = async () => {
    try {
      const response = await client.get(
        `${type}/previous-meter/${user.customer_id}`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (response.data) {
        console.log('Success', response.data.previousMeter);
        setPreviousMeter(response.data.previousMeter);
        setValue('previousMeter', response.data.previousMeter);
      } else {
        setPreviousMeter(0);
        setValue('previousMeter', 'Not Found'); // No previous meter available
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function deleteUser() {
    try {
      const response = client.delete(`/${type}/customers/${user.customer_id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if ((await response).data.message) {
        Alert.alert('account Deleted');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const [bills, setBills] = useState<Bill>();
  const [chunckedBills, setChunkedBills] = useState<any>([]);

  const [billInfo, setBillInfo] = useState<any>([]);

  const fetchAllBills = async () => {
    try {
      const responce = await client.get(`${type}/bills/${user.customer_id}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (responce) {
        setBills(responce.data.bills);
        const chunckedBills = chunkArray(responce.data.bills, 4);
        setChunkedBills(chunckedBills);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const scrollOffsetX = useSharedValue(0);

  const [isAdding, setIsAdding] = useState(false);

  const onScroll = useAnimatedScrollHandler(({contentOffset}) => {
    scrollOffsetX.value = contentOffset.x / (width - 61);
  });

  async function onSubmit(data: AddBillForm) {
    //HERE
    console.log(data);

    // SUCCESS? OR React QUEry Or RTK :)
    setIsAdding(false);

    try {
      const response = await client.post(
        `/${type}/bills/${user.customer_id}`,
        {
          current_meter: data.currentMeter,
          total_kwh: billInfo.total_kwh,
          total_amount: billInfo.total_amount_calculated,
          amount_paid: data.amountPaid,
          previous_meter: data.previousMeter,
        },
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response) {
        console.log(response.data);
      }
    } catch (error) {
      // Extract error message from server response
      const errorMessage =
        error.response?.data?.error_message || 'An error occurred';

      // Display error message in an alert
      Alert.alert('Error', errorMessage);
    }

    if (!isAdding) {
      reset();
      setBillInfo('');
    } else {
      setPreviousMeter(null);
      setBillInfo('');
    }
  }

  const establishWebSocketConnection = () => {
    if (!socket) {
      const newSocket = io(ioString);
      setSocket(newSocket);
      console.log('Creating new socket');
    }

    if (socket) {
      socket.on('newBill', data => {
        console.log('New bill received:', data);
        if (user.customer_id === data.customer_id) {
          setRefresh(prev => !prev);
        }
      });
    }
  };

  async function onCalulate(data: AddBillForm) {
    console.log(data);
    try {
      const responce = await client.post(
        `/${type}/calculate-bill/${user.customer_id}`,
        {current_meter: data.currentMeter, previous_meter: data.previousMeter},
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (responce) {
        console.log(responce.data);
        setBillInfo(responce.data.bill_info);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={[styles.screen, {paddingTop: insets.top}]}>
      <View style={styles.topItemsContainer}>
        <Pressable
          onPress={() =>
            navigation.navigate('AddUserOrEmployee', {
              user: user,
            })
          }>
          <Image source={{uri: ImageStrings.EditIcon, height: 43, width: 43}} />
        </Pressable>
        {type === 'owner' &&
          <Pressable
          onPress={() => {
            Alert.alert(
              `Delete customer ${user.username}`,
              `Are you Sure?\nthis will delete all the customer records`,
              [
                {text: 'Yes', onPress: () => deleteUser()},
                {text: 'Cancel', onPress: () => console.log('canceled')},
              ],
              {cancelable: true},
            );
          }}>
          <Image
            source={{uri: ImageStrings.TrashIcon, height: 21, width: 21}}
          />
        </Pressable>}
      </View>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.gap15,
          {paddingBottom: insets.bottom + 25},
        ]}>
        <View style={styles.topTextContainer}>
          <Text style={styles.nameText}>
            {user.username}{' '}
            <Text style={styles.idText}>#{user.customer_id}</Text>
          </Text>
          <Text style={styles.dateJoinedText}>
            Date Joined - {formatDate(user.created_at)}
          </Text>
        </View>
        <View style={styles.accountsUserNameContainer}>
          {/* Change these from API and the user */}
          <Text style={styles.text}>
            {user.name} {user.last_name}
          </Text>
        </View>
        <ScreenHeader>
          {!isAdding && (
            <ElevatedCard
              onPress={() => setIsAdding(prevIsAdding => !prevIsAdding)}
              textStyle={styles.addBillText}>
              Add Bill
            </ElevatedCard>
          )}
        </ScreenHeader>
        <Card style={styles.addBillForm}>
          {isAdding && (
            <View style={styles.textInputContainer}>
              <Text style={styles.text}>Current Meter:</Text>
              <TextInput
                control={control}
                name="currentMeter"
                placeholder="Test"
                backgroundColor={Colors.White}
                textColor={Colors.Black}
                style={styles.textInputStyle}
                keyboardType="decimal-pad"
              />
            </View>
          )}
          <View style={styles.textInputContainer}>
            <Text style={styles.text}>Previous Meter:</Text>
            {previousMeter !== null ? (
              <View style={styles.infoStyle}>
                <Text style={styles.infoText}>{previousMeter}</Text>
              </View>
            ) : !isAdding ? (
              <Text style={styles.textInputStyle}>None</Text>
            ) : (
              <TextInput
                control={control}
                name="previousMeter"
                placeholder="Enter Prev"
                backgroundColor={Colors.White}
                textColor={Colors.Black}
                style={styles.textInputStyle}
                keyboardType="decimal-pad"
              />
            )}
          </View>

          <View style={styles.textInputContainer}>
            <Text style={styles.text}>Total Klw:</Text>
            {isAdding ? (
              <View style={styles.infoStyle}>
                <Text style={styles.infoText}>{billInfo.total_kwh}</Text>
              </View>
            ) : (
              <View style={styles.infoStyle}>
                <Text style={styles.infoText}>
                  {bills && bills.length > 0
                    ? bills[0].total_kwh.toFixed(1)
                    : '0'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.textInputContainer}>
            <Text style={styles.text}>Total Amount (+Taxes):</Text>
            {isAdding ? (
              <View style={styles.infoStyle}>
                <Text style={styles.infoText}>
                  {billInfo.total_amount_calculated?.toFixed(2)} $
                </Text>
              </View>
            ) : (
              <View style={styles.infoStyle}>
                <Text style={styles.infoText}>
                  {bills && bills.length > 0
                    ? bills[0]?.total_amount.toFixed(1)
                    : '0'}{' '}
                  $
                </Text>
              </View>
            )}
          </View>
          <View
            style={[
              styles.textInputContainer,
              styles.textInputCOntainerBottom,
            ]}>
            <Text style={styles.text}>{`Amount ${
              isAdding ? 'Paid' : 'Remaining:'
            }`}</Text>
            {isAdding ? (
              <TextInput
                control={control}
                name="amountPaid"
                placeholder="Amount Paid"
                backgroundColor={Colors.White}
                textColor={Colors.Black}
                style={styles.textInputStyle}
                keyboardType="decimal-pad"
              />
            ) : (
              <View style={styles.infoStyle}>
                <Text style={styles.infoText}>
                  {bills && bills.length > 0
                    ? bills[0].remaining_amount.toFixed(1)
                    : '0'}
                </Text>
              </View>
            )}
          </View>
          {isAdding && (
            <>
              <ElevatedCard
                onPress={handleSubmit(onCalulate)}
                textStyle={styles.saveButtonText}
                style={styles.saveButtonContainer}>
                Calculate
              </ElevatedCard>

              <ElevatedCard
                onPress={handleSubmit(onSubmit)}
                textStyle={styles.saveButtonText}
                style={styles.saveButtonContainer}>
                Save
              </ElevatedCard>
            </>
          )}
        </Card>
        {isAdding && (
          <Card style={styles.addBillForm}>
            <View style={styles.textInputContainer}>
              <Text style={styles.text}>Last Meter:</Text>
              <View style={styles.infoStyle}>
                <Text style={styles.infoText}>
                  {bills && bills.length > 0 ? bills[0].current_meter : 'None'}
                </Text>
              </View>
            </View>
            <View style={styles.textInputContainer}>
              <Text style={styles.text}>Initial Meter:</Text>
              <View style={styles.infoStyle}>
                <Text style={styles.infoText}>
                  {bills && bills.length > 0 ? bills[0].previous_meter : 'None'}
                </Text>
              </View>
            </View>
            <View style={styles.textInputContainer}>
              <Text style={styles.text}>Total KwH:</Text>
              <View style={styles.infoStyle}>
                <Text style={styles.infoText}>
                  {bills && bills.length > 0 ? bills[0].total_kwh : 'None'}
                </Text>
              </View>
            </View>
            <View style={styles.textInputContainer}>
              <Text style={styles.text}>Total Amount:</Text>
              <View style={styles.infoStyle}>
                <Text style={styles.infoText}>
                  {bills && bills.length > 0
                    ? `${bills[0].total_amount} $`
                    : 'None'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {isAdding && (
          <Card style={styles.addBillForm}>
            <View
              style={[
                styles.textInputContainer,
                styles.textInputCOntainerBottom,
              ]}>
              <Text style={styles.text}>Total Amount Remaining:</Text>
              <View style={styles.infoStyle}>
                <Text style={styles.infoText}>
                  {bills && bills.length > 0 ? bills[0].remaining_amount : '0'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.textInputContainer,
                styles.textInputCOntainerBottom,
              ]}>
              <Text style={[styles.infoText, styles.smallWeight]}>
                Note: the total amount remaining is added to the new bill’s
                total.
              </Text>
            </View>
          </Card>
        )}
        {!isAdding && (
          <>
            <Card>
              <Text style={styles.text}>Address:</Text>
              <Text style={styles.text}>{user.address}</Text>
            </Card>
            <View style={styles.flatlistContainer}>
              <View style={styles.flatlistTextPadding}>
                <Text style={styles.bigTitle}>Payments</Text>
              </View>
              <Animated.FlatList
                horizontal
                data={chunckedBills}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.containerFlatListStyle}
                onScroll={onScroll}
                renderItem={({item}) => {
                  return (
                    <View style={styles.flatlistArrayContainer}>
                      {item.map((it, idx) => (
                        <BillItem key={it.bill_id} item={it} index={idx} />
                      ))}
                    </View>
                  );
                }}
              />
              <CarouselIndicators
                items={chunckedBills}
                animatedIndex={scrollOffsetX}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default UserDetailsScreen;

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
    minWidth: '25%',
    maxWidth: '65%',
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
