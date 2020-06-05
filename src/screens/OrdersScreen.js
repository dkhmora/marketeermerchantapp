import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OrdersTab from '../navigation/OrdersTab';
import OrderDetailsScreen from './OrderDetailsScreen';
import {NavigationContainer} from '@react-navigation/native';

const StackOrders = createStackNavigator();
class OrdersScreen extends Component {
  render() {
    return (
      <NavigationContainer independent={true}>
        <StackOrders.Navigator headerMode="none">
          <StackOrders.Screen name="Orders" component={OrdersTab} />
          <StackOrders.Screen
            name="Order Details"
            component={OrderDetailsScreen}
          />
        </StackOrders.Navigator>
      </NavigationContainer>
    );
  }
}

export default OrdersScreen;
