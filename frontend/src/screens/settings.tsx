import {Alert, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../utils/colors';
import ScreenHeader from '../components/ui/screen-header';
import TextInput from '../components/ui/text-input';
import {useForm} from 'react-hook-form';
import ElevatedCard from '../components/ui/elevated-card';
import {useUser} from '../storage/use-user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../API/client';

type SettingsForm = {
  username: string;
  password: string;
};

const Settings = () => {
  const {type, signOut, accessToken, setAccessToken} = useUser(state => state);

  const {control, handleSubmit} = useForm<SettingsForm>({
    defaultValues: {password: '', username: ''},
  });

  async function onSubmit(data: SettingsForm) {
    Alert.alert(
      'Are you sure?',
      'Press OK to confirm or Cancel to abort',
      [
        {
          text: 'OK',
          onPress: async () => {
            try {
              const response = await client.put(`${type}/profile`, data, {
                headers: {
                  authorization: `Bearer ${accessToken}`,
                },
              });
              if (response.status === 207) {
                Alert.alert('Failed', response.data.error_message);
                return;
              }

              if (response.data.token) {
                setAccessToken(response.data.token);
                await AsyncStorage.removeItem('token');
                await AsyncStorage.setItem('token', response.data.token);
                Alert.alert(response.data.message);
                return;
              }
            } catch (error) {
              console.log(error);
              return;
            }
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  }

  async function deleteAccount() {
    try {
      const response = client.delete(`/${type}/profile`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if ((await response).data.success) {
        signingOut();
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async function signingOut() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userType');
      signOut();
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteAllUsers() {
    try {
      const responce = await client.delete(`/${type}/users`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (responce && responce.data.success) {
        Alert.alert('Users deleted');
      } else {
        Alert.alert('Failed deleting users');
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader>Profile</ScreenHeader>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Change Username</Text>
        <TextInput
          control={control}
          name="username"
          placeholder="Username"
          textColor={Colors.Black}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Change Password</Text>
        <TextInput
          control={control}
          name="password"
          placeholder="Password"
          textColor={Colors.Black}
        />
      </View>
      <View style={styles.actionButtons}>
        <ElevatedCard
          onPress={() => signingOut()}
          textStyle={styles.elevatedButtonText}>
          Sign Out
        </ElevatedCard>
        <ElevatedCard
          textStyle={styles.elevatedButtonText}
          onPress={handleSubmit(onSubmit)}>
          Save
        </ElevatedCard>
      </View>
      {type === 'owner' && (
        <>
          <ScreenHeader>Danger Zone</ScreenHeader>
          <ElevatedCard
            style={styles.dangerZoneStyle}
            innerContainerStyle={styles.dangerZoneElevatedButtonContainer}
            textStyle={styles.elevatedButtonText}
            onPress={() => {
              deleteAccount();
            }}>
            Delete Account
          </ElevatedCard>
          <ElevatedCard
            style={styles.dangerZoneStyle}
            innerContainerStyle={styles.dangerZoneElevatedButtonContainer}
            textStyle={styles.elevatedButtonText}
            onPress={() => {
              deleteAllUsers;
            }}>
            Delete all users
          </ElevatedCard>
        </>
      )}
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  dangerZoneStyle: {alignSelf: 'center'},
  dangerZoneElevatedButtonContainer: {
    backgroundColor: Colors.Red,
  },
  elevatedButtonText: {color: Colors.White, fontSize: 24, fontWeight: '700'},
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 25,
  },
  label: {
    fontSize: 16,
    lineHeight: 16 * 1.2,
    color: Colors.Black,
    fontWeight: '700',
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.Background,
    paddingHorizontal: 15,
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
});
