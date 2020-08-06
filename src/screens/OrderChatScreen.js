import React, {Component} from 'react';
import {View} from 'react-native';
import {Container} from 'native-base';
import BaseHeader from '../components/BaseHeader';
import {GiftedChat, Bubble, Send, Composer} from 'react-native-gifted-chat';
import {inject, observer} from 'mobx-react';
import {Avatar, Icon, Button, Text} from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import {observable} from 'mobx';
import {colors} from '../../assets/colors';
import Toast from '../components/Toast';

@inject('ordersStore')
@inject('detailsStore')
@inject('authStore')
@observer
class OrderChatScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {
        _id: this.props.detailsStore.storeDetails.merchantId,
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

    const {order} = this.props.route.params;

    this.props.ordersStore.getMessages(order.orderId);
  }

  componentWillUnmount() {
    this.props.navigation
      .dangerouslyGetParent()
      .setOptions({gestureEnabled: true});

    this.props.ordersStore.unsubscribeGetMessages();
  }

  onSend(messages = []) {
    const {order} = this.props.route.params;
    this.props.ordersStore.sendMessage(order.orderId, messages[0]);
  }

  handleTakePhoto() {
    const {order} = this.props.route.params;

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
          order.orderId,
          order.userId,
          order.merchantId,
          this.state.user,
          this.imagePath,
        ),
      )
      .catch((err) => Toast({text: err, type: 'danger'}));
  }

  handleSelectImage() {
    const {order} = this.props.route.params;

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
          order.orderId,
          order.userId,
          order.merchantId,
          this.state.user,
          this.imagePath,
        ),
      )
      .catch((err) => Toast({text: err, type: 'danger'}));
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: colors.primary,
          },
        }}
      />
    );
  }

  renderComposer(props) {
    const {orderStatus} = this.props.route.params;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {orderStatus[0] === 'CANCELLED' || orderStatus[0] === 'COMPLETED' ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text>Chat is disabled since order is {orderStatus[0]}</Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
            }}>
            <Button
              type="clear"
              onPress={() => this.handleSelectImage()}
              color={colors.primary}
              containerStyle={{borderRadius: 24}}
              icon={<Icon name="image" color={colors.primary} />}
            />
            <Button
              type="clear"
              onPress={() => this.handleTakePhoto()}
              color={colors.primary}
              containerStyle={{borderRadius: 24}}
              icon={<Icon name="camera" color={colors.primary} />}
            />
            <View
              style={{
                flex: 1,
                marginLeft: 5,
                marginVertical: 10,
                borderWidth: 1,
                borderColor: colors.primary,
                borderRadius: 24,
              }}>
              <Composer {...props} />
            </View>
            <Send {...props} containerStyle={{paddingHorizontal: 10}}>
              <Icon
                name="send"
                color={colors.primary}
                style={{marginBottom: 8}}
              />
            </Send>
          </View>
        )}
      </View>
    );
  }

  renderAvatar(props) {
    const userInitial = props.currentMessage.user.name.charAt(0);

    return (
      <Avatar
        size="small"
        rounded
        overlayContainerStyle={{backgroundColor: colors.primary}}
        titleStyle={{color: colors.icons}}
        title={userInitial}
        activeOpacity={0.7}
      />
    );
  }

  render() {
    const {navigation} = this.props;
    const {order} = this.props.route.params;

    const headerTitle = `Order # ${order.merchantOrderNumber} | ${order.userName}`;

    const {orderMessages} = this.props.ordersStore;

    const dataSource = orderMessages.slice();

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={headerTitle} backButton navigation={navigation} />

        <View style={{flex: 1}}>
          <GiftedChat
            textStyle={{color: colors.primary}}
            renderAvatar={this.renderAvatar}
            renderBubble={this.renderBubble}
            renderComposer={this.renderComposer.bind(this)}
            maxComposerHeight={150}
            listViewProps={{marginBottom: 20}}
            alwaysShowSend
            showAvatarForEveryMessage
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
