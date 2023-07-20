import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {LoginScreen, SignupScreen} from '@/screen/auth';
import React from 'react';
import {MusicPlayer} from '@/screen/player/MusicPlayer';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  MusicPlayer: {
    db_idx: string;
  };
};

export type AuthStackProps = NativeStackScreenProps<
  AuthStackParamList,
  'Login',
  'Signup'
>;

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="MusicPlayer"
      component={MusicPlayer}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);
