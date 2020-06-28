import React, {Component} from 'react';
import {View, Image} from 'react-native';
import {Container, Text, Icon, Button, Input, Item} from 'native-base';
import {SafeAreaView} from 'react-native-safe-area-context';
import BaseHeader from '../components/BaseHeader';
import {
  GiftedChat,
  Bubble,
  Send,
  Composer,
  MessageImage,
} from 'react-native-gifted-chat';
import {inject, observer} from 'mobx-react';
import ImagePicker from 'react-native-image-crop-picker';
import {observable} from 'mobx';

@inject('ordersStore')
@inject('detailsStore')
@inject('authStore')
@observer
class OrderChatScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {
        _id: this.props.authStore.merchantId,
        name: this.props.detailsStore.storeDetails.storeName,
      },
    };

    this.renderComposer.bind(this);
  }

  @observable imagePath = '';

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

  handleTakePhoto() {
    const {orderId} = this.props.route.params;

    ImagePicker.openCamera({
      width: 1280,
      height: 720,
      mediaType: 'photo',
      compressImageQuality: 0.8,
    })
      .then((image) => {
        this.imagePath = image.path;
      })
      .then(() =>
        this.props.ordersStore.sendImage(
          orderId,
          this.state.user,
          this.imagePath,
        ),
      )
      .catch((err) => console.log(err));
  }

  handleSelectImage() {
    const {orderId} = this.props.route.params;

    ImagePicker.openPicker({
      width: 1280,
      height: 720,
      mediaType: 'photo',
      compressImageQuality: 0.8,
    })
      .then((image) => {
        this.imagePath = image.path;
      })
      .then(() =>
        this.props.ordersStore.sendImage(
          orderId,
          this.state.user,
          this.imagePath,
        ),
      )
      .catch((err) => console.log(err));
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
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Button transparent onPress={() => this.handleSelectImage()}>
          <Icon name="image" />
        </Button>
        <Button transparent onPress={() => this.handleTakePhoto()}>
          <Icon name="camera" />
        </Button>
        <View
          style={{
            flex: 1,
            marginRight: 15,
            marginVertical: 10,
            borderWidth: 1,
            borderColor: '#E91E63',
            borderRadius: 24,
          }}>
          <Composer {...props} />
        </View>
        <Send {...props}>
          <Icon
            name="send"
            style={{color: '#E91E63', marginBottom: 8, marginRight: 10}}
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
            renderComposer={this.renderComposer.bind(this)}
            maxComposerHeight={150}
            listViewProps={{marginBottom: 20}}
            alwaysShowSend
            messages={dataSource}
            onSend={(messages) => this.onSend(messages)}
            user={this.state.user}
          />
        </View>
      </Container>
    );
  }
}

export default OrderChatScreen;
