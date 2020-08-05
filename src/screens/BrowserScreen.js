import React, {Component} from 'react';
import {View} from 'react-native';
import {WebView} from 'react-native-webview';
import BaseHeader from '../components/BaseHeader';

class BrowserScreen extends Component {
  render() {
    const {navigation} = this.props;
    const {uri, title} = this.props.route.params;

    return (
      <View style={{flex: 1}}>
        <BaseHeader backButton navigation={navigation} title={title} />

        <WebView style={{flex: 1}} source={{uri}} />
      </View>
    );
  }
}

export default BrowserScreen;
