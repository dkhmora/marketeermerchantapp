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

export default class App extends React.Component {
  render() {
    return <Setup />;
  }
}
