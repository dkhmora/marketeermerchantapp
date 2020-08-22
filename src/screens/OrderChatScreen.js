import React, {Component} from 'react';
import {View} from 'react-native';
import {Container} from 'native-base';
import BaseHeader from '../components/BaseHeader';
import {GiftedChat, Bubble, Send} from 'react-native-gifted-chat';
import {inject, observer} from 'mobx-react';
import {Avatar, Icon, Button, Text} from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import {observable, computed} from 'mobx';
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
      loading: true,
    };

    this.renderComposer.bind(this);
  }

  @observable imagePath = '';

  @computed get orderStatus() {
    const {selectedOrder} = this.props.ordersStore;

    if (selectedOrder) {
      const statusLabel = Object.entries(selectedOrder.orderStatus).map(
        ([key, value]) => {
          if (value.status) {
            return key.toUpperCase();
          }

          return;
        },
      );

      return statusLabel.filter((item) => item != null);
    }

    return 'Unknown';
  }

  componentDidMount() {
    this.props.navigation.setOptions({gestureEnabled: false});

    const {orderId} = this.props.route.params;

    this.props.ordersStore.getMessages(orderId);
  }

  componentWillUnmount() {
    this.props.navigation.setOptions({gestureEnabled: true});

    this.props.ordersStore.unsubscribeGetMessages();
  }

  onSend(messages = []) {
    const {orderId} = this.props.route.params;

    this.props.ordersStore.sendMessage(orderId, messages[0]);
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
    const {orderMessages, selectedOrder} = this.props.ordersStore;
    const {navigation} = this.props;
    const {orderStatus} = this;

    if (selectedOrder && orderMessages) {
      const headerTitle = `Order # ${selectedOrder.merchantOrderNumber} | ${selectedOrder.userName}`;

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
                selectedOrder.orderId,
                selectedOrder.userId,
                selectedOrder.merchantId,
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
                  orderStatus[0] === 'CANCELLED' ||
                  orderStatus[0] === 'COMPLETED'
                )
                  ? this.renderActions.bind(this)
                  : null
              }
              renderSend={
                !(
                  orderStatus[0] === 'CANCELLED' ||
                  orderStatus[0] === 'COMPLETED'
                )
                  ? this.renderSend
                  : null
              }
              renderComposer={
                orderStatus[0] === 'CANCELLED' || orderStatus[0] === 'COMPLETED'
                  ? this.renderComposer.bind(this)
                  : null
              }
              textInputStyle={{
                fontFamily: 'ProductSans-Light',
                borderBottomWidth: 1,
                borderBottomColor: colors.primary,
              }}
              listViewProps={{marginBottom: 20}}
              alwaysShowSend={
                !(
                  orderStatus[0] === 'CANCELLED' ||
                  orderStatus[0] === 'COMPLETED'
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

    return null;
  }
}

export default OrderChatScreen;
