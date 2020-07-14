import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';

export default function AuthStack() {
  const StackAuth = createStackNavigator();
  return (
    <StackAuth.Navigator initialRouteName="Login" headerMode="none">
      <StackAuth.Screen name="Login" component={LoginScreen} />
    </StackAuth.Navigator>
  );
}
