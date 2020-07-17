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
    const {visible} = this.state;

    this.props.authStore.appReady = false;

    if (auth().currentUser != null) {
      !this.props.detailsStore.unsubscribeSetStoreDetails &&
        this.props.detailsStore.setStoreDetails();

      this.setState({user});

      this.props.authStore.appReady = true;
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
    const {merchantId} = this.props.detailsStore.storeDetails;
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
