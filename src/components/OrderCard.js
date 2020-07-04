import React, {Component} from 'react';
import {
  Card,
  CardItem,
  Left,
  Body,
  Right,
  Toast,
  View,
  Item,
  H3,
  Textarea,
} from 'native-base';
import {ActionSheetIOS, Platform} from 'react-native';
import moment, {ISO_8601} from 'moment';
import {observer, inject} from 'mobx-react';
import Modal from 'react-native-modal';
import {Icon, Button, Text} from 'react-native-elements';
import {observable, action} from 'mobx';
import BaseOptionsMenu from './BaseOptionsMenu';
import {colors} from '../../assets/colors';

@inject('ordersStore')
@observer
class OrderCard extends Component {
  constructor(props) {
    super(props);
  }

  @observable confirmationModal = false;
  @observable cancelReason = '';

  @action openConfirmationModal() {
    this.confirmationModal = true;
  }

  @action closeConfirmationModal() {
    this.confirmationModal = false;
  }

  handleChangeOrderStatus() {
    const {orderId, orderNumber} = this.props;
    this.props.ordersStore.setOrderStatus(orderId).then(() => {
      Toast.show({
        text: `Successfully changed Order # ${orderNumber} status!`,
        buttonText: 'Okay',
        type: 'success',
        duration: 3500,
        style: {margin: 20, borderRadius: 16},
      });
    });
    this.closeConfirmationModal();
  }

  handleViewOrderItems() {
    const {
      navigation,
      coordinates,
      orderId,
      orderStatus,
      userName,
      orderNumber,
      quantity,
      shippingPrice,
      totalAmount,
      userAddress,
      createdAt,
    } = this.props;

    this.props.ordersStore.setOrderItems(orderId).then(() => {
      navigation.dangerouslyGetParent().navigate('Order Details', {
        orderId,
        orderItems: this.props.ordersStore.orderItems,
        coordinates,
        orderStatus,
        userName,
        orderNumber,
        quantity,
        shippingPrice,
        totalAmount,
        userAddress,
        createdAt,
      });
    });
  }

  handleCancelOrder() {
    const {orderId, orderNumber} = this.props;
    this.props.ordersStore.cancelOrder(orderId, this.cancelReason).then(() => {
      Toast.show({
        text: `Order # ${orderNumber} successfully cancelled!`,
        buttonText: 'Okay',
        type: 'success',
        duration: 3500,
        style: {margin: 20, borderRadius: 16},
      });
    });
  }

  openOptions() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Decline Order'],
        destructiveIndex: 1,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else {
          this.handleCancelOrder.bind(this);
        }
      },
    );
  }

  render() {
    const {
      orderNumber,
      userName,
      orderStatus,
      quantity,
      totalAmount,
      orderId,
      paymentMethod,
      userAddress,
      createdAt,
      index,
      tabName,
      navigation,
      ...otherProps
    } = this.props;

    const buttonText =
      (tabName === 'Paid' && 'Ship') || (tabName === 'Pending' && 'Accept');

    const transactionFeeStatus =
      tabName === 'Pending'
        ? 'To be charged when Accepted'
        : 'Charged to account';

    const CardHeader = () => {
      const optionsButton = tabName === 'Pending' ? true : false;

      const chatButton =
        tabName === 'Completed' || tabName === 'Cancelled' ? false : true;

      return (
        <CardItem
          header
          bordered
          button={chatButton}
          onPress={() =>
            navigation.navigate('Order Chat', {
              userName,
              userAddress,
              orderId,
              orderNumber,
              orderStatus,
            })
          }
          style={{backgroundColor: colors.primary}}>
          <View style={{flex: 3, flexDirection: 'row', alignItems: 'center'}}>
            {chatButton && (
              <View>
                <Icon name="message-square" color={colors.icons} />
                <Text style={{color: colors.icons}}>Chat</Text>
              </View>
            )}
            <View style={{flexDirection: 'column', paddingHorizontal: 10}}>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'ProductSans-Regular',
                  fontSize: 18,
                }}>
                {userName}
              </Text>
              <Text style={{color: '#eee'}}>Order # {orderNumber}</Text>
              <View
                key={index}
                style={{
                  borderRadius: 20,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  paddingVertical: 3,
                  paddingHorizontal: 7,
                  marginRight: 2,
                  alignSelf: 'flex-start',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#fff',
                    textAlign: 'center',
                  }}>
                  {paymentMethod}
                </Text>
              </View>
            </View>
          </View>
          <View style={{flex: 4, alignItems: 'flex-end'}}>
            <Card
              style={{
                backgroundColor: '#F8BBD0',
                borderRadius: 16,
              }}>
              <CardItem
                style={{
                  backgroundColor: 'transparent',
                }}>
                <View
                  style={{
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                  }}>
                  <Body>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <Text style={{fontSize: 16, color: colors.text_primary}}>
                        Transaction Fee:{' '}
                      </Text>
                      <Text
                        style={{
                          color: colors.primary,
                          fontFamily: 'ProductSans-Black',
                          fontSize: 16,
                        }}>
                        ₱{(totalAmount * 0.05).toPrecision(3)}
                      </Text>
                    </View>
                    <Text note style={{color: '#757575', textAlign: 'center'}}>
                      {transactionFeeStatus}
                    </Text>
                  </Body>
                </View>
              </CardItem>
            </Card>
          </View>
          {optionsButton && (
            <Right style={{flex: 1}}>
              <BaseOptionsMenu
                iconStyle={{color: '#fff', fontSize: 27}}
                destructiveIndex={1}
                options={['Cancel Order']}
                actions={[this.openConfirmationModal.bind(this)]}
              />
            </Right>
          )}
        </CardItem>
      );
    };

    const CardFooter = () => {
      const footerStatus =
        tabName === 'Shipped'
          ? 'Waiting for Customer to Confirm Receipt of Products'
          : `Order ${tabName}`;

      const timeStamp = moment(createdAt, ISO_8601).fromNow();

      return (
        <CardItem footer bordered>
          <Left>
            <Text note>{timeStamp}</Text>
          </Left>
          <Right>
            {footerStatus && !buttonText ? (
              <Text style={{textAlign: 'right'}}>{footerStatus}</Text>
            ) : (
              <Button
                title={buttonText}
                titleStyle={{color: colors.icons}}
                buttonStyle={{backgroundColor: colors.accent}}
                containerStyle={{
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  width: '100%',
                }}
                onPress={this.handleChangeOrderStatus.bind(this)}
              />
            )}
          </Right>
        </CardItem>
      );
    };

    return (
      <View>
        <View style={{flex: 1}}>
          <Modal
            isVisible={this.confirmationModal}
            transparent={true}
            style={{alignItems: 'center'}}>
            <Card
              style={{
                borderRadius: 10,
                overflow: 'hidden',
                width: '100%',
              }}>
              <CardItem header>
                <Left>
                  <Body>
                    <H3>Are you sure?</H3>
                  </Body>
                </Left>
              </CardItem>
              <CardItem>
                <Body>
                  <Textarea
                    rowSpan={6}
                    maxLength={600}
                    bordered
                    placeholder="Reason for Cancellation"
                    value={this.cancelReason}
                    onChangeText={(value) => (this.cancelReason = value)}
                    style={{borderRadius: 24, width: '100%'}}
                  />
                  <Text note style={{alignSelf: 'flex-end', marginRight: 16}}>
                    Character Limit: {this.cancelReason.length}/600
                  </Text>
                </Body>
              </CardItem>
              <CardItem>
                <Body>
                  <Text note style={{textAlign: 'justify', width: '100%'}}>
                    You can no longer bring back an order after it has been
                    cancelled.
                  </Text>
                </Body>
              </CardItem>
              <CardItem footer>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}>
                  <Button
                    title="Cancel"
                    titleStyle={{color: colors.accent}}
                    buttonStyle={{backgroundColor: colors.icons}}
                    containerStyle={{
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: colors.accent,
                      marginRight: 10,
                    }}
                    onPress={this.closeConfirmationModal.bind(this)}
                  />
                  <Button
                    title="Confirm"
                    titleStyle={{color: colors.icons}}
                    buttonStyle={{backgroundColor: colors.dark_accent}}
                    containerStyle={{
                      borderRadius: 24,
                    }}
                    onPress={this.handleCancelOrder.bind(this)}
                  />
                </View>
              </CardItem>
            </Card>
          </Modal>
        </View>

        <Card {...otherProps} style={{borderRadius: 10, overflow: 'hidden'}}>
          <CardHeader />
          <CardItem bordered>
            <Left>
              <Text style={{fontFamily: 'ProductSans-Regular', fontSize: 16}}>
                Address:
              </Text>
            </Left>
            <Right>
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: 'ProductSans-Black',
                  fontSize: 16,
                }}>
                {userAddress}
              </Text>
            </Right>
          </CardItem>
          <CardItem bordered>
            <Left>
              <Text style={{fontFamily: 'ProductSans-Regular', fontSize: 16}}>
                Total Amount:
              </Text>
            </Left>
            <Right>
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: 'ProductSans-Black',
                  fontSize: 16,
                }}>
                ₱{totalAmount}
              </Text>
              <Text note>{quantity} items</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Body>
              <Button
                title="View Full Order"
                onPress={this.handleViewOrderItems.bind(this)}
                titleStyle={{color: colors.accent}}
                buttonStyle={{backgroundColor: colors.icons}}
                containerStyle={{
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  width: '100%',
                }}
              />
            </Body>
          </CardItem>
          <CardFooter />
        </Card>
      </View>
    );
  }
}

OrderCard.defaultProps = {
  editable: false,
};

export default OrderCard;
