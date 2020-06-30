import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Container, Toast} from 'native-base';
// Custom Components
import OrdersList from '../components/OrdersList';
import BaseHeader from '../components/BaseHeader';
import {inject, observer} from 'mobx-react';
import {colors} from '../../assets/colors';

const TabOrders = createMaterialTopTabNavigator();

@inject('authStore')
@observer
class OrdersTab extends Component {
  constructor(props) {
    super(props);

    this.props.authStore.checkNotificationSubscriptionStatus();
  }

  handleNotificationSubscription = () => {
    const status = this.props.authStore.subscribedToNotifications
      ? 'Unsubscribed'
      : 'Subscribed';

    (this.props.authStore.subscribedToNotifications
      ? this.props.authStore.unsubscribeToNotifications()
      : this.props.authStore.subscribeToNotifications()
    ).then(() => {
      Toast.show({
        text: `Successfully ${status} to Order Notifications!`,
        buttonText: 'Okay',
        type: 'success',
        duration: 3500,
        style: {margin: 20, borderRadius: 16},
      });
    });

    this.props.authStore.checkNotificationSubscriptionStatus();
  };

  render() {
    const {name} = this.props.route;
    const {navigation} = this.props;
    const optionsLabel = this.props.authStore.subscribedToNotifications
      ? 'Unsubscribe to Order Notifications'
      : 'Subscribe to Order Notifications';

    return (
      <Container>
        <BaseHeader
          title={name}
          options={[optionsLabel]}
          actions={[this.handleNotificationSubscription]}
          destructiveIndex={1}
          navigation={navigation}
        />
        <TabOrders.Navigator
          tabBarOptions={{
            scrollEnabled: true,
            style: {backgroundColor: colors.icons},
            activeTintColor: colors.primary,
            inactiveTintcolor: '#eee',
            indicatorStyle: {backgroundColor: colors.primary},
          }}
          headerMode="none">
          <TabOrders.Screen
            name="Pending"
            component={OrdersList}
            initialParams={{
              storeFunctionName: 'setPendingOrders',
              storeVarName: 'pendingOrders',
            }}
          />
          <TabOrders.Screen
            name="Unpaid"
            component={OrdersList}
            initialParams={{
              storeFunctionName: 'setUnpaidOrders',
              storeVarName: 'unpaidOrders',
            }}
          />
          <TabOrders.Screen
            name="Paid"
            component={OrdersList}
            initialParams={{
              storeFunctionName: 'setPaidOrders',
              storeVarName: 'paidOrders',
            }}
          />
          <TabOrders.Screen
            name="Shipped"
            component={OrdersList}
            initialParams={{
              storeFunctionName: 'setShippedOrders',
              storeVarName: 'shippedOrders',
            }}
          />
          <TabOrders.Screen
            name="Completed"
            component={OrdersList}
            initialParams={{
              storeFunctionName: 'setCompletedOrders',
              storeVarName: 'completedOrders',
            }}
          />
          <TabOrders.Screen
            name="Cancelled"
            component={OrdersList}
            initialParams={{
              storeFunctionName: 'setCancelledOrders',
              storeVarName: 'cancelledOrders',
            }}
          />
        </TabOrders.Navigator>
      </Container>
    );
  }
}

export default OrdersTab;
