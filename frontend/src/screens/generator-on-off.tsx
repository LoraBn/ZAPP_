import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../utils/colors';
import ScreenHeader from '../components/ui/screen-header';
import {useController, useForm} from 'react-hook-form';
import TextInput from '../components/ui/text-input';
import ElevatedCard from '../components/ui/elevated-card';
import uuid from 'react-native-uuid';
import ListSeperator from '../components/ui/list-seperator';
import GeneratorTimingItem from '../components/ui/generator-timing-item';
import DropdownInput from '../components/ui/dropdown-input';

export type GeneratorForm = {
  timings: {id: string; time_to_turn_on: Date; time_to_turn_off: Date}[];
  kw_price: string;
  equipment: string | null;
};

const GeneratorOnOff = () => {
  const {control, handleSubmit} = useForm<GeneratorForm>({
    defaultValues: {kw_price: '', timings: [], equipment: null},
  });

  const [isEditing, setIsEditing] = useState(false);

  const {field} = useController({control, name: 'timings', defaultValue: []});

  function onSubmit(data: GeneratorForm) {
    //HERE
    console.log(data);

    //AA
    setIsEditing(false);
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader>Generator</ScreenHeader>
      <FlatList
        contentContainerStyle={styles.contentContainer}
        // eslint-disable-next-line react/no-unstable-nested-components
        ListHeaderComponent={() => (
          <View style={styles.gap25}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kilowat price:</Text>
              <TextInput
                control={control}
                name="kw_price"
                placeholder="Kilowat Price"
                textColor={Colors.Black}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Equipment:</Text>
              <DropdownInput
                control={control}
                name="equipment"
                placeholder="Equipment"
                textColor={Colors.Black}
                items={['Motor 1', 'Motor 2', 'Motor 3']}
                disabled={!isEditing}
              />
            </View>
            <ScreenHeader>Timing on/off</ScreenHeader>
            {isEditing && (
              <ElevatedCard
                onPress={() =>
                  field.onChange([
                    ...field.value,
                    {
                      id: uuid.v4(),
                      time_to_turn_on: new Date(),
                      time_to_turn_off: new Date(),
                    },
                  ])
                }
                textStyle={styles.elevatedCardTextStyle}
                style={styles.elevatedCardStyle}>
                Add Timing
              </ElevatedCard>
            )}
            <View />
          </View>
        )}
        data={field.value}
        ItemSeparatorComponent={ListSeperator}
        renderItem={props => (
          <GeneratorTimingItem
            {...props}
            field={field}
            disabled={!isEditing}
            onDeletePress={() => {
              let newArray: {
                id: string;
                time_to_turn_on: Date;
                time_to_turn_off: Date;
              }[] = [];

              for (let i = 0; i < field.value.length; i++) {
                if (i !== props.index) {
                  newArray.push(props.item);
                }
              }

              field.onChange(newArray);
            }}
            isEditing={isEditing}
          />
        )}
      />
      <ElevatedCard
        onPress={() => {
          if (isEditing) {
            handleSubmit(onSubmit)();
          } else {
            setIsEditing(prevIsEditing => !prevIsEditing);
          }
        }}
        textStyle={styles.elevatedCardTextStyle}
        style={styles.elevatedCardStyle}>
        {isEditing ? 'Save' : 'Edit'}
      </ElevatedCard>
    </View>
  );
};

export default GeneratorOnOff;

const styles = StyleSheet.create({
  onOffText: {color: Colors.Black, fontSize: 24, fontWeight: '700'},
  onOffContainer: {gap: 10},
  timeToTurnOffAndOnTimeCard: {padding: 10, paddingHorizontal: 10},
  text: {color: Colors.Black, fontSize: 20, fontWeight: '700'},
  gap25: {gap: 25},
  timeToTurnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  elevatedCardStyle: {
    alignSelf: 'center',
  },
  elevatedCardTextStyle: {
    fontSize: 22,
    color: Colors.White,
    fontWeight: '700',
  },
  contentContainer: {paddingHorizontal: 15},
  screen: {
    flex: 1,
    backgroundColor: Colors.Background,
    gap: 25,
  },
  label: {
    fontSize: 16,
    lineHeight: 16 * 1.2,
    color: Colors.Black,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
});
