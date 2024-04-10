import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../utils/colors';
import { ImageStrings } from '../assets/image-strings';
import { useForm } from 'react-hook-form';
import AuthTextInput from '../components/ui/auth-text-input';
import ElevatedCard from '../components/ui/elevated-card';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParams } from '../navigation/auth-stack-navigation';
import { useUser } from '../storage/use-user';
import dayjs from 'dayjs';
import client from '../API/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SignUpForm = {
  name: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
};

type SignUpProps = StackScreenProps<AuthStackParams, 'Signup'>;

const SignUp = ({ navigation }: SignUpProps) => {
  const { setAccessToken, setExpiresAtToken, setType } = useUser(state => state);

  const [loading, setLoading] = useState<boolean>(false);

  const { control, handleSubmit } = useForm<SignUpForm>({
    defaultValues: {
      password: '',
      username: '',
      confirmPassword: '',
      lastName: '',
      name: '',
    },
  });

  const onSubmit = async ({
    password,
    username,
    confirmPassword,
    lastName,
    name,
  }: SignUpForm) => {
    try {
      if (password.length < 6) {
        Alert.alert('Passwords should be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Passwords must match');
        return;
      }

      setLoading(true);

      const reqBody = {
        name: name.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        password: password.trim(),
      };

      const response = await client.post('/owner/signup', reqBody);

      if (response.data.userId) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('userType', 'owner');
        setAccessToken(response.data.token);
        setExpiresAtToken(dayjs().unix());
        setType('owner');
      } else {
        setLoading(false)
        Alert.alert(response.data.error_message || 'Sign up failed');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <Image source={{ uri: ImageStrings.AuthLogo, height: 300, width: 300 }} />
      {loading && <ActivityIndicator size="large" color={Colors.Blue} />}
      <View style={styles.authFormContainer}>
        <Text style={styles.zappText}>Zapp</Text>
        <AuthTextInput
          control={control}
          name="name"
          defaultValue=""
          placeholder="Name"
        />
        <AuthTextInput
          control={control}
          name="lastName"
          defaultValue=""
          placeholder="Last Name"
        />
        <AuthTextInput
          control={control}
          name="username"
          defaultValue=""
          placeholder="Username"
        />
        <AuthTextInput
          control={control}
          name="password"
          defaultValue=""
          placeholder="Password"
          secureTextEntry
        />
        <AuthTextInput
          control={control}
          name="confirmPassword"
          defaultValue=""
          placeholder="Confirm Password"
          secureTextEntry
        />
        <Text style={styles.noteText}>
          Note: You will sign up as an owner.
        </Text>
        <ElevatedCard
          onPress={handleSubmit(onSubmit)}
          innerContainerStyle={styles.elevatedCardInnerContainer}
          textStyle={styles.elevatedCardTextStyle}
          style={styles.elevatedCardStyle}>
          Sign Up
        </ElevatedCard>
        <View style={styles.orContainer}>
          <View style={styles.orSeparator} />
          <Text style={styles.orText}>Or</Text>
          <View style={styles.orSeparator} />
        </View>
        <Text style={styles.dontHaveAnAccountText}>
          Already have an account?
        </Text>
        <ElevatedCard
          onPress={() => navigation.navigate('Signin')}
          innerContainerStyle={styles.elevatedCardInnerContainer}
          textStyle={styles.elevatedCardTextStyle}
          style={styles.elevatedCardStyle}>
          Sign In
        </ElevatedCard>
      </View>
      <Image
        style={styles.zappLogoContainer}
        source={{ uri: ImageStrings.ZappLogo, height: 100, width: 100 }}
      />
    </ScrollView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  noteText: { color: Colors.Black, fontWeight: '600', textAlign: 'center' },
  dontHaveAnAccountText: { color: Colors.Black, textAlign: 'center', fontSize: 12 },
  orSeparator: {
    width: 10,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Black,
    borderStyle: 'dashed',
  },
  orContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orText: { marginHorizontal: 15 },
  elevatedCardInnerContainer: {
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: Colors.Blue,
  },
  elevatedCardTextStyle: { color: Colors.Black, fontSize: 22, fontWeight: '700' },
  elevatedCardStyle: { alignSelf: 'center', backgroundColor: Colors.Blue },
  screen: { backgroundColor: Colors.Background, flex: 1, paddingHorizontal: 25 },
  zappText: {
    fontWeight: '700',
    color: Colors.Black,
    fontSize: 32,
    textAlign: 'center',
    lineHeight: 32 * 1.3,
  },
  authFormContainer: {
    backgroundColor: Colors.Gray,
    padding: 20,
    borderRadius: 25,
    width: '100%',
    flex: 1,
    gap: 25,
  },
  zappLogoContainer: { alignSelf: 'flex-end' },
});
