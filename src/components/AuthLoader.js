import React, {setState} from 'react';
import {StyleSheet, ActivityIndicator} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {inject, observer} from 'mobx-react';
import {View} from 'native-base';
import {colors} from '../../assets/colors';
import Toast from './Toast';

@inject('authStore')
@inject('ordersStore')
@inject('itemsStore')
@inject('detailsStore')
@observer
class AuthLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {visible: true, user: null};
  }

  onAuthStateChanged(user) {
    const merchantAdminsCollection = firestore().collection('merchant_admins');
    const {visible} = this.state;

    this.props.authStore.appReady = false;

    if (auth().currentUser != null) {
      console.log('auth', auth().currentUser);
      const currentUserId = auth().currentUser.uid;

      merchantAdminsCollection
        .where(`${currentUserId}`, '==', true)
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            this.props.authStore.signOut();

            Toast({
              text: 'Error: The user does not match with any merchants',
              type: 'danger',
              duration: 8000,
            });

            this.props.authStore.appReady = true;
          } else {
            snapshot.forEach((doc) => {
              const merchantId = doc.id.trim();

              this.props.authStore.setMerchantId(merchantId);
              this.props.detailsStore.setStoreDetails(merchantId);

              console.log(
                `Current user is assigned to Merchant with doc id "${merchantId}"`,
              );
            });

            this.setState({user});

            if (visible) {
              this.setState({visible: false});
            }

            this.props.authStore.appReady = true;
          }
        })
        .catch((err) => {
          console.log(`Error: Cannot read documents - ${err}`);
        });
    } else {
      this.props.detailsStore.unsubscribeSetStoreDetails &&
        this.props.detailsStore.unsubscribeSetStoreDetails();

      this.props.itemsStore.unsubscribeSetStoreItems &&
        this.props.itemsStore.unsubscribeSetStoreItems();

      this.props.ordersStore.pendingOrders = [];
      this.props.ordersStore.paidOrders = [];
      this.props.ordersStore.unpaidOrders = [];
      this.props.ordersStore.shippedOrders = [];
      this.props.ordersStore.completedOrders = [];
      this.props.ordersStore.cancelledOrders = [];

      this.props.navigation.navigate('Login');

      this.props.authStore.appReady = true;
    }

    if (visible) {
      this.setState({visible: false});
    }
  }

  componentDidMount() {
    const subscriber = auth().onAuthStateChanged(
      this.onAuthStateChanged.bind(this),
    );

    return subscriber;
  }

  componentDidUpdate() {
    const {navigation} = this.props;
    const {merchantId} = this.props.authStore;
    const {user} = this.state;

    if (!user) {
      navigation.navigate('Login');
    } else {
      navigation.navigate('Home', {
        merchantId,
      });
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
}

export default AuthLoader;
