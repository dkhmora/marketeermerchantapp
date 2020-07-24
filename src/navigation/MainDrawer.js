import React, {Component} from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import StoreItemsScreen from '../screens/StoreItemsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import DeliveryAreaScreen from '../screens/DeliveryAreaScreen';
import {Button, Icon} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import {colors} from '../../assets/colors';
import {View, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ReviewsScreen from '../screens/ReviewsScreen';

@inject('authStore')
@inject('detailsStore')
@observer
class MainDrawer extends Component {
  constructor(props) {
    super(props);
  }

  handleSignOut() {
    this.props.authStore.appReady = false;

    this.props.authStore.signOut().then(() => {
      this.props.authStore.appReady = true;
    });
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
                justifyContent: 'space-between',
              }}>
              <View style={{justifyContent: 'flex-start'}}>
                <DrawerItemList
                  {...props}
                  labelStyle={{fontFamily: 'ProductSans-Light'}}
                />
              </View>

              {Platform.OS === 'ios' ? (
                <SafeAreaView>
                  <Button
                    title="Sign Out"
                    icon={<Icon name="log-out" color={colors.icons} />}
                    iconRight
                    onPress={() => this.handleSignOut()}
                    titleStyle={{color: colors.icons, paddingRight: 5}}
                    buttonStyle={{backgroundColor: colors.primary}}
                    containerStyle={{
                      borderRadius: 24,
                      marginHorizontal: 12,
                      marginVertical: 10,
                    }}
                  />
                </SafeAreaView>
              ) : (
                <Button
                  title="Sign Out"
                  icon={<Icon name="log-out" color={colors.icons} />}
                  iconRight
                  onPress={() => this.handleSignOut()}
                  titleStyle={{color: colors.icons, paddingRight: 5}}
                  buttonStyle={{backgroundColor: colors.primary}}
                  containerStyle={{
                    borderRadius: 24,
                    marginHorizontal: 12,
                    marginVertical: 10,
                  }}
                />
              )}
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
          name="Reviews"
          component={ReviewsScreen}
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
