import React, {Component} from 'react';
import {Container, Card, CardItem, Text, Left, Right} from 'native-base';
import {View} from 'react-native';
import BaseHeader from '../components/BaseHeader';
import {FlatList} from 'react-native-gesture-handler';
import OrderItemCard from '../components/OrderItemCard';

class OrderDetailsScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      orderId,
      orderItems,
      userName,
      orderNumber,
      numberOfItems,
      shippingPrice,
      totalAmount,
      userAddress,
      createdAt,
    } = this.props.route.params;
    const {navigation} = this.props;

    console.log(orderItems);

    const actions = [
      {
        name: 'Accept Order',
        action: 'navigation.navigate("Order List")',
      },
    ];

    return (
      <Container>
        <BaseHeader
          title={`Order #${orderNumber} Details`}
          backButton
          optionsButton
          actions={actions}
          navigation={navigation}
        />

        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            marginHorizontal: 6,
            marginVertical: 3,
          }}>
          <Card
            style={{
              borderRadius: 16,
              overflow: 'hidden',
            }}>
            <CardItem header bordered style={{backgroundColor: '#E91E63'}}>
              <Text style={{color: '#fff'}}>Order Items</Text>
            </CardItem>
            <FlatList
              data={orderItems}
              renderItem={({item, index}) => (
                <OrderItemCard
                  name={item.name}
                  image={item.image}
                  price={item.price}
                  unit={item.unit}
                  quantity={item.quantity}
                  createdAt={item.createdAt}
                  key={index}
                />
              )}
              keyExtractor={(item, index) => `${item.name}${index.toString()}`}
              showsVerticalScrollIndicator={false}
            />
            <CardItem bordered>
              <Left>
                <Text note>{numberOfItems} items</Text>
              </Left>
              <Right>
                <Text>Subtotal: ₱{totalAmount}</Text>
                <Text>Shipping Price: ₱{shippingPrice}</Text>
              </Right>
            </CardItem>
            <CardItem footer bordered>
              <Left />
              <Right>
                <Text>Order Total: ₱{totalAmount + shippingPrice}</Text>
              </Right>
            </CardItem>
          </Card>
        </View>
      </Container>
    );
  }
}

export default OrderDetailsScreen;
