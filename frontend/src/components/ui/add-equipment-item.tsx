import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useForm} from 'react-hook-form';
import {EquipmentForm} from './equipment-editable-item';
import Card from './card';
import TextInput from './text-input';
import {Colors} from '../../utils/colors';
import ElevatedCard from './elevated-card';
import DropdownInput from './dropdown-input';

type AddEquipmentItemProps = {
  onSuccess?: () => void;
};

const AddEquipmentItem = ({onSuccess}: AddEquipmentItemProps) => {
  const {control, handleSubmit} = useForm<EquipmentForm>({
    defaultValues: {description: '', name: '', price: '', status: 'Active'},
  });

  function onSubmit(data: EquipmentForm) {
    // HERE
    console.log(data);
    // SUCCESS IF U DONT USE REACT QUERY/RTK
    if (onSuccess) {
      onSuccess();
    }
  }

  return (
    <Card style={styles.padding15}>
      <View style={styles.container}>
        <View style={styles.textInputContainer}>
          <Text style={styles.text}>Name:</Text>
          <TextInput
            control={control}
            name="name"
            placeholder="Name"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
          />
        </View>
        <View style={styles.textInputContainer}>
          <Text style={styles.text}>Status:</Text>
          <DropdownInput
            control={control}
            name="status"
            placeholder="Status"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
            items={['Active', 'Inactive']}
          />
        </View>
        <View style={styles.textInputContainer}>
          <Text style={styles.text}>Price:</Text>
          <TextInput
            control={control}
            name="price"
            placeholder="Price"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.textInputContainer}>
          <TextInput
            control={control}
            name="description"
            placeholder="Description"
            textColor={Colors.Black}
            backgroundColor={Colors.White}
            multiline
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

export default AddEquipmentItem;

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
