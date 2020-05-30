import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import {StoreItemsScreen} from '../screens/StoreItemsScreen';
import {StoreDetailsScreen} from '../screens/StoreDetailsScreen';
import {OrdersScreen} from '../screens/OrdersScreen';
import {signOut} from '../../firebase/auth';
import {Icon, View, Text} from 'native-base';

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
            <DrawerItem
              style={{backgroundColor: '#455A64'}}
              label={(props) => (
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <Icon
                    name="log-out"
                    type="Ionicons"
                    style={{color: '#fff', marginRight: 12, marginLeft: 6}}
                  />
                  <Text style={{color: '#fff', textAlignVertical: 'center'}}>
                    Sign out
                  </Text>
                </View>
              )}
              onPress={() => signOut({navigation})}
            />
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
