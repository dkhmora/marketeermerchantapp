import React, {Component} from 'react';
import OrdersTab from '../navigation/OrdersTab';
import crashlytics from '@react-native-firebase/crashlytics';
import {View, StyleSheet, Dimensions, StatusBar} from 'react-native';
import MrSpeedyBottomSheet from '../components/MrSpeedyBottomSheet';
import {inject} from 'mobx-react';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

@inject('ordersStore')
class OrdersScreen extends Component {
  componentDidMount() {
    crashlytics().log('OrdersScreen');
  }

  render() {
    return (
      <View style={{height: SCREEN_HEIGHT + StatusBar.currentHeight}}>
        <OrdersTab navigation={this.props.navigation} />

        <MrSpeedyBottomSheet
          ref={(mrspeedyBottomSheet) =>
            (this.props.ordersStore.mrspeedyBottomSheet = mrspeedyBottomSheet)
          }
        />
      </View>
    );
  }
}

export default OrdersScreen;
