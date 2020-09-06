import React from 'react';
import {ActivityIndicator, StatusBar} from 'react-native';
import auth from '@react-native-firebase/auth';
import {inject, observer} from 'mobx-react';
import {View} from 'native-base';
import {colors} from '../../assets/colors';
import Toast from './Toast';
import {when} from 'mobx';

@inject('authStore')
@inject('ordersStore')
@inject('itemsStore')
@inject('detailsStore')
@observer
class AuthLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {user: null, route: null};
  }

  async onAuthStateChanged(user) {
    if (user) {
      await auth()
        .currentUser.getIdTokenResult(true)
        .then(async (idToken) => {
          const {storeIds, role} = idToken.claims;

          if (!storeIds || !role || (role && role !== 'merchant')) {
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
          }

          if (role) {
            !this.props.detailsStore.unsubscribeSetMerchantDetails &&
              this.props.detailsStore.setMerchantDetails(user.uid);
          }

          if (storeIds) {
            const storeId = Object.keys(storeIds)[0];

            !this.props.detailsStore.unsubscribeSetStoreDetails &&
              this.props.detailsStore.setStoreDetails(storeId);

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

            if (this.state.route !== 'Home') {
              this.setState({route: 'Home'});

              this.props.navigation.reset({
                index: 0,
                routes: [{name: 'Home'}],
              });
            }
          }
        });
    } else {
      this.props.detailsStore.unsubscribeSetStoreDetails &&
        this.props.detailsStore.unsubscribeSetStoreDetails();

      this.props.itemsStore.unsubscribeSetStoreItems &&
        this.props.itemsStore.unsubscribeSetStoreItems();

      if (this.state.route !== 'Login') {
        this.setState({route: 'Login'});

        this.props.navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }
    }

    this.setState({user});
  }

  componentDidMount() {
    this.setState({user: null, route: null}, () => {
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
        <StatusBar backgroundColor={colors.primary} />
        <ActivityIndicator size="large" color={colors.icons} />
      </View>
    );
  }
}

export default AuthLoader;
