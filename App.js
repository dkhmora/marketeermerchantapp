/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React from 'react';
import {YellowBox, Linking, Platform, LogBox} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';
import moment from 'moment';
import SplashScreen from 'react-native-splash-screen';
import crashlytics from '@react-native-firebase/crashlytics';

global._ = _;
global.moment = moment;

import Setup from './src/boot/setup';
import {Provider} from 'mobx-react';
import OrdersStore from './src/store/ordersStore';
import AuthStore from './src/store/authStore';
import DetailsStore from './src/store/detailsStore';
import ItemsStore from './src/store/itemsStore';
import PaymentsStore from './src/store/paymentsStore';
import {create} from 'mobx-persist';
import VersionCheck from 'react-native-version-check';
import AlertModal from './src/components/AlertModal';

const hydrate = create({storage: AsyncStorage});
const ordersStore = (window.store = new OrdersStore());
const authStore = (window.store = new AuthStore());
const detailsStore = (window.store = new DetailsStore());
const itemsStore = (window.store = new ItemsStore());
const paymentsStore = (window.store = new PaymentsStore());

hydrate('list', ordersStore);
hydrate('list', itemsStore);
hydrate('list', detailsStore);
hydrate('subscribedToNotifications', detailsStore);

LogBox.ignoreLogs([
  'Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`',
  '"message":"Parse Error.',
]);

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      appUpdateModal: false,
      appUrl: null,
    };
  }

  componentDidMount() {
    const provider = Platform.OS === 'android' ? 'playStore' : 'appStore';

    crashlytics().log('App Mounted');

    VersionCheck.needUpdate({
      provider,
      forceUpdate: true,
    }).then(async (res) => {
      if (res) {
        if (res.isNeeded) {
          crashlytics().log('Request Update');
          this.setState({appUpdateModal: true, appUrl: res.storeUrl});
        } else {
          crashlytics().log('Hide SplashScreen');
          setTimeout(() => SplashScreen.hide(), 500);
        }
      } else {
        crashlytics().log('Res cannot be found');
        setTimeout(() => SplashScreen.hide(), 500);
      }
    });
  }

  openAppUrl() {
    if (this.state.appUrl) {
      Linking.openURL(this.state.appUrl);
    }
  }

  render() {
    return (
      <Provider
        ordersStore={ordersStore}
        authStore={authStore}
        detailsStore={detailsStore}
        itemsStore={itemsStore}
        paymentsStore={paymentsStore}>
        <AlertModal
          isVisible={this.state.appUpdateModal}
          onConfirm={() => {
            this.openAppUrl();
          }}
          buttonText={`Go to ${
            Platform.OS === 'android' ? 'Play Store' : 'App Store'
          }`}
          title="Please update Marketeer Merchant"
          body="Your Marketeer Merchant app is out of date. Please update."
        />
        <Setup />
      </Provider>
    );
  }
}
