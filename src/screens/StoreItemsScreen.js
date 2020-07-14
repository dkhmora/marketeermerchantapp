import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
// Custom Components
import StoreItemsTab from '../navigation/StoreItemsTab';
import AddItemScreen from './AddItemScreen';

const StackOrder = createStackNavigator();
class StoreItemsScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <StackOrder.Navigator initialRouteName="Store Items" headerMode="none">
        <StackOrder.Screen name="Store Items" component={StoreItemsTab} />
        <StackOrder.Screen name="Add Item" component={AddItemScreen} />
      </StackOrder.Navigator>
    );
  }
}

export default StoreItemsScreen;
