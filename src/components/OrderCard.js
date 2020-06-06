import React, {Component} from 'react';
import {
  Card,
  CardItem,
  Left,
  Body,
  Text,
  Button,
  Right,
  Icon,
  Toast,
  View,
  Item,
  Input,
  H3,
} from 'native-base';
import {ActionSheetIOS, Platform} from 'react-native';
import moment, {ISO_8601} from 'moment';
import OptionsMenu from 'react-native-options-menu';
import {observer, inject} from 'mobx-react';
import Modal from 'react-native-modal';
import {observable, action} from 'mobx';

@inject('ordersStore')
@observer
class OrderCard extends Component {
  constructor(props) {
    super(props);
  }

  @observable confirmationModal = false;

  @action openConfirmationModal() {
    this.confirmationModal = true;
  }

  @action closeConfirmationModal() {
    this.confirmationModal = false;
  }

  handleChangeOrderStatus() {
    const {merchantId, orderId, orderNumber} = this.props;
    this.props.ordersStore.setOrderStatus(merchantId, orderId).then(() => {
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
      orderId,
      userName,
      orderNumber,
      numberOfItems,
      shippingPrice,
      totalAmount,
      userAddress,
      createdAt,
    } = this.props;

    this.props.ordersStore.setOrderItems(orderId).then(() => {
      navigation.dangerouslyGetParent().navigate('Order Details', {
        orderId,
        orderItems: this.props.ordersStore.orderItems,
        userName,
        orderNumber,
        numberOfItems,
        shippingPrice,
        totalAmount,
        userAddress,
        createdAt,
      });
    });
  }

  handleCancelOrder() {
    const {merchantId, orderId, orderNumber} = this.props;
    this.props.ordersStore.cancelOrder(merchantId, orderId).then(() => {
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
      numberOfItems,
      totalAmount,
      orderId,
      userAddress,
      createdAt,
      index,
      tabName,
      ...otherProps
    } = this.props;

    const buttonText =
      (tabName === 'Accepted' && 'Ship') || (tabName === 'Pending' && 'Accept');

    const transactionFeeStatus =
      tabName === 'Pending'
        ? 'To be charged when Accepted'
        : 'Charged to account';

    const CardHeader = () => {
      let optionsButton = false;

      optionsButton = tabName === 'Pending' && true;

      return (
        <CardItem header bordered style={{backgroundColor: '#E91E63'}}>
          <Left style={{flex: 3}}>
            <Body>
              <Text style={{color: '#fff'}}>{userName}</Text>
              <Text note style={{color: '#ddd'}}>
                Order # {orderNumber}
              </Text>
            </Body>
          </Left>
          <Body style={{flex: 5}}>
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
                      <Text style={{color: '#212121'}}>Transaction Fee: </Text>
                      <Text style={{color: '#E91E63', fontWeight: 'bold'}}>
                        ₱{(totalAmount * 0.05).toPrecision(5)}
                      </Text>
                    </View>
                    <Text note style={{color: '#757575', textAlign: 'center'}}>
                      {transactionFeeStatus}
                    </Text>
                  </Body>
                </View>
              </CardItem>
            </Card>
          </Body>
          {optionsButton && (
            <Right style={{flex: 1}}>
              {Platform.OS === 'ios' ? (
                <Button
                  transparent
                  onPress={() => this.openOptions()}
                  style={{paddingLeft: 5}}>
                  <Icon name="more" style={{color: '#fff', fontSize: 27}} />
                </Button>
              ) : (
                <OptionsMenu
                  customButton={
                    <Icon
                      active
                      name="more"
                      style={{color: '#fff', fontSize: 27}}
                    />
                  }
                  destructiveIndex={1}
                  options={['Cancel Order']}
                  actions={[this.openConfirmationModal.bind(this)]}
                />
              )}
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
              <Text note>{footerStatus}</Text>
            ) : (
              <Button
                success
                rounded
                onPress={this.handleChangeOrderStatus.bind(this)}>
                <Text>{buttonText}</Text>
              </Button>
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
                borderRadius: 16,
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
                <Left style={{marginRight: '5%'}}>
                  <Body>
                    <Text style={{textAlign: 'justify'}}>
                      You can no longer bring back an order after it has been
                      cancelled.
                    </Text>
                  </Body>
                </Left>
              </CardItem>
              <CardItem footer>
                <Left />
                <Right style={{flexDirection: 'row', marginRight: 25}}>
                  <Button
                    transparent
                    onPress={this.closeConfirmationModal.bind(this)}>
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    transparent
                    onPress={this.handleCancelOrder.bind(this)}>
                    <Text>Confirm</Text>
                  </Button>
                </Right>
              </CardItem>
            </Card>
          </Modal>
        </View>

        <Card {...otherProps} style={{borderRadius: 16, overflow: 'hidden'}}>
          <CardHeader />
          <CardItem bordered>
            <Left>
              <Text>Address:</Text>
            </Left>
            <Right>
              <Text style={{color: '#E91E63', fontWeight: 'bold'}}>
                {userAddress}
              </Text>
            </Right>
          </CardItem>
          <CardItem bordered>
            <Left>
              <Text>Total Amount:</Text>
            </Left>
            <Right>
              <Text style={{color: '#E91E63', fontWeight: 'bold'}}>
                ₱{totalAmount}
              </Text>
              <Text note>{numberOfItems} items</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Body>
              <Button
                full
                bordered
                rounded
                onPress={this.handleViewOrderItems.bind(this)}>
                <Text>View Full Order</Text>
              </Button>
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
