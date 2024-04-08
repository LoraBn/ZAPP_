import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import Card from './card';
import WhiteCard from './white-card';
import DatePicker from 'react-native-date-picker';
import {Colors} from '../../utils/colors';
import {ControllerRenderProps} from 'react-hook-form';
import {GeneratorForm} from '../../screens/generator-on-off';
import {ImageStrings} from '../../assets/image-strings';

type GeneratorTimingItemProps = {
  item: {
    id: string;
    time_to_turn_on: string;
    time_to_turn_off: string;
  };
  index: number;
  field: ControllerRenderProps<GeneratorForm, 'schedule'>;
  disabled?: boolean;
  onDeletePress?: () => void;
  isEditing?: boolean;
};

const GeneratorTimingItem = ({
  item,
  field,
  disabled,
  onDeletePress,
  isEditing,
}: GeneratorTimingItemProps) => {
  const [timingOnOpen, setTimingOnOpen] = useState(false);
  const [timingOffOpen, setTimingOffOpen] = useState(false);

  return (
    <>
      <Card style={styles.onOffContainer}>
        <View style={styles.timeToTurnContainer}>
          <Text style={styles.text}>Time to turn on:</Text>
          <Card
            disabled={disabled}
            selected
            style={styles.timeToTurnOffAndOnTimeCard}
            onPress={() => setTimingOnOpen(true)}>
            <WhiteCard pointerEvents="none">
              <Text style={styles.onOffText}>
                {new Date(item.time_to_turn_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </WhiteCard>
          </Card>
        </View>
        <View style={styles.timeToTurnContainer}>
          <Text style={styles.text}>Time to turn off:</Text>
          <Card
            disabled={disabled}
            selected
            style={styles.timeToTurnOffAndOnTimeCard}
            onPress={() => setTimingOffOpen(true)}>
            <WhiteCard pointerEvents="none">
              <Text style={styles.onOffText}>
                {new Date(item.time_to_turn_off).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </WhiteCard>
          </Card>
        </View>
        {isEditing && (
          <Pressable
            onPress={() => {
              if (onDeletePress) {
                onDeletePress();
              }
            }}>
            <Image
              source={{uri: ImageStrings.TrashIcon, height: 21, width: 21}}
              style={styles.trashImage}
            />
          </Pressable>
        )}
      </Card>
      <DatePicker
        modal
        mode="time"
        date={new Date(item.time_to_turn_on)}
        open={timingOnOpen}
        onCancel={() => setTimingOnOpen(false)}
        onConfirm={date => {
          const indx = field.value.findIndex(fi => fi.id === item.id);
          let updatedField = field.value;

          updatedField[indx] = {...item, time_to_turn_on: date};

          setTimingOnOpen(false);

          field.onChange([...updatedField]);
        }}
      />
      <DatePicker
        modal
        mode="time"
        date={new Date(item.time_to_turn_off)}
        open={timingOffOpen}
        onCancel={() => setTimingOffOpen(false)}
        onConfirm={date => {
          const indx = field.value.findIndex(fi => fi.id === item.id);
          let updatedField = field.value;

          updatedField[indx] = {...item, time_to_turn_off: date};

          setTimingOffOpen(false);

          field.onChange([...updatedField]);
        }}
      />
    </>
  );
};

export default GeneratorTimingItem;

const styles = StyleSheet.create({
  trashImage: {
    alignSelf: 'flex-end',
    margin: 4,
  },
  onOffText: {color: Colors.Black, fontSize: 18, fontWeight: '700'},
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
