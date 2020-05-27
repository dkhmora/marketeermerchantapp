import React from 'react';
import {Root, StyleProvider} from 'native-base';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import BaseDrawer from './navigation/BaseDrawer';
import AuthStack from './navigation/AuthStack';

const StackMain = createStackNavigator();

const NavigationTheme = {
  dark: false,
  colors: {
    primary: '#5B0EB5',
    background: '#fff',
    card: '#fff',
    text: '#1A191B',
    border: '#eee',
  },
};

export default () => (
  <Root>
    <NavigationContainer theme={NavigationTheme}>
      <StackMain.Navigator initialRouteName="Auth" headerMode="none">
        <StackMain.Screen name="Auth" component={AuthStack} />
        <StackMain.Screen name="Home" component={BaseDrawer} />
      </StackMain.Navigator>
    </NavigationContainer>
  </Root>
);
