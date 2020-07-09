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
import {observable, action, computed} from 'mobx';
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

  @computed get orderStatus() {
    const {orderStatus} = this.props;

    const statusLabel = Object.entries(orderStatus).map(([key, value]) => {
      if (value.status) {
        return key.toUpperCase();
      }

      return;
    });

    return statusLabel.filter((item) => item != null);
  }

  handleChangeOrderStatus() {
    const {orderId, merchantOrderNumber} = this.props;
    this.props.ordersStore.setOrderStatus(orderId).then(() => {
      Toast.show({
        text: `Successfully changed Order # ${merchantOrderNumber} status!`,
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
      deliveryCoordinates,
      orderId,
      orderStatus,
      userName,
      merchantOrderNumber,
      quantity,
      shippingPrice,
      totalAmount,
      deliveryAddress,
      createdAt,
    } = this.props;

    console.log(deliveryAddress, deliveryCoordinates);

    this.props.ordersStore.setOrderItems(orderId).then(() => {
      navigation.dangerouslyGetParent().navigate('Order Details', {
        orderId,
        orderItems: this.props.ordersStore.orderItems,
        deliveryCoordinates,
        orderStatus,
        userName,
        merchantOrderNumber,
        quantity,
        shippingPrice,
        totalAmount,
        deliveryAddress,
        createdAt,
      });
    });
  }

  handleCancelOrder() {
    const {orderId, merchantOrderNumber} = this.props;
    this.props.ordersStore.cancelOrder(orderId, this.cancelReason).then(() => {
      Toast.show({
        text: `Order # ${merchantOrderNumber} successfully cancelled!`,
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
      merchantOrderNumber,
      userName,
      quantity,
      totalAmount,
      orderId,
      paymentMethod,
      deliveryAddress,
      deliveryCoordinates,
      createdAt,
      index,
      tabName,
      navigation,
      ...otherProps
    } = this.props;

    const buttonText =
      (tabName === 'Paid' && 'Ship') ||
      (tabName === 'Pending' && 'Accept') ||
      (tabName === 'Shipped' && 'Complete');

    const CardHeader = () => {
      const optionsButton = tabName === 'Pending' ? true : false;

      return (
        <CardItem
          header
          bordered
          button
          onPress={() =>
            navigation.navigate('Order Chat', {
              userName,
              deliveryAddress,
              orderId,
              merchantOrderNumber,
              orderStatus: this.orderStatus,
            })
          }
          style={{backgroundColor: colors.primary}}>
          <View
            style={{
              flex: 2,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View>
              <Icon name="message-square" color={colors.icons} />
              <Text style={{color: colors.icons}}>Chat</Text>
            </View>

            <View
              style={{flex: 1, flexDirection: 'column', paddingHorizontal: 10}}>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'ProductSans-Regular',
                  fontSize: 18,
                }}>
                {userName}
              </Text>

              <Text style={{color: '#eee'}}>Order # {merchantOrderNumber}</Text>

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
                  adjustsFontSizeToFit
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

          <Card
            style={{
              flex: 1,
              backgroundColor: '#F8BBD0',
              borderRadius: 16,
              paddingVertical: 10,
              paddingHorizontal: 5,
            }}>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: 'ProductSans-Black',
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                ₱{(totalAmount * 0.05).toPrecision(3)}
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: colors.text_primary,
                  textAlign: 'center',
                }}>
                Transaction Fee
              </Text>
            </View>
          </Card>

          {optionsButton && (
            <View>
              <BaseOptionsMenu
                iconStyle={{color: '#fff', fontSize: 27}}
                destructiveIndex={1}
                options={['Cancel Order']}
                actions={[this.openConfirmationModal.bind(this)]}
              />
            </View>
          )}
        </CardItem>
      );
    };

    const CardFooter = () => {
      const footerStatus = `Order ${tabName}`;

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
                Delivery Address:
              </Text>
            </Left>
            <Right>
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: 'ProductSans-Black',
                  fontSize: 16,
                  textAlign: 'right',
                }}>
                {deliveryAddress}
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
