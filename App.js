/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React from 'react';
import _ from 'lodash';
import moment from 'moment';

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

export default class App extends React.Component {
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
