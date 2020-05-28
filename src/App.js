import React from 'react';
import {Root} from 'native-base';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import MainDrawer from './navigation/MainDrawer';
import AuthStack from './navigation/AuthStack';
import Loader from './components/Loader';

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
      <StackMain.Navigator initialRouteName="Loader" headerMode="none">
        <StackMain.Screen name="Loader" component={Loader} />
        <StackMain.Screen name="Auth" component={AuthStack} />
        <StackMain.Screen name="Home" component={MainDrawer} />
      </StackMain.Navigator>
    </NavigationContainer>
  </Root>
);
