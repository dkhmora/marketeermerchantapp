import React, {Component} from 'react';
import OrdersTab from '../navigation/OrdersTab';
import crashlytics from '@react-native-firebase/crashlytics';

class OrdersScreen extends Component {
  componentDidMount() {
    crashlytics().log('OrdersScreen');
  }

  render() {
    return <OrdersTab navigation={this.props.navigation} />;
  }
}

export default OrdersScreen;
