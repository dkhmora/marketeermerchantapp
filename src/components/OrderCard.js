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
          <Right>
            <Button transparent>
              <OptionsMenu
                customButton={
                  <Icon
                    active
                    name="dots-three-vertical"
                    type="Entypo"
                    style={{color: '#fff'}}
                  />
                }
                destructiveIndex={1}
                options={['Cancel Order']}
                actions={[]}
              />
            </Button>
          </Right>
        </CardItem>
        <CardItem bordered>
          <Left>
            <Text>User Address:</Text>
          </Left>
          <Right>
            <Text>{userAddress}</Text>
          </Right>
        </CardItem>
        <CardItem bordered>
          <Left>
            <Text>Number of Items:</Text>
          </Left>
          <Right>
            <Text>{numberOfItems}</Text>
          </Right>
        </CardItem>
        <CardItem bordered>
          <Left>
            <Text>Total Amount:</Text>
          </Left>
          <Right>
            <Text>{totalAmount}</Text>
          </Right>
        </CardItem>
        <CardItem>
          <Body>
            <Button full bordered rounded>
              <Text>View Order Items</Text>
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
