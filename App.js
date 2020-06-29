/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React from 'react';
import {YellowBox} from 'react-native';
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

const ordersStore = (window.store = new OrdersStore());
const authStore = (window.store = new AuthStore());
const detailsStore = (window.store = new DetailsStore());
const itemsStore = (window.store = new ItemsStore());

YellowBox.ignoreWarnings([
  'Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`',
  'Animated.event now requires a second argument for options',
  'Require cycle: node_modules',
  "Warning: Can't perform a React state update on an unmounted component.",
]);

export default class App extends React.Component {
  componentDidMount() {
    SplashScreen.hide();
  }

  render() {
    return (
      <Provider
        ordersStore={ordersStore}
        authStore={authStore}
        detailsStore={detailsStore}
        itemsStore={itemsStore}>
        <Setup />
      </Provider>
    );
  }
}
