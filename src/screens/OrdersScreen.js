import React, {Component} from 'react';
import OrdersTab from '../navigation/OrdersTab';
import crashlytics from '@react-native-firebase/crashlytics';
import {View, StyleSheet, Dimensions, StatusBar} from 'react-native';
import MrSpeedyBottomSheet from '../components/MrSpeedyBottomSheet';
import {inject, observer} from 'mobx-react';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

@inject('ordersStore')
@observer
class OrdersScreen extends Component {
  componentDidMount() {
    crashlytics().log('OrdersScreen');
  }

  render() {
    return (
      <View>
        <TouchableWithoutFeedback
          onPress={() => {
            if (
              this.props.ordersStore.mrspeedyBottomSheet.state.openRatio > 0
            ) {
              this.props.ordersStore.mrspeedyBottomSheet.bottomSheet.snapTo(0);
            }
          }}>
          <View style={{height: SCREEN_HEIGHT + StatusBar.currentHeight}}>
            <OrdersTab navigation={this.props.navigation} />
          </View>
        </TouchableWithoutFeedback>

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
