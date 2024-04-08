import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {io} from 'socket.io-client';
import {ioString} from '../API/io';

type SigninForm = {
  username: string;
  password: string;
};

type SigninProps = StackScreenProps<AuthStackParams, 'Signin'>;

const Signin = ({navigation}: SigninProps) => {
  const {
    setAccessToken,
    setExpiresAtToken,
    setType,
    setSocket,
  } = useUser(state => state);

  const {control, handleSubmit} = useForm<SigninForm>({
    defaultValues: {password: '', username: ''},
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userType = await AsyncStorage.getItem('userType');
        if (token && userType) {
          setLoading(true);
          const response = await client.get('/auth', {
            headers: {
              authorization: `Bearer ${token}`,
              type: userType,
            },
          });
          if (response.data.success) {
            console.log(userType);
            setType(userType);
            setAccessToken(token);
          } else {
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
        return;
      }
    };
    fetchData();
  }, []);

  const establishWebSocketConnection = () => {
    const newSocket = io(ioString);
    setSocket(newSocket);
  };

  async function onSubmit({password, username}: SigninForm) {
    if(!username || !password){
      Alert.alert('Password and usernames are required fields');
      return;
    }
    // HERE API CALLS
    try {
      setLoading(true);
      const responce = await client.post('/signin', {
        userName: username,
        password: password,
      });

      // SUCCESS HERE OR WITH REACT QUERY OR RTK OR LI BADDIK
      if (await responce.data.userId) {
        establishWebSocketConnection();
        await AsyncStorage.setItem('token', responce.data.token);
        await AsyncStorage.setItem('userType', responce.data.userType);
        const userType = responce.data.userType;
        setType(responce.data.userType || userType);
        setAccessToken(responce.data.token);
        setExpiresAtToken(dayjs(new Date()).unix());
      } else{
        Alert.alert(responce?.data.error_message);
        setLoading(false)
      }
    } catch (error: any) {
      setLoading(false)
      console.log(error.data.error_message);
      Alert.alert('Invalid username or password! Please try again');
      return;
    }
  }

  return (
    <ScrollView style={styles.screen}>
      <Image source={{uri: ImageStrings.AuthLogo, height: 300, width: 300}} />
      <View>
        {loading && <ActivityIndicator size="large" color={Colors.Blue} />}
      </View>
      <View style={styles.authFormContainer}>
        <Text style={styles.zappText}>Zapp</Text>
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
        <ElevatedCard
          onPress={handleSubmit(onSubmit)}
          innerContainerStyle={styles.elevatedCardInnerContainer}
          textStyle={styles.elevatedCardTextStyle}
          style={styles.elevatedCardStyle}>
          Sign In
        </ElevatedCard>
        <View style={styles.orContainer}>
          <View style={styles.orSeperator} />
          <Text style={styles.orText}>Or</Text>
          <View style={styles.orSeperator} />
        </View>
        <Text style={styles.dontHaveAnAccountText}>Don't have an account?</Text>
        <ElevatedCard
          onPress={() => navigation.navigate('Signup')}
          innerContainerStyle={styles.elevatedCardInnerContainer}
          textStyle={styles.elevatedCardTextStyle}
          style={styles.elevatedCardStyle}>
          Sign Up
        </ElevatedCard>
      </View>
      <Image
        style={styles.zappLogoContainer}
        source={{uri: ImageStrings.ZappLogo, height: 100, width: 100}}
      />
    </ScrollView>
  );
};

export default Signin;

const styles = StyleSheet.create({
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
