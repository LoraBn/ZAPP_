import {Alert, Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../utils/colors';
import {ImageStrings} from '../assets/image-strings';
import {useForm} from 'react-hook-form';
import AuthTextInput from '../components/ui/auth-text-input';
import ElevatedCard from '../components/ui/elevated-card';
import {StackScreenProps} from '@react-navigation/stack';
import {AuthStackParams} from '../navigation/auth-stack-navigation';
import {useUser} from '../storage/use-user';
import dayjs from 'dayjs';
import client from '../API/client';

type SignUpForm = {
  name: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
};

type SignUpProps = StackScreenProps<AuthStackParams, 'Signup'>;

const SignUp = ({navigation}: SignUpProps) => {
  const {setAccessToken, setExpiresAtToken, setRefreshToken, setType} = useUser(
    state => state,
  );

  const {control, handleSubmit} = useForm<SignUpForm>({
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
      if (password !== confirmPassword) {
        Alert.alert('Passwords must match');
        return;
      }
      const response = await client.post('/owner/signup', {
        name,
        lastName,
        userName: username,
        password,
      });

      if (response.data.userId) {
        setAccessToken(response.data.token);
        setRefreshToken('MockTokenRefresh');
        setExpiresAtToken(dayjs().unix()); // No need to pass new Date() to dayjs() as it defaults to current date and time
        setType('owner');
        // Navigate to some success screen or perform other actions upon successful signup
      }
    } catch (error) {
      console.log(error);
      Alert.alert('An error occurred'); // Handle error gracefully
    }
  };
  return (
    <ScrollView style={styles.screen}>
      <Image source={{uri: ImageStrings.AuthLogo, height: 300, width: 300}} />
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
          Note: You have to be an owner to sign up.
        </Text>
        <ElevatedCard
          onPress={handleSubmit(onSubmit)}
          innerContainerStyle={styles.elevatedCardInnerContainer}
          textStyle={styles.elevatedCardTextStyle}
          style={styles.elevatedCardStyle}>
          Sign Up
        </ElevatedCard>
        <View style={styles.orContainer}>
          <View style={styles.orSeperator} />
          <Text style={styles.orText}>Or</Text>
          <View style={styles.orSeperator} />
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
        source={{uri: ImageStrings.ZappLogo, height: 100, width: 100}}
      />
    </ScrollView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  noteText: {color: Colors.Black, fontWeight: '600', textAlign: 'center'},
  dontHaveAnAccountText: {
    color: Colors.Black,
    textAlign: 'center',
    fontSize: 12,
  },
  orSeperator: {
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
  orText: {marginHorizontal: 15},
  elevatedCardInnerContainer: {
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: Colors.Blue,
  },
  elevatedCardTextStyle: {color: Colors.Black, fontSize: 22, fontWeight: '700'},
  elevatedCardStyle: {alignSelf: 'center', backgroundColor: Colors.Blue},
  screen: {
    backgroundColor: Colors.Background,
    flex: 1,
    paddingHorizontal: 25,
  },
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
  authFormContainerStyle: {
    gap: 25,
  },
  zappLogoContainer: {
    alignSelf: 'flex-end',
  },
});
