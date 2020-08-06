import React from 'react';
import {ActivityIndicator} from 'react-native';
import auth from '@react-native-firebase/auth';
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

    if (user) {
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
                });
              });
          } else {
            !this.props.detailsStore.unsubscribeSetStoreDetails &&
              this.props.detailsStore.setStoreDetails(merchantId);

            navigation.replace('Home', {
              merchantId,
            });

            this.authStateSubscriber && this.authStateSubscriber();
          }
        });
    } else {
      this.props.detailsStore.unsubscribeSetStoreDetails &&
        this.props.detailsStore.unsubscribeSetStoreDetails();

      this.props.itemsStore.unsubscribeSetStoreItems &&
        this.props.itemsStore.unsubscribeSetStoreItems();

      navigation.replace('Login');
    }

    this.setState({user});
  }

  componentDidMount() {
    const {navigation} = this.props;
    const {merchantId} = this.props.detailsStore.storeDetails;

    this.authStateSubscriber = auth().onAuthStateChanged(
      this.onAuthStateChanged.bind(this),
    );

    if (!this.state.user) {
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
