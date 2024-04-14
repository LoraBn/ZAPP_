import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import {Colors} from '../utils/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ImageStrings} from '../assets/image-strings';
import TextInput from '../components/ui/text-input';
import {useForm} from 'react-hook-form';
import DropdownInput from '../components/ui/dropdown-input';
import ElevatedCard from '../components/ui/elevated-card';
import {StackScreenProps} from '@react-navigation/stack';
import {UsersStackNavigationParams} from '../navigation/users-stack-navigation';
import {useUser} from '../storage/use-user';
import client from '../API/client';

type AddUserOrEmployeeForm = {
  name: string;
  lastName: string;
  username: string;
  password: string;
  type: 'Customer' | 'Employee';
  plan: '10Amp' | '20Amp' | '5Amp' | '2Amp' | null;
  address: string;
  date: Date;
  salary: string;
  equipment: string;
};

const USER_TYPES = ['Customer', 'Employee'];

type AddEditUserOrEmployeeScreenProps = StackScreenProps<
  UsersStackNavigationParams,
  'AddUserOrEmployee'
>;

const AddEditUserOrEmployeeScreen = ({
  navigation,
  route: {params},
}: AddEditUserOrEmployeeScreenProps) => {
  // PARAMS TO PREFILL
  console.log(params, 'PARAMS');

  const userType = useUser(state => state.type);

  const {control, watch, handleSubmit, setValue, getValues} =
    useForm<AddUserOrEmployeeForm>({
      defaultValues: {
        lastName: '',
        password: '',
        username: '',
        address: params.employee?.address || params.user?.address,
        date: new Date(),
        name: params?.employee?.name || params.user?.name || '',
        plan: params.user?.plan,
        type: params?.employee ? 'Employee' : 'Customer',
        salary: params.employee?.salary
          ? params.employee.salary?.toString()
          : '',
      },
    });

  const insets = useSafeAreaInsets();

  const {accessToken, plans, equipments} = useUser(state => state);

  useEffect(() => {
    setValue('name', params?.user?.name || params?.employee?.name || '');
    setValue(
      'lastName',
      params?.user?.last_name || params?.employee?.last_name || '',
    );
    setValue(
      'username',
      params?.user?.username || params?.employee?.username || '',
    );
    setValue(
      'address',
      params?.user?.address || params?.employee?.address || '',
    );
    setValue(
      'date',
      params?.user?.created_at || params?.employee?.created_at || new Date(),
    );
    setValue('plan', params?.user?.plan || params?.employee?.plan || null);
    setValue('type', params?.employee ? 'Employee' : 'Customer');
    setValue(
      'salary',
      params?.employee?.salary ? params?.employee?.salary.toString() : '',
    );
    setValue(
      'equipment',
      params?.user?.equipment || params?.employee?.equipment || null,
    );

    if (plans) {
      const selectedPlan = plans.find(
        plan => plan.plan_id === String(params?.user?.plan_id),
      );
      setValue('plan', selectedPlan ? selectedPlan.plan_name : null);
    }

    if (equipments && params?.user?.equipment_id) {
      const selectedEquipment = equipments.find(
        eq => eq.equipment_id === params?.user?.equipment_id,
      );
      setValue('equipment', selectedEquipment ? selectedEquipment.name : null);
    }
  }, [params, plans, equipments]);

  async function onDelete() {
    try {
      let userId;
      let type;
      if (params.employee?.employee_id) {
        userId = params.employee?.employee_id;
        type = 'employees';
      } else if (params.user?.customer_id) {
        userId = params.user.customer_id;
        type = 'customers';
      }
      const responce = await client.delete(`/owner/${type}/${userId}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if(responce.success){
        console.log('Deleted')
      }
    } catch (error) {
      console.log(error)
      Alert.alert('error Deleting account');
    }
  }

  function onSubmit({
    address,
    name,
    lastName,
    plan,
    type,
    username,
    password,
    salary,
    equipment,
  }: AddUserOrEmployeeForm) {
    Alert.alert(
      'Confirm?',
      `Do you confirm adding the user?\nUser Details:\nUsername: ${getValues(
        'username',
      )}\nPassword: ${getValues('password')}`,
      [
        {text: 'Cancel', onPress: () => navigation.goBack()},
        {
          text: 'Save',
          onPress: () => {
            let reqBody;
            switch (type) {
              case 'Customer':
                reqBody = {
                  name,
                  lastName,
                  username,
                  password,
                  address,
                  planName: plan,
                  equipmentName: equipment,
                };
                console.log(reqBody);
                break;
              case 'Employee':
                reqBody = {
                  name,
                  lastName,
                  username,
                  password,
                  salary,
                };
                break;
              default:
                break;
            }

            if (params.user || params.employee) {
              console.log(type.toLocaleLowerCase());
              const responce = client
                .put(
                  `/${userType}/${type.toLocaleLowerCase()}s/${
                    params.employee?.username || params.user?.username
                  }`,
                  reqBody,
                  {
                    headers: {
                      authorization: `Bearer ${accessToken}`,
                    },
                  },
                )
                .then(() => {
                  console.log('Update successful', responce.data);
                })
                .catch(error => {
                  // Handle error if needed
                  console.error('Update failed:', error);
                });
            } else {
              client
                .post(`/${userType}/${type.toLocaleLowerCase()}s`, reqBody, {
                  headers: {
                    authorization: `Bearer ${accessToken}`,
                  },
                })
                .then(() => {
                  console.log('Creation successful');
                })
                .catch(error => {
                  console.error('Creation failed:', error);
                });
            }
            navigation.goBack();
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.contentContainerStyle,
        {paddingTop: insets.top + 15},
      ]}>
      <View style={styles.topItemsContainer}>
      <Pressable onPress={() => {
              Alert.alert(
                "Are you sure?",
                "Deleting the account will delete all records related to this account",
                [
                  {
                    text: 'Delete',
                    onPress: () => handleSubmit(onDelete)
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  }
                ]
              );
            }}>
              <Image
                source={{ uri: ImageStrings.TrashIcon }}
                style={{ height: 21, width: 21 }}
              />
            </Pressable>

          <Pressable onPress={handleSubmit(onSubmit)}>
          <Image source={{uri: ImageStrings.SaveIcon, height: 21, width: 21}} />
        </Pressable>
      </View>
      <View style={styles.flexRow}>
        <DropdownInput
          control={control}
          name="type"
          items={USER_TYPES}
          defaultValue={'user'}
          disabled={userType === 'employee'}
        />
      </View>
      <View style={styles.fullNameTextInputContainer}>
        <Image
          source={{uri: ImageStrings.ProfileIcon, height: 31, width: 31}}
          borderRadius={100}
        />
      </View>
      <View style={styles.personalDetailsContainer}>
        <TextInput
          control={control}
          name="name"
          defaultValue={''}
          backgroundColor={Colors.Blue}
          textColor={Colors.White}
          placeholder="Name"
        />
        <TextInput
          control={control}
          name="username"
          defaultValue={''}
          backgroundColor={Colors.Blue}
          textColor={Colors.White}
          placeholder="Username"
        />
      </View>
      <View style={styles.personalDetailsContainer}>
        <TextInput
          control={control}
          name="lastName"
          defaultValue={''}
          backgroundColor={Colors.Blue}
          textColor={Colors.White}
          placeholder="Last Name"
        />
        <TextInput
          control={control}
          name="password"
          defaultValue={''}
          backgroundColor={Colors.Blue}
          textColor={Colors.White}
          placeholder="Password"
        />
      </View>
      {watch('type') === 'Customer' ? (
        <>
          <View style={styles.fullNameTextInputContainer}>
            <Text style={styles.label}>Plan:</Text>
            <DropdownInput
              control={control}
              name="plan"
              placeholder="Plan"
              items={plans?.map(plan => plan.plan_name)}
            />
          </View>
          <View style={styles.fullNameTextInputContainer}>
            <Text style={styles.label}>Equipment:</Text>
            <DropdownInput
              control={control}
              name="equipment"
              placeholder="Equipment"
              items={equipments?.map(eq => eq.name)}
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.fullNameTextInputContainer}>
            <Text style={styles.label}>Salary:</Text>
            <TextInput
              textColor={Colors.Black}
              control={control}
              name="salary"
              placeholder="Salary"
              keyboardType="decimal-pad"
            />
          </View>
        </>
      )}
      <View style={styles.fullNameTextInputContainer}>
        <Text style={styles.label}>Address:</Text>
        <TextInput
          textColor={Colors.Black}
          control={control}
          name="address"
          placeholder="Address"
        />
      </View>
      <View style={styles.generateIdContainer}>
        <ElevatedCard
          onPress={handleSubmit(onSubmit)}
          textStyle={styles.generateIdText}>
          {params.user || params.employee ? 'Update Account' : 'Create Account'}
        </ElevatedCard>
      </View>
    </ScrollView>
  );
};

export default AddEditUserOrEmployeeScreen;

const styles = StyleSheet.create({
  z200: {zIndex: 200},
  idText: {
    color: Colors.Black,
    fontSize: 12,
    lineHeight: 12 * 1.2,
  },
  generateIdContainer: {flexDirection: 'row', justifyContent: 'center'},
  generateIdText: {
    fontSize: 24,
    lineHeight: 24 * 1.2,
    color: Colors.White,
    fontWeight: '700',
  },
  flexRow: {flexDirection: 'row', justifyContent: 'center'},
  label: {
    color: Colors.Black,
    fontSize: 24,
    lineHeight: 24 * 1.3,
    fontWeight: '700',
  },
  fullNameTextInputContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dateText: {color: Colors.Black, fontWeight: '700'},
  topItemsContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  screen: {flex: 1, backgroundColor: Colors.Background},
  contentContainerStyle: {paddingHorizontal: 15, gap: 25},
  personalDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
