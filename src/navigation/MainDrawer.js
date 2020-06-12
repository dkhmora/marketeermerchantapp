import React, {Component} from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import StoreItemsScreen from '../screens/StoreItemsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import DeliveryAreaScreen from '../screens/DeliveryAreaScreen';
import {Icon, View, Text, Item, Label, Button} from 'native-base';
import {inject, observer} from 'mobx-react';

@inject('authStore')
@observer
class MainDrawer extends Component {
  constructor(props) {
    super(props);
  }

  handleSignOut() {
    this.props.authStore.signOut();
    this.props.navigation.navigate('Auth');
  }

  render() {
    const {merchantId} = this.props.route.params;
    const Drawer = createDrawerNavigator();

    return (
      <Drawer.Navigator
        initialRouteName="Dashboard"
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
                onPress={() => this.handleSignOut()}
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
          name="Dashboard"
          component={DashboardScreen}
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

        <Drawer.Screen
          name="Delivery Area"
          component={DeliveryAreaScreen}
          initialParams={{merchantId}}
        />
      </Drawer.Navigator>
    );
  }
}

export default MainDrawer;
