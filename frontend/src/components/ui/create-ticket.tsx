import {Alert, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import {useForm} from 'react-hook-form';
import ElevatedCard from './elevated-card';
import TextInput from './text-input';
import client from '../../API/client';
import {useUser} from '../../storage/use-user';

type CreateAlertForm = {
  ticketMessage: string;
};

type CreateAlertProps = {
  onSuccess?: () => void;
};

const CreateTicket = ({onSuccess}: CreateAlertProps) => {
  const {control, reset, handleSubmit} = useForm<CreateAlertForm>({
    defaultValues: {ticketMessage: ''},
  });

  const {type, accessToken} = useUser(state => state);

  async function onSubmit(data: CreateAlertForm) {
    // HERE
    console.log(data);
    try {
      const reqBody = {
        ticket_message: data.ticketMessage
      }
      console.log(`/${type}/ticket`)
      const responce = await client.post(`/${type}/ticket`, reqBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (responce.data){
        Alert.alert(responce.data.message)
      }
    } catch (error: any) {
      console.log(error);
    }

    if (onSuccess) {
      onSuccess();
      reset();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <Text style={styles.text}>Ticket Message: </Text>
        <TextInput
          control={control}
          name="ticketMessage"
          placeholder="Ticket message"
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

export default CreateTicket;

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
