import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {StoreItemsScreen} from '../screens/StoreItemsScreen';
import {StoreDetailsScreen} from '../screens/StoreDetailsScreen';
import {OrdersScreen} from '../screens/OrdersScreen';

export default function MainDrawer({route}) {
  const {merchantId} = route.params;
  console.log(merchantId);
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator initialRouteName="Store Details">
      <Drawer.Screen
        name="Store Details"
        component={StoreDetailsScreen}
        initialParams={{merchantId}}
      />
      <Drawer.Screen
        name="Store Items"
        component={StoreItemsScreen}
        initialParams={{merchantId}}
      />
      <Drawer.Screen
        name="Orders"
        component={OrdersScreen}
        initialParams={{merchantId}}
      />
    </Drawer.Navigator>
  );
}
