import {Alert, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../../utils/colors';
import {ImageStrings} from '../../assets/image-strings';
import {useForm} from 'react-hook-form';
import TextInput from './text-input';
import {Plan} from '../../screens/bills-nav-page';
import {formatDate} from '../../utils/date-utils';
import { useUser } from '../../storage/use-user';
import client from '../../API/client';

type SubscriptionEditableItemProps = {
  item: Plan;
  index: number;
};

type EquipmentForm = {
  plan_price: string;
};

const SubscriptionEditableItem = ({item}: SubscriptionEditableItemProps) => {
  const {control, handleSubmit} = useForm<EquipmentForm>({
    defaultValues: {
      plan_price: item.plan_price ? item.plan_price.toString() : '',
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const {setSocket, socket, accessToken,type} = useUser(
    state => state,
  );

  async function onSubmit(data: EquipmentForm) {
    //HERE
    try {
      const responce = await client.put(`/${type}/plans/${encodeURIComponent(item.plan_id)}`,data, {
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        
      });
      console.log(responce.data)
    } catch (error:any) {
      console.log(error);
      Alert.alert(error.message)
    }
    
    //SUCCESS
    setIsEditing(false);
  }

  async function deleteItem(plan_id:number){
    try {
      const responce = await client.delete(`/${type}/plans/${encodeURIComponent(plan_id)}`,{
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

  return (
    <View style={styles.container}>
      <View style={styles.topItemsContainer}>
        <Text style={[styles.text, styles.semiBold]}>{item.plan_name}</Text>
        {isEditing ? (
          <TextInput
            control={control}
            name="plan_price"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
            placeholder="Price"
            style={styles.textInputStyles}
            keyboardType="number-pad"
          />
        ) : (
          <Text style={styles.text}>{`$ ${item.plan_price}`}</Text>
        )}
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
      </View>
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
                    deleteItem(item.plan_id)
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

export default SubscriptionEditableItem;

const styles = StyleSheet.create({
  dateText: {fontSize: 12, color: Colors.Black},
  textInputStyles: {padding: 5, textAlign: 'center'},
  smallTop: {
    top: 3,
  },
  semiBold: {fontWeight: '700'},
  text: {color: Colors.Black},
  top: {top: 10},
  container: {
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
