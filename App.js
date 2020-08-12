/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React from 'react';
import {YellowBox, Linking, Platform} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';
import moment from 'moment';
import SplashScreen from 'react-native-splash-screen';

global._ = _;
global.moment = moment;

import Setup from './src/boot/setup';
import {Provider} from 'mobx-react';
import OrdersStore from './src/store/ordersStore';
import AuthStore from './src/store/authStore';
import DetailsStore from './src/store/detailsStore';
import ItemsStore from './src/store/itemsStore';
import {create} from 'mobx-persist';
import VersionCheck from 'react-native-version-check';
import AlertModal from './src/components/AlertModal';

const hydrate = create({storage: AsyncStorage});
const ordersStore = (window.store = new OrdersStore());
const authStore = (window.store = new AuthStore());
const detailsStore = (window.store = new DetailsStore());
const itemsStore = (window.store = new ItemsStore());

hydrate('list', ordersStore);
hydrate('list', itemsStore);
hydrate('firstLoad', detailsStore);
hydrate('subscribedToNotifications', detailsStore);

YellowBox.ignoreWarnings([
  'Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`',
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

    VersionCheck.needUpdate({
      provider,
      forceUpdate: true,
    }).then(async (res) => {
      if (res) {
        if (res.isNeeded) {
          this.setState({appUpdateModal: true, appUrl: res.storeUrl});
        } else {
          setTimeout(() => SplashScreen.hide(), 500);
        }
      } else {
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
        itemsStore={itemsStore}>
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
