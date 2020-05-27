import React from 'react';
import {Container} from 'native-base';
import {createStackNavigator} from '@react-navigation/stack';
import BaseHeader from '../components/BaseHeader';
import BaseTab from '../navigation/BaseTab';
import OrderDetailsScreen from './OrderDetailsScreen';

const StackOrder = createStackNavigator();

export const OrdersScreen = ({navigation}) => {
  const categories = [
    {
      name: 'Pending',
    },
    {
      name: 'Accepted',
    },
    {
      name: 'Shipped',
    },
    {
      name: 'Completed',
    },
  ];

  const collection = 'orders';
  const leftTextKey = 'orderId';
  const middleTextKey = 'userId';

  return (
    <Container>
      <BaseHeader title="Orders" navigation={navigation} />

      <StackOrder.Navigator initialRouteName="Order Tab" headerMode="none">
        <StackOrder.Screen
          name="Order Tab"
          component={BaseTab}
          initialParams={{categories, collection, leftTextKey, middleTextKey}}
        />
        <StackOrder.Screen
          name="Order Details"
          component={OrderDetailsScreen}
        />
      </StackOrder.Navigator>
    </Container>
  );
};
