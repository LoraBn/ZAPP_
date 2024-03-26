import {Alert, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useForm} from 'react-hook-form';
import Card from './card';
import TextInput from './text-input';
import {Colors} from '../../utils/colors';
import ElevatedCard from './elevated-card';
import DropdownInput from './dropdown-input';
import { useUser } from '../../storage/use-user';
import client from '../../API/client';

type AddSubscriptionItemProps = {
  onSuccess?: () => void;
};

type AddSubscriptionForm = {
  plan_name: string;
  plan_price: string;
};

const AddSubscriptionItem = ({onSuccess}: AddSubscriptionItemProps) => {
  const {control, handleSubmit} = useForm<AddSubscriptionForm>({
    defaultValues: {
      plan_name: '',
      plan_price: '',
    },
  });

  const {setSocket, socket, accessToken,type} = useUser(
    state => state,
  );

  async function onSubmit(data: AddSubscriptionForm) {
    // HERE
    console.log(data);
    // SUCCESS IF U DONT USE REACT QUERY/RTK
    if (onSuccess) {
      onSuccess();
      try {
        const responce = await client.post(`/${type}/plans`, data, {
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
          <Text style={styles.text}>Plan:</Text>
          <TextInput
            control={control}
            name="plan_name"
            placeholder="Plan"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
          />
        </View>
        <View style={styles.textInputContainer}>
          <Text style={styles.text}>Price:</Text>
          <TextInput
            control={control}
            name="plan_price"
            placeholder="Price"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
            keyboardType="number-pad"
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

export default AddSubscriptionItem;

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
