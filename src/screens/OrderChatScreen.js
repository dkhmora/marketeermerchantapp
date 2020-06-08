import React, {Component} from 'react';
import {View, Image} from 'react-native';
import {Container, Text, Icon, Button, Input} from 'native-base';
import {SafeAreaView} from 'react-native-safe-area-context';
import BaseHeader from '../components/BaseHeader';
import {GiftedChat, Bubble, Send, Composer} from 'react-native-gifted-chat';
import {inject, observer} from 'mobx-react';

@inject('ordersStore')
@observer
class OrderChatScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.navigation
      .dangerouslyGetParent()
      .setOptions({gestureEnabled: false});

    const {orderId} = this.props.route.params;
    this.props.ordersStore.getMessages(orderId);
  }

  componentWillUnmount() {
    this.props.navigation
      .dangerouslyGetParent()
      .setOptions({gestureEnabled: true});
  }

  onSend(messages = []) {
    const {orderId} = this.props.route.params;
    this.props.ordersStore.sendMessage(orderId, messages[0]);
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#E91E63',
          },
        }}
      />
    );
  }

  renderComposer(props) {
    return (
      <View style={{flexDirection: 'row'}}>
        <Button transparent onPress={() => console.log('gumana')}>
          <Icon name="image" />
        </Button>
        <Composer {...props} />
        <Send {...props}>
          <Icon
            name="send"
            style={{color: '#E91E63', marginBottom: 5, marginRight: 10}}
          />
        </Send>
      </View>
    );
  }

  render() {
    const {navigation} = this.props;
    const {
      userName,
      userAddress,
      orderNumber,
      orderId,
    } = this.props.route.params;

    const headerTitle = `Order # ${orderNumber} | ${userName}`;

    const {orderMessages} = this.props.ordersStore;

    const dataSource = orderMessages.slice();

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={headerTitle} backButton navigation={navigation} />

        <View style={{flex: 1}}>
          <GiftedChat
            textStyle={{color: '#E91E63'}}
            renderBubble={this.renderBubble}
            renderComposer={this.renderComposer}
            alwaysShowSend
            messages={dataSource}
            onSend={(messages) => this.onSend(messages)}
            user={{
              _id: 1,
              name: 'user',
              avatar:
                'https://store.playstation.com/store/api/chihiro/00_09_000/container/US/en/99/UP1675-CUSA11816_00-AV00000000000012//image?_version=00_09_000&platform=chihiro&w=720&h=720&bg_color=000000&opacity=100',
            }}
          />
        </View>
      </Container>
    );
  }
}

export default OrderChatScreen;
