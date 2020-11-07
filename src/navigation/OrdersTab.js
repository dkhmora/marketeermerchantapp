import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
// Custom Components
import OrdersList from '../components/OrdersList';
import {inject, observer} from 'mobx-react';
import {colors} from '../../assets/colors';
import crashlytics from '@react-native-firebase/crashlytics';
import {View} from 'react-native';
import {color} from 'react-native-reanimated';

const TabOrders = createMaterialTopTabNavigator();

@inject('authStore')
@inject('ordersStore')
@inject('detailsStore')
@observer
class OrdersTab extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {storeId} = this.props.detailsStore.storeDetails;

    this.props.ordersStore.setOrders(storeId);

    crashlytics().log('OrdersTab');
  }

  componentWillUnmount() {
    this.props.ordersStore.unsubscribeSetOrders &&
      this.props.ordersStore.unsubscribeSetOrders();
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <TabOrders.Navigator
          lazy
          lazyPreloadDistance={1}
          tabBarOptions={{
            allowFontScaling: false,
            scrollEnabled: true,
            activeTintColor: colors.primary,
            inactiveTintColor: colors.text_secondary,
            tabStyle: {
              width: 'auto',
              paddingTop: 0,
            },
            labelStyle: {
              marginTop: 0,
              fontFamily: 'ProductSans-Regular',
            },
            indicatorStyle: {
              height: 1,
              backgroundColor: colors.primary,
            },
            style: {
              backgroundColor: colors.icons,
              height: 35,
              paddingTop: 0,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,
              elevation: 5,
            },
          }}
          headerMode="none"
          backBehavior="initialRoute">
          <TabOrders.Screen name="Pending" component={OrdersList} />
          <TabOrders.Screen name="Unpaid" component={OrdersList} />
          <TabOrders.Screen
            name="Paid"
            component={OrdersList}
            options={{
              tabBarLabel: 'Paid (To Ship)',
            }}
          />
          <TabOrders.Screen name="Shipped" component={OrdersList} />
          <TabOrders.Screen name="Completed" component={OrdersList} />
          <TabOrders.Screen name="Cancelled" component={OrdersList} />
        </TabOrders.Navigator>
      </View>
    );
  }
}

export default OrdersTab;
