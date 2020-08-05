import React, {Component} from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import StoreItemsScreen from '../screens/StoreItemsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import DeliveryAreaScreen from '../screens/DeliveryAreaScreen';
import {Button, Icon} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import {colors} from '../../assets/colors';
import {View, Platform, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ReviewsScreen from '../screens/ReviewsScreen';
import AccountScreen from '../screens/AccountScreen';

@inject('authStore')
@inject('itemsStore')
@inject('ordersStore')
@inject('detailsStore')
@observer
class MainDrawer extends Component {
  constructor(props) {
    super(props);
  }

  openTermsAndConditions() {
    const {navigation} = this.props;

    const uri = 'https://marketeer.ph/components/pages/termsandconditions';

    navigation.navigate('Browser', {
      uri,
      title: 'Marketeer Terms and Conditions',
    });
  }

  openPrivacyPolicy() {
    const {navigation} = this.props;

    const uri = 'https://marketeer.ph/components/pages/privacypolicy';

    navigation.navigate('Browser', {
      uri,
      title: 'Marketeer Privacy Policy',
    });
  }

  handleSignOut() {
    this.props.authStore.appReady = false;

    this.props.authStore.signOut().then(() => {
      this.props.detailsStore.storeDetails = {};
      this.props.detailsStore.subscribedToNotifications = false;
      this.props.detailsStore.unsubscribeSetStoreDetails();
      this.props.detailsStore.unsubscribeSetStoreDetails = null;
      this.props.ordersStore.orders = [];
      this.props.ordersStore.maxOrderUpdatedAt = 0;
      this.props.itemsStore.categoryItems = new Map();
      this.props.itemsStore.storeItems = [];
      this.props.itemsStore.maxItemsUpdatedAt = 0;

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
                  labelStyle={{
                    fontFamily: 'ProductSans-Light',
                    padding: 10,
                  }}
                  itemStyle={{
                    marginHorizontal: 0,
                    marginVertical: 0,
                    borderRadius: 0,
                  }}
                />

                <DrawerItem
                  onPress={() => this.openTermsAndConditions()}
                  label="Terms and Conditions"
                  labelStyle={{
                    fontFamily: 'ProductSans-Light',
                    padding: 10,
                  }}
                  style={{
                    marginHorizontal: 0,
                    marginVertical: 0,
                    borderRadius: 0,
                  }}
                />

                <DrawerItem
                  onPress={() => this.openPrivacyPolicy()}
                  label="Privacy Policy"
                  labelStyle={{
                    fontFamily: 'ProductSans-Light',
                    padding: 10,
                  }}
                  style={{
                    marginHorizontal: 0,
                    marginVertical: 0,
                    borderRadius: 0,
                  }}
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

        <Drawer.Screen
          name="Account Settings"
          component={AccountScreen}
          initialParams={{merchantId}}
        />
      </Drawer.Navigator>
    );
  }
}

export default MainDrawer;
