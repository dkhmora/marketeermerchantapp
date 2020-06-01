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
global._ = _;

import Setup from './src/boot/setup';
import {Provider} from 'mobx-react';
import {OrderStore, AuthStore, DetailsStore} from './src/store';

const orderStore = (window.store = new OrderStore());
const authStore = (window.store = new AuthStore());
const detailsStore = (window.store = new DetailsStore());
export default class App extends React.Component {
  render() {
    return (
      <Provider
        orderStore={orderStore}
        authStore={authStore}
        detailsStore={detailsStore}>
        <Setup />
      </Provider>
    );
  }
}
