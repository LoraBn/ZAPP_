import {Alert, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useForm} from 'react-hook-form';
import Card from './card';
import TextInput from './text-input';
import {Colors} from '../../utils/colors';
import ElevatedCard from './elevated-card';
import DropdownInput from './dropdown-input';
import {NAMES} from '../../screens/bills-nav-page';
import client from '../../API/client';
import { useUser } from '../../storage/use-user';

type AddExpenseItemProps = {
  onSuccess?: () => void;
};

type AddSubscriptionForm = {
  username: string;
  amount: string;
  description: string;
};

const AddExpenseItem = ({onSuccess}: AddExpenseItemProps) => {
  const {control, handleSubmit} = useForm<AddSubscriptionForm>({
    defaultValues: {
      username: "",
      description: '',
      amount: '',
    },
  });

  const {accessToken,type, employees} = useUser(
    state => state,
  );

  async function onSubmit(data: AddSubscriptionForm) {
    // HERE
    console.log(data);
    // SUCCESS IF U DONT USE REACT QUERY/RTK
    if (onSuccess) {
      onSuccess();
      try {
        const responce = await client.post(`/${type}/expenses`, data, {
          headers: {authorization: `Bearer ${accessToken}`},
        })
        console.log(responce.data.message);
        Alert.alert(responce.data.message)
      } catch (error:any) {
        console.log(error)
        Alert.alert(error.message)
      }
    }
  }

  return (
    <Card style={styles.padding15}>
      <View style={styles.container}>
        <View style={styles.textInputContainer}>
          <Text style={styles.text}>Name:</Text>
          <DropdownInput
            control={control}
            name="username"
            placeholder="Name"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
            items={employees}
          />
        </View>
        <View style={styles.textInputContainer}>
          <Text style={styles.text}>Amount:</Text>
          <TextInput
            control={control}
            name="amount"
            placeholder="Amount"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.textInputContainer}>
          <Text style={styles.text}>Description:</Text>
          <TextInput
            control={control}
            name="description"
            placeholder="Description"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
          />
        </View>
        <ElevatedCard
          onPress={handleSubmit(onSubmit)}
          style={styles.addButtonStyle}
          textStyle={styles.addButtonTextStyle}>
          Add
        </ElevatedCard>
      </View>
    </Card>
  );
};

export default AddExpenseItem;

const styles = StyleSheet.create({
  text: {color: Colors.Black},
  padding15: {padding: 15},
  addButtonStyle: {
    alignSelf: 'center',
  },
  addButtonTextStyle: {color: Colors.White, fontWeight: '700', fontSize: 16},
  textInputContainer: {flexDirection: 'row', alignItems: 'center', gap: 5},
  container: {
    backgroundColor: Colors.LightBlue,
    borderRadius: 25,
    padding: 10,
    gap: 15,
  },
});
