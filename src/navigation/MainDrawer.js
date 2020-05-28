import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {StoreItemsScreen} from '../screens/StoreItemsScreen';
import {StoreDetailsScreen} from '../screens/StoreDetailsScreen';
import {OrdersScreen} from '../screens/OrdersScreen';

export default function MainDrawer() {
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator initialRouteName="Store Details">
      <Drawer.Screen name="Store Details" component={StoreDetailsScreen} />
      <Drawer.Screen name="Store Items" component={StoreItemsScreen} />
      <Drawer.Screen name="Orders" component={OrdersScreen} />
    </Drawer.Navigator>
  );
}
