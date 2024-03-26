import {Alert, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {Equipment} from '../../screens/owner-home-page';
import {Colors} from '../../utils/colors';
import {ImageStrings} from '../../assets/image-strings';
import {useForm} from 'react-hook-form';
import TextInput from './text-input';
import DropdownInput from './dropdown-input';
import client from '../../API/client';
import { useUser } from '../../storage/use-user';

type EquipmentEditableItemProps = {
  item: Equipment;
  index: number;
};

export type EquipmentForm = {
  name: string;
  price: string;
  status: "ACTIVE" | "INACTIVE";
  description: string;
};

const EquipmentEditableItem = ({item}: EquipmentEditableItemProps) => {
  const {control, handleSubmit} = useForm<EquipmentForm>({
    defaultValues: {
      description: item.description ?? '',
      name: item.name ?? '',
      price: item.price ? item.price.toString() : '',
      status: item.status ?? "ACTIVE",
    },
  });
  const {setSocket, socket, accessToken,type} = useUser(
    state => state,
  );

  const [isEditing, setIsEditing] = useState(false);

  async function onSubmit(data: EquipmentForm) {
    //HERE
    //SUCCESS
    try {
      const responce = await client.put(`/${type}/equipment/${encodeURIComponent(item.name)}`,data, {
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        
      });
      console.log(responce.data.message) 
      
    } catch (error) {
      console.log(error)
    }
    setIsEditing(false);
  }

  async function deleteItem(name:string){
    try {
      const responce = await client.delete(`/${type}/equipment/${encodeURIComponent(name)}`,{
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
        {isEditing ? (
          <TextInput
            control={control}
            name="name"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
            placeholder="Name"
            style={styles.textInputStyles}
          />
        ) : (
          <Text style={[styles.text, styles.semiBold]}>{item.name}</Text>
        )}
        {isEditing ? (
          <TextInput
            control={control}
            name="price"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
            placeholder="Price"
            style={styles.textInputStyles}
            keyboardType="number-pad"
          />
        ) : (
          <Text style={styles.text}>{item.price}</Text>
        )}
        {isEditing ? (
          <DropdownInput
            control={control}
            name="status"
            items={["ACTIVE", "INACTIVE"]}
            backgroundColor={Colors.White}
            textColor={Colors.Black}
            placeholder="Status"
            style={styles.textInputStyles}
            textSize={14}
          />
        ) : (
          <Text style={styles.text}>{item.status}</Text>
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
                    deleteItem(item.name);
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

export default EquipmentEditableItem;

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
