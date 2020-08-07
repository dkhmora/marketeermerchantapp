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
import ConfirmationModal from '../components/ConfirmationModal';

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
      confirmImageModal: false,
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
    ImagePicker.openCamera({
      width: 1280,
      height: 720,
      mediaType: 'photo',
      forceJpg: true,
      compressImageQuality: 0.8,
    })
      .then((image) => {
        this.imagePath = image.path;
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  handleSelectImage() {
    ImagePicker.openPicker({
      width: 1280,
      height: 720,
      mediaType: 'photo',
      forceJpg: true,
      compressImageQuality: 0.8,
    })
      .then((image) => {
        this.imagePath = image.path;
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
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

  renderComposer() {
    const {orderStatus} = this.props.route.params;

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}>
        <Text>Chat is disabled since order is {orderStatus[0]}</Text>
      </View>
    );
  }

  renderSend(props) {
    return (
      <Send {...props} containerStyle={{paddingHorizontal: 10}}>
        <Icon name="send" color={colors.primary} style={{marginBottom: 8}} />
      </Send>
    );
  }

  renderActions() {
    return (
      <View style={{flexDirection: 'row'}}>
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
    const {order, orderStatus} = this.props.route.params;

    const headerTitle = `Order # ${order.merchantOrderNumber} | ${order.userName}`;

    const {orderMessages} = this.props.ordersStore;

    const dataSource = orderMessages.slice();

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={headerTitle} backButton navigation={navigation} />

        <ConfirmationModal
          isVisible={this.imagePath !== ''}
          title="Send Image?"
          image={this.imagePath}
          onConfirm={() => {
            this.props.ordersStore.sendImage(
              order.orderId,
              order.userId,
              order.merchantId,
              this.state.user,
              this.imagePath,
            );
            this.imagePath = '';
          }}
          closeModal={() => (this.imagePath = '')}
        />

        <View style={{flex: 1}}>
          <GiftedChat
            textStyle={{color: colors.primary}}
            renderAvatar={this.renderAvatar}
            renderBubble={this.renderBubble}
            renderActions={
              !(
                orderStatus[0] === 'CANCELLED' || orderStatus[0] === 'COMPLETED'
              ) && this.renderActions.bind(this)
            }
            renderSend={
              !(
                orderStatus[0] === 'CANCELLED' || orderStatus[0] === 'COMPLETED'
              ) && this.renderSend
            }
            renderComposer={
              (orderStatus[0] === 'CANCELLED' ||
                orderStatus[0] === 'COMPLETED') &&
              this.renderComposer.bind(this)
            }
            textInputStyle={{
              fontFamily: 'ProductSans-Light',
              borderBottomWidth: 1,
              borderBottomColor: colors.primary,
            }}
            listViewProps={{marginBottom: 20}}
            alwaysShowSend={
              !(
                orderStatus[0] === 'CANCELLED' || orderStatus[0] === 'COMPLETED'
              )
            }
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
