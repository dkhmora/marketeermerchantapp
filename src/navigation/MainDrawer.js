import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import {StoreItemsScreen} from '../screens/StoreItemsScreen';
import StoreDetailsScreen from '../screens/StoreDetailsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import {signOut} from '../../firebase/auth';
import {Icon, View, Text, Item, Label, Button} from 'native-base';

export default function MainDrawer({route, navigation}) {
  const {merchantId} = route.params;
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator
      initialRouteName="Store Details"
      drawerStyle={{backgroundColor: '#eee', width: 240}}
      drawerContent={(props) => {
        return (
          <DrawerContentScrollView
            {...props}
            contentContainerStyle={{
              flex: 1,
              flexDirection: 'column',
            }}>
            <DrawerItemList {...props} />
            <Button
              style={{
                borderRadius: 24,
                marginHorizontal: 12,
              }}>
              <Text>Sign Out</Text>
              <Icon name="log-out" />
            </Button>
          </DrawerContentScrollView>
        );
      }}>
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
