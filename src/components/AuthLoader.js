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
    this.state = {user: null};
  }

  async onAuthStateChanged(user) {
    const {navigation} = this.props;

    if (auth().currentUser != null) {
      await auth()
        .currentUser.getIdTokenResult(true)
        .then(async (idToken) => {
          const merchantId = idToken.claims.merchantId;

          if (!merchantId) {
            await auth()
              .signOut()
              .then(() => {
                Toast({
                  text:
                    'Error, user account is not set as admin. Please contact Marketeer business support at business@marketeer.ph if you are supposed to be an admin.',
                  type: 'danger',
                  duration: 0,
                  buttonText: 'Okay',
                });
              });
          } else {
            !this.props.detailsStore.unsubscribeSetStoreDetails &&
              this.props.detailsStore.setStoreDetails(merchantId);
          }
        });

      this.setState({user});

      this.props.authStore.appReady = true;
    } else {
      this.props.detailsStore.unsubscribeSetStoreDetails &&
        this.props.detailsStore.unsubscribeSetStoreDetails();

      this.props.itemsStore.unsubscribeSetStoreItems &&
        this.props.itemsStore.unsubscribeSetStoreItems();

      this.props.authStore.appReady = true;
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
      navigation.replace('Login');
    } else {
      navigation.replace('Home', {
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
          backgroundColor: colors.primary,
        }}>
        <ActivityIndicator size="large" color={colors.icons} />
      </View>
    );
  }
}

export default AuthLoader;
