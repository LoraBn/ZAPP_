import {Alert, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import DropdownInput from './dropdown-input';
import {useForm} from 'react-hook-form';
import ElevatedCard from './elevated-card';
import TextInput from './text-input';
import client from '../../API/client';
import {useUser} from '../../storage/use-user';

type CreateAlertForm = {
  alertType: 'Maintenance' | 'Outage' | 'Customer Fix' | 'Other';
  alertMessage: string;
};

type CreateAlertProps = {
  onSuccess?: () => void;
};

const CreateAlert = ({onSuccess}: CreateAlertProps) => {
  const {control, reset, handleSubmit} = useForm<CreateAlertForm>({
    defaultValues: {alertMessage: '', alertType: 'Maintenance'},
  });

  const {type, accessToken} = useUser(state => state);

  async function onSubmit(data: CreateAlertForm) {
    // HERE
    console.log(data);
    try {
      const reqBody = {
        alert_type: data.alertType.toUpperCase(),
        alert_message: data.alertMessage
      }
      const responce = await client.post(`/${type}/issues`, reqBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (responce.data){
        Alert.alert(responce.data.message)
      }
    } catch (error: any) {
      console.log(error.message);
    }

    if (onSuccess) {
      onSuccess();
      reset();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <Text style={styles.text}>Alert Type: </Text>
        <DropdownInput
          items={['Maintenance', 'Outage', 'Customer Fix', 'Other']}
          control={control}
          name="alertType"
          placeholder="Alert Type"
          backgroundColor={Colors.White}
          textColor={Colors.Black}
        />
      </View>
      <View style={styles.dropdownContainer}>
        <Text style={styles.text}>Alert Message: </Text>
        <TextInput
          control={control}
          name="alertMessage"
          placeholder="Alert message"
          backgroundColor={Colors.White}
          textColor={Colors.Black}
          style={styles.textInput}
        />
      </View>
      <ElevatedCard
        onPress={handleSubmit(onSubmit)}
        textStyle={styles.sendText}
        style={styles.sendContainer}>
        Send
      </ElevatedCard>
    </View>
  );
};

export default CreateAlert;

const styles = StyleSheet.create({
  sendText: {color: Colors.White, fontSize: 22, fontWeight: '700'},
  sendContainer: {alignSelf: 'center'},
  textInput: {minHeight: 120},
  text: {color: Colors.Black},
  container: {
    backgroundColor: Colors.Gray,
    borderRadius: 25,
    padding: 15,
    gap: 32,
  },
  dropdownContainer: {flexDirection: 'row', gap: 5, alignItems: 'center'},
});
