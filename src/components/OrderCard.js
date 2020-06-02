import React from 'react';
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

export default function OrderCard(props) {
  const {
    orderNumber,
    userName,
    numberOfItems,
    totalAmount,
    orderId,
    userAddress,
    createdAt,
    index,
    ...otherProps
  } = props;

  // Card Title: User's Display Name,
  // Card Subtitle: Order Number
  // Card Body: User Address, Number of Items, Total Amount
  // Card Footer: Button Actions for Orders
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
          <Button success rounded>
            <Text>Accept</Text>
          </Button>
        </Right>
      </CardItem>
    </Card>
  );
}

OrderCard.defaultProps = {
  editable: false,
};
