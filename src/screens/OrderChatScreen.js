import React, {Component} from 'react';
import {Container, Text} from 'native-base';
import {SafeAreaView} from 'react-native-safe-area-context';
import BaseHeader from '../components/BaseHeader';

class OrderChatScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {navigation} = this.props;
    const {name} = this.props.route;
    const {
      userName,
      userAddress,
      orderNumber,
      orderId,
    } = this.props.route.params;

    const headerTitle = `Order # ${orderNumber} | ${userName}`;

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={headerTitle} backButton navigation={navigation} />

        <SafeAreaView style={{flex: 1}}>
          <Text>OrderChatScreen</Text>
        </SafeAreaView>
      </Container>
    );
  }
}

export default OrderChatScreen;
