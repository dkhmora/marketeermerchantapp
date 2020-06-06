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
} from 'native-base';
import {ActionSheetIOS, Platform} from 'react-native';
import moment, {ISO_8601} from 'moment';
import OptionsMenu from 'react-native-options-menu';
import {observer, inject} from 'mobx-react';

@inject('ordersStore')
@observer
class OrderCard extends Component {
  constructor(props) {
    super(props);
  }

  handleOrderStatus() {
    const {merchantId, orderId} = this.props;
    this.props.ordersStore.setOrderStatus(merchantId, orderId);
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
          this.handleDelete();
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

    const footerStatus =
      tabName === 'Shipped'
        ? 'Waiting for Customer to Confirm Receipt of Products'
        : `Order ${tabName}`;

    const timeStamp = moment(createdAt, ISO_8601).fromNow();

    return (
      <Card {...otherProps} style={{borderRadius: 16, overflow: 'hidden'}}>
        <CardItem header bordered style={{backgroundColor: '#E91E63'}}>
          <Left>
            <Body>
              <Text style={{color: '#fff'}}>{userName}</Text>
              <Text note style={{color: '#ddd'}}>
                Order # {orderNumber}
              </Text>
            </Body>
          </Left>
          <Right
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginLeft: `-30%`,
            }}>
            <Text note style={{color: '#ddd'}}>
              Merchant Fee: ₱{(totalAmount * 0.05).toPrecision(5)}
            </Text>
            {Platform.OS === 'ios' ? (
              <Button
                transparent
                onPress={() => this.openOptions()}
                style={{paddingLeft: 5}}>
                <Icon name="more" style={{color: '#fff'}} />
              </Button>
            ) : (
              <OptionsMenu
                customButton={
                  <Icon active name="more" style={{color: '#fff'}} />
                }
                destructiveIndex={1}
                options={['Cancel Order']}
                actions={[]}
              />
            )}
          </Right>
        </CardItem>
        <CardItem bordered>
          <Left>
            <Text>Address:</Text>
          </Left>
          <Right>
            <Text>{userAddress}</Text>
          </Right>
        </CardItem>
        <CardItem bordered>
          <Left>
            <Text>Total Amount:</Text>
          </Left>
          <Right>
            <Text>₱{totalAmount}</Text>
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
                onPress={this.handleOrderStatus.bind(this)}>
                <Text>{buttonText}</Text>
              </Button>
            )}
          </Right>
        </CardItem>
      </Card>
    );
  }
}

OrderCard.defaultProps = {
  editable: false,
};

export default OrderCard;
