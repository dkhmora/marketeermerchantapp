import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OrdersTab from './OrdersTab';
import OrderDetailsScreen from './OrderDetailsScreen';

const StackOrders = createStackNavigator();
class OrdersScreen extends Component {
  render() {
    return (
      <StackOrders.Navigator headerMode="none">
        <StackOrders.Screen name="Orders Tab" component={OrdersTab} />
        <StackOrders.Screen
          name="Order Details"
          component={OrderDetailsScreen}
        />
      </StackOrders.Navigator>
    );
  }
}

export default OrdersScreen;
