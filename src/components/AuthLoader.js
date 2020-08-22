import React from 'react';
import {ActivityIndicator} from 'react-native';
import auth from '@react-native-firebase/auth';
import {inject, observer} from 'mobx-react';
import {View} from 'native-base';
import {colors} from '../../assets/colors';
import Toast from './Toast';
import {when} from 'mobx';
import messaging from '@react-native-firebase/messaging';

@inject('authStore')
@inject('ordersStore')
@inject('itemsStore')
@inject('detailsStore')
@observer
class AuthLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {user: null, initialRoute: 'Home', initialData: {reset: true}};
  }

  async onAuthStateChanged(user) {
    const {navigation} = this.props;
    const {initialRoute, initialData} = this.state;

    if (user) {
      await auth()
        .currentUser.getIdTokenResult(true)
        .then(async (idToken) => {
          const merchantIds = idToken.claims.merchantIds;

          if (!merchantIds) {
            await auth()
              .signOut()
              .then(() => {
                Toast({
                  text:
                    'Error, user account is not set as admin. Please contact Marketeer business support at business@marketeer.ph if you are supposed to be an admin.',
                  type: 'danger',
                });
              })
              .catch((err) =>
                Toast({text: err.message, type: 'danger', duration: 5000}),
              );
          } else {
            const merchantId = Object.keys(merchantIds)[0];

            !this.props.detailsStore.unsubscribeSetStoreDetails &&
              this.props.detailsStore.setStoreDetails(merchantId);

            if (this.props.detailsStore.firstLoad) {
              when(
                () =>
                  Object.keys(this.props.detailsStore.storeDetails).length > 0,
                () =>
                  this.props.detailsStore
                    .subscribeToNotifications()
                    .then(() => (this.props.detailsStore.firstLoad = false)),
              );
            }

            this.authStateSubscriber && this.authStateSubscriber();

            navigation.navigate(initialRoute, initialData);
          }
        });
    } else {
      this.props.detailsStore.unsubscribeSetStoreDetails &&
        this.props.detailsStore.unsubscribeSetStoreDetails();

      this.props.itemsStore.unsubscribeSetStoreItems &&
        this.props.itemsStore.unsubscribeSetStoreItems();

      navigation.replace('Login', initialData);
    }

    this.setState({user});
  }

  componentDidMount() {
    messaging()
      .getInitialNotification()
      .then((notification) => {
        if (notification) {
          if (notification.data.type === 'order_message') {
            this.setState({
              initialRoute: 'Order Chat',
              initialData: {orderId: notification.data.orderId},
            });
          }
        }

        this.authStateSubscriber = auth().onAuthStateChanged(
          this.onAuthStateChanged.bind(this),
        );
      });
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
        }}>
        <ActivityIndicator size="large" color={colors.icons} />
      </View>
    );
  }
}

export default AuthLoader;
