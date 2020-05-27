import React from 'react';
import {Container, List} from 'native-base';
import BaseListItem from '../components/BaseListItem';
import BaseHeader from '../components/BaseHeader';
import {createStackNavigator} from '@react-navigation/stack';
import OrderDetailsScreen from './OrderDetailsScreen';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {NavigationContainer} from '@react-navigation/native';

export const OrdersScreen = ({navigation}) => {
  const orderCategories = ['Pending', 'Accepted', 'Shipped', 'Finished'];

  const orders = [
    {
      orderId: 200000,
      isAccepted: false,
      isCanceled: false,
      isShipped: false,
      userId: 'qwlhelqhl2h3h1h3k1',
    },
    {
      orderId: 200001,
      isAccepted: false,
      isCanceled: false,
      isShipped: false,
      userId: 'qwlhelqhl2h3h1h3k2',
    },
    {
      orderId: 200002,
      isAccepted: false,
      isCanceled: false,
      isShipped: false,
      userId: 'qwlhelqhl2h3h1h3k3',
    },
  ];

  const orderItems = {
    item1: true,
    item2: true,
    item3: true,
  };

  const OrderListItems = ({navigation}) => {
    const listItem = orders.map((item, index) => {
      const orderId = item.orderId;
      const userId = item.userId;
      return (
        <BaseListItem
          onPress={() =>
            navigation.navigate('Order Details', {navigation, orderId})
          }
          keyText={`${orderId}`}
          valueText={userId}
          key={index}
        />
      );
    });
    return listItem;
  };
  const TabOrder = createMaterialTopTabNavigator();

  const OrderList = ({navigation}) => {
    return (
      <Container style={{flex: 1}}>
        <List>
          <OrderListItems />
        </List>
      </Container>
    );
  };

  const OrderTab = () => {
    const scroll = orderCategories.length > 2 ? true : false;
    return (
      <TabOrder.Navigator tabBarOptions={{scrollEnabled: scroll}}>
        {orderCategories.map((category) => {
          return (
            <TabOrder.Screen
              name={`${category}`}
              component={OrderList}
              initialParams={{category}}
            />
          );
        })}
      </TabOrder.Navigator>
    );
  };

  const StackOrder = createStackNavigator();

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

  return (
    <NavigationContainer theme={NavigationTheme} independent={true}>
      <BaseHeader title="Orders" optionsButton navigation={navigation} />

      <StackOrder.Navigator initialRouteName="Order Tab" headerMode="none">
        <StackOrder.Screen name="Order Tab" component={OrderTab} />
        <StackOrder.Screen
          name="Order Details"
          component={OrderDetailsScreen}
        />
      </StackOrder.Navigator>
    </NavigationContainer>
  );
};
