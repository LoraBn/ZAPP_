import {Alert, Keyboard, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../utils/colors';
import ScreenHeader from '../components/ui/screen-header';
import TextInput from '../components/ui/text-input';
import {useForm} from 'react-hook-form';
import ElevatedCard from '../components/ui/elevated-card';
import {DocumentPickerResponse} from 'react-native-document-picker';
import {StackScreenProps} from '@react-navigation/stack';
import {HomeStackNavigatorParams} from '../navigation/home-stack-navigation';
import DropdownInput from '../components/ui/dropdown-input';

type AddAnnouncementsForm = {
  title: string;
  description: string;
  attachments: DocumentPickerResponse[];
  date: Date | null;
  target: 'All' | 'Customers' | 'Employees';
};

type AddAnnouncementsProps = StackScreenProps<
  HomeStackNavigatorParams,
  'AddAnnouncements'
>;

const AddAnnouncements = ({navigation}: AddAnnouncementsProps) => {
  const {control, handleSubmit} = useForm<AddAnnouncementsForm>({
    defaultValues: {
      description: '',
      title: '',
      target: 'All',
    },
  });

  function onSubmit({
    attachments,
    date,
    description,
    title,
  }: AddAnnouncementsForm) {
    // SUBMIT HERE

    console.log(attachments, date, description, title);

    Alert.alert('Confirm?', 'Do you confirm your info aw shi hek??', [
      {text: 'Cancel'},
      {text: 'Save', onPress: () => navigation.goBack()},
    ]);
  }

  return (
    <View style={styles.screen} onTouchStart={Keyboard.dismiss}>
      <ScreenHeader>New Announcement</ScreenHeader>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Title:</Text>
        <TextInput
          control={control}
          name="title"
          placeholder="Title"
          textColor={Colors.Black}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Target:</Text>
        <DropdownInput
          control={control}
          name="target"
          placeholder="Target"
          textColor={Colors.Black}
          items={['All', 'Customers', 'Employees']}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description:</Text>
        <TextInput
          control={control}
          name="description"
          placeholder="Description"
          textColor={Colors.Black}
          style={styles.w100}
          multiline
        />
      </View>

      <View style={styles.bottomButtonContainer}>
        <ElevatedCard
          textStyle={styles.bottomButtonsTextStyle}
          onPress={handleSubmit(onSubmit)}>
          Post
        </ElevatedCard>
      </View>
    </View>
  );
};

export default AddAnnouncements;

const styles = StyleSheet.create({
  textAlCenter: {textAlign: 'center'},
  bottomButtonsTextStyle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.White,
  },
  bottomButtonContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  addFromDeviceText: {color: Colors.Gray, fontWeight: '700'},
  descriptionContainer: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  w100: {width: '100%', minHeight: 200},
  screen: {
    flex: 1,
    backgroundColor: Colors.Background,
    paddingHorizontal: 15,
    gap: 20,
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
