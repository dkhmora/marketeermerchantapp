import React, {Component} from 'react';
import OrdersTab from '../navigation/OrdersTab';

class OrdersScreen extends Component {
  render() {
    return <OrdersTab navigation={this.props.navigation} />;
  }
}

export default OrdersScreen;
