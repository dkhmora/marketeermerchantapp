import React from 'react';
import {Root} from 'native-base';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import MainDrawer from './navigation/MainDrawer';
import AuthLoader from './components/AuthLoader';
import LoginScreen from './screens/LoginScreen';

const StackMain = createStackNavigator();

const NavigationTheme = {
  dark: false,
  colors: {
    primary: '#E91E63',
    background: '#fff',
    card: '#fff',
    text: '#1A1918',
    border: '#fff',
  },
};

export default () => (
  <Root>
    <NavigationContainer theme={NavigationTheme}>
      <StackMain.Navigator initialRouteName="Loader" headerMode="none">
        <StackMain.Screen name="Loader" component={AuthLoader} />
        <StackMain.Screen name="Login" component={LoginScreen} />
        <StackMain.Screen name="Home" component={MainDrawer} />
      </StackMain.Navigator>
    </NavigationContainer>
  </Root>
);
