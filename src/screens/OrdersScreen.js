import React, {Component} from 'react';
import OrdersTab from '../navigation/OrdersTab';
import crashlytics from '@react-native-firebase/crashlytics';
import {View, Dimensions, StatusBar, StyleSheet} from 'react-native';
import MrSpeedyBottomSheet from '../components/MrSpeedyBottomSheet';
import {inject, observer} from 'mobx-react';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import BaseHeader from '../components/BaseHeader';
import CancelOrderModal from '../components/CancelOrderModal';

const SCREEN_HEIGHT = Dimensions.get('window').height;

@inject('ordersStore')
@observer
class OrdersScreen extends Component {
  componentDidMount() {
    this.props.ordersStore.clearGetCourierInterval();

    crashlytics().log('OrdersScreen');
  }

  render() {
    const {navigation} = this.props;

    return (
      <View style={{height: SCREEN_HEIGHT + StatusBar.currentHeight}}>
        <View
          style={{flex: 1}}
          onTouchStart={() => {
            if (
              this.props.ordersStore.mrspeedyBottomSheet.state.openRatio > 0
            ) {
              this.props.ordersStore.mrspeedyBottomSheet.bottomSheet.snapTo(0);
            }
          }}>
          <CancelOrderModal navigation={navigation} />

          <BaseHeader
            title="Orders"
            destructiveIndex={1}
            navigation={navigation}
          />

          <OrdersTab navigation={this.props.navigation} />
        </View>

        <MrSpeedyBottomSheet
          ref={(mrspeedyBottomSheet) =>
            (this.props.ordersStore.mrspeedyBottomSheet = mrspeedyBottomSheet)
          }
          clearSelectedOrderOnClose
        />
      </View>
    );
  }
}

export default OrdersScreen;
