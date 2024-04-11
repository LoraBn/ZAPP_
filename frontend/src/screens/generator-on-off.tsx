import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../utils/colors';
import ScreenHeader from '../components/ui/screen-header';
import {useController, useForm} from 'react-hook-form';
import TextInput from '../components/ui/text-input';
import ElevatedCard from '../components/ui/elevated-card';
import uuid from 'react-native-uuid';
import ListSeperator from '../components/ui/list-seperator';
import GeneratorTimingItem from '../components/ui/generator-timing-item';
import {useUser} from '../storage/use-user';
import client from '../API/client';

export type GeneratorForm = {
  schedule_id: number;
  schedule: {id: string; time_to_turn_on: Date; time_to_turn_off: Date}[];
  kw_price: string;
};

const GeneratorOnOff = () => {
  const {control, handleSubmit, setValue, getValues} = useForm<GeneratorForm>({
    defaultValues: {kw_price: '', schedule: []},
  });

  const {accessToken, type} = useUser(state => state);

  useEffect(() => {
    fetchSchdule();
    fetchPrice();
  }, []);

  const editPrice = async (price: string) => {
    try {
      const responce = await client.put(
        `/${type}/price`,
        {kwh_price: price},
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (responce && responce.data) {
        setValue('kw_price', price);
      }

      return responce;
    } catch (error) {
      console.log('Error updating price:', error);
    }
  };

  const fetchPrice = async () => {
    try {
      const response = await client.get(`/${type}/price`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (response && response.data) {
        setValue('kw_price', `${response.data.price.kwh_price}`);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const fetchSchdule = async () => {
    try {
      const response = await client.get(`/${type}/electric-schedule`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.schedule.length > 0) {
        const firstSchedule = response.data.schedule[0];

        if (firstSchedule.schedule.length > 0) {
          const scheduleArray = firstSchedule.schedule;
          setValue('schedule', [...scheduleArray]);
        }
      }
      else{
        return
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const {field} = useController({control, name: 'schedule', defaultValue: []});

  async function onSubmit(data: GeneratorForm) {
    console.log(data);
    setIsEditing(false);

    const responce2 = await editPrice(data.kw_price);

    const responce = await client.put(`${type}/electric-schedule`, data, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (responce) {
      console.log(responce.data.message);
    }
  }
  const handleDelete = (index: number) => {
    const newArray = [...field.value];
    newArray.splice(index, 1);
    field.onChange(newArray);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader>Generator</ScreenHeader>
      <FlatList
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={() => (
          <View style={styles.gap25}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kilowat price:</Text>
              {isEditing ? (
                <TextInput
                  control={control}
                  name="kw_price"
                  placeholder="Kilowat Price"
                  textColor={Colors.Black}
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={styles.text}>
                  {getValues().kw_price || 'No Price'}
                </Text>
              )}
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
            onDeletePress={() => handleDelete(props.index)}
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
