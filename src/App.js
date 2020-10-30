import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import MainDrawer from './navigation/MainDrawer';
import AuthLoader from './components/AuthLoader';
import LoginScreen from './screens/LoginScreen';
import {RootSiblingParent} from 'react-native-root-siblings';
import TopUpScreen from './screens/TopUpScreen';
import OrderDetailsScreen from './screens/OrderDetailsScreen';
import OrderChatScreen from './screens/OrderChatScreen';
import MerchantDashboardScreen from './screens/MerchantDashboardScreen';
import TopUpHistoryScreen from './screens/TopUpHistoryScreen';
import EditItemScreen from './screens/EditItemScreen';
import MrSpeedyBottomSheet from './components/MrSpeedyBottomSheet';

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
  <RootSiblingParent>
    <NavigationContainer theme={NavigationTheme}>
      <StackMain.Navigator initialRouteName="Loader" headerMode="none">
        <StackMain.Screen name="Loader" component={AuthLoader} />
        <StackMain.Screen name="Login" component={LoginScreen} />
        <StackMain.Screen name="Home" component={MainDrawer} />
        <StackMain.Screen
          name="Merchant Dashboard"
          component={MerchantDashboardScreen}
        />
        <StackMain.Screen
          name="Top Up History"
          component={TopUpHistoryScreen}
        />
        <StackMain.Screen name="Top Up" component={TopUpScreen} />
        <StackMain.Screen name="Order Details" component={OrderDetailsScreen} />
        <StackMain.Screen name="Order Chat" component={OrderChatScreen} />
        <StackMain.Screen name="Edit Item" component={EditItemScreen} />
      </StackMain.Navigator>
    </NavigationContainer>
  </RootSiblingParent>
);
