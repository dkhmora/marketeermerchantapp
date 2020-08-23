import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Container} from 'native-base';
// Custom Components
import OrdersList from '../components/OrdersList';
import BaseHeader from '../components/BaseHeader';
import {inject, observer} from 'mobx-react';
import {colors} from '../../assets/colors';
import {computed} from 'mobx';
import CancelOrderModal from '../components/CancelOrderModal';
import Toast from '../components/Toast';

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

        Toast({
          text: `Successfully ${notificationSubscriptionStatus} to Order Notifications!`,
          type: 'success',
          duration: 3500,
          style: {margin: 20, borderRadius: 16},
        });
      });
    }, 500);
  };

  componentDidMount() {
    const {merchantId} = this.props.detailsStore.storeDetails;

    this.props.ordersStore.setOrders(merchantId);
  }

  componentWillUnmount() {
    this.props.ordersStore.unsubscribeSetOrders &&
      this.props.ordersStore.unsubscribeSetOrders();
  }

  render() {
    const {navigation} = this.props;
    const {optionsLabel} = this;

    return (
      <Container>
        <BaseHeader
          title="Orders"
          options={[optionsLabel]}
          actions={[this.handleNotificationSubscription]}
          destructiveIndex={1}
          navigation={navigation}
        />
        <CancelOrderModal navigation={navigation} />

        <TabOrders.Navigator
          lazy
          lazyPreloadDistance={1}
          tabBarOptions={{
            scrollEnabled: true,
            style: {backgroundColor: colors.icons},
            activeTintColor: colors.primary,
            inactiveTintcolor: '#eee',
            tabStyle: {width: 'auto'},
            indicatorStyle: {
              backgroundColor: colors.primary,
            },
          }}
          headerMode="none"
          backBehavior="initialRoute">
          <TabOrders.Screen name="Pending" component={OrdersList} />
          <TabOrders.Screen name="Unpaid" component={OrdersList} />
          <TabOrders.Screen name="Paid" component={OrdersList} />
          <TabOrders.Screen name="Shipped" component={OrdersList} />
          <TabOrders.Screen name="Completed" component={OrdersList} />
          <TabOrders.Screen name="Cancelled" component={OrdersList} />
        </TabOrders.Navigator>
      </Container>
    );
  }
}

export default OrdersTab;
