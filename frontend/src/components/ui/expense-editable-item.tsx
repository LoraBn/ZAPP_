import {Alert, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../../utils/colors';
import {ImageStrings} from '../../assets/image-strings';
import {useForm} from 'react-hook-form';
import TextInput from './text-input';
import {Expense, NAMES} from '../../screens/bills-nav-page';
import {formatDate} from '../../utils/date-utils';
import DropdownInput from './dropdown-input';
import client from '../../API/client';
import {useUser} from '../../storage/use-user';

type ExpenseEditableItemProps = {
  item: Expense;
  index: number;
};

export type EquipmentForm = {
  expense_id: number;
  amount: number;
  username: string;
  description: string;
};

const ExpenseEditableItem = ({item}: ExpenseEditableItemProps) => {
  const {control, handleSubmit} = useForm<EquipmentForm>({
    defaultValues: {
      username: "",
    },
  });

  const {setSocket, socket, accessToken, type,employees} = useUser(state => state);

  const [isEditing, setIsEditing] = useState(false);

  async function deleteItem(item:any){
    try {
      const responce = await client.delete(`/${type}/expenses/${encodeURIComponent(item.expense_id)}`,{
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      })
      console.log(responce.data.message);
      Alert.alert(responce.data.message)
    } catch (error) {
      console.log(error)
    }
  }

  async function onSubmit(data: EquipmentForm) {
    // Convert amount to integer
    data.amount = parseInt(data.amount);
    
    // Validate if the entered amount is a valid integer
    if (isNaN(data.amount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid integer amount.');
      return;
    }
  
    // Continue with your existing code
    console.log(data);
    try {
      const responce = await client.put(
        `/${type}/expenses/${encodeURIComponent(item.expense_id)}`,
        data,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log(responce.data.message);
    } catch (error) {
      console.log(error);
    }
    //SUCCESS
    setIsEditing(false);
  }
  

  return (
    <View style={styles.container}>
      {!isEditing && (
        <Text style={[styles.text, styles.semiBold]}>
          {formatDate(item.expense_date)}
        </Text>
      )}
      <View style={styles.topItemsContainer}>
        {isEditing ? (
          <DropdownInput
            control={control}
            name="username"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
            placeholder="Username"
            style={styles.textInputStyles}
            items={employees}
          />
        ) : (
          <Text style={[styles.text, styles.semiBold]}>{item.username}</Text>
        )}
        {isEditing ? (
          <TextInput
            control={control}
            name="amount"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
            placeholder="Price"
            style={styles.textInputStyles}
            keyboardType="number-pad"
          />
        ) : (
          <Text style={styles.text}>{`$ ${item.amount}`}</Text>
        )}
      </View>
      {isEditing ? (
        <TextInput
          multiline
          control={control}
          name="description"
          backgroundColor={Colors.White}
          placeholder="Description"
          textColor={Colors.Black}
        />
      ) : (
        <Text style={styles.text}>{item.description}</Text>
      )}
      <View style={styles.bottomItemsContainer}>
        {!isEditing ? (
          <Pressable onPress={() => setIsEditing(true)} style={styles.top}>
            <Image
              source={{uri: ImageStrings.EditIcon, height: 44, width: 21}}
            />
          </Pressable>
        ) : (
          <Pressable onPress={handleSubmit(onSubmit)} style={styles.smallTop}>
            <Image
              source={{uri: ImageStrings.SaveIcon, height: 25, width: 25}}
            />
          </Pressable>
        )}

        <Pressable
          onPress={() =>
            Alert.alert(
              'Are you sure you want to delete?',
              'This action is irreversible.',
              [
                {text: 'Cancel'},
                {
                  text: 'Confirm',
                  onPress: () => {
                    // HERE
                    deleteItem(item)
                  },
                },
              ],
            )
          }>
          <Image
            source={{uri: ImageStrings.TrashIcon, height: 21, width: 21}}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default ExpenseEditableItem;

const styles = StyleSheet.create({
  textInputStyles: {padding: 5, textAlign: 'center'},
  smallTop: {
    top: 3,
  },
  semiBold: {fontWeight: '700'},
  text: {color: Colors.Black},
  top: {top: 10},
  container: {
    gap: 5,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Black,
  },
  topItemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomItemsContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});
