import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Container, Toast} from 'native-base';
// Custom Components
import OrdersList from '../components/OrdersList';
import BaseHeader from '../components/BaseHeader';
import {inject, observer} from 'mobx-react';
import {colors} from '../../assets/colors';
import {computed} from 'mobx';

const TabOrders = createMaterialTopTabNavigator();

@inject('authStore')
@inject('ordersStore')
@inject('detailsStore')
@observer
class OrdersTab extends Component {
  constructor(props) {
    super(props);
  }

  @computed get notificationSubscriptionStatus() {
    return this.props.detailsStore.subscribedToNotifications
      ? 'Unsubscribed'
      : 'Subscribed';
  }

  @computed get optionsLabel() {
    return this.props.detailsStore.subscribedToNotifications
      ? 'Unsubscribe to Order Notifications'
      : 'Subscribe to Order Notifications';
  }

  handleNotificationSubscription = () => {
    const {notificationSubscriptionStatus} = this;

    this.subscribeToNotificationsTimeout &&
      clearTimeout(this.subscribeToNotificationsTimeout);

    this.props.authStore.appReady = false;

    this.subscribeToNotificationsTimeout = setTimeout(() => {
      (this.props.detailsStore.subscribedToNotifications
        ? this.props.detailsStore.unsubscribeToNotifications()
        : this.props.detailsStore.subscribeToNotifications()
      ).then(() => {
        this.props.authStore.appReady = true;

        Toast.show({
          text: `Successfully ${notificationSubscriptionStatus} to Order Notifications!`,
          buttonText: 'Okay',
          type: 'success',
          duration: 3500,
          style: {margin: 20, borderRadius: 16},
        });
      });
    }, 500);
  };

  componentWillUnmount() {
    this.props.ordersStore.unsubscribeSetCancelledOrders &&
      this.props.ordersStore.unsubscribeSetCancelledOrders();
    this.props.ordersStore.unsubscribeSetCompletedOrders &&
      this.props.ordersStore.unsubscribeSetCompletedOrders();
    this.props.ordersStore.unsubscribeSetPendingOrders &&
      this.props.ordersStore.unsubscribeSetPendingOrders();
    this.props.ordersStore.unsubscribeSetPaidOrders &&
      this.props.ordersStore.unsubscribeSetPaidOrders();
    this.props.ordersStore.unsubscribeSetUnpaidOrders &&
      this.props.ordersStore.unsubscribeSetUnpaidOrders();
    this.props.ordersStore.unsubscribeSetShippedOrders &&
      this.props.ordersStore.unsubscribeSetShippedOrders();
  }

  render() {
    const {name} = this.props.route;
    const {navigation} = this.props;
    const {optionsLabel} = this;

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
