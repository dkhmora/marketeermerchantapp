import React, {Component} from 'react';
import {Container, Card, CardItem, Left, Right, Body, Toast} from 'native-base';
import {Text, Button, Icon} from 'react-native-elements';
import {View, Platform, Linking} from 'react-native';
import BaseHeader from '../components/BaseHeader';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import OrderItemCard from '../components/OrderItemCard';
import {colors} from '../../assets/colors';

class OrderDetailsScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.navigation
      .dangerouslyGetParent()
      .setOptions({gestureEnabled: false});
  }

  componentWillUnmount() {
    this.props.navigation
      .dangerouslyGetParent()
      .setOptions({gestureEnabled: true});
  }

  openInMaps() {
    const {coordinates, userName} = this.props.route.params;

    if (coordinates) {
      const markerName = `Customer ${userName}'s Location`;

      const latLng = `${coordinates._latitude},${coordinates._longitude}`;
      const url = Platform.select({
        ios: `http://maps.apple.com/?q=${markerName}&ll=${latLng}`,
        android: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
      });

      Linking.openURL(url);
    } else {
      Toast.show({
        text: 'Error, no user coordinates found!',
        buttonText: 'Okay',
        type: 'danger',
        duration: 7000,
        style: {margin: 20, borderRadius: 16},
      });
    }
  }

  render() {
    const {
      coordinates,
      orderId,
      orderItems,
      userName,
      orderNumber,
      orderStatus,
      quantity,
      shippingPrice,
      totalAmount,
      userAddress,
      createdAt,
    } = this.props.route.params;
    const {navigation} = this.props;

    const mapButtonText =
      Platform.OS === 'ios' ? 'Open in Apple Maps' : 'Open in Google Maps';

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            flex: 1,
            flexDirection: 'column',
            marginHorizontal: 6,
            marginVertical: 3,
          }}>
          <Card
            style={{
              borderRadius: 10,
              overflow: 'hidden',
            }}>
            <CardItem header bordered style={{backgroundColor: colors.primary}}>
              <Text style={{color: colors.icons, fontSize: 20}}>
                Customer Details
              </Text>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                  Customer Name:
                </Text>
              </Left>

              <Right>
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 16,
                    fontFamily: 'ProductSans-Bold',
                    textAlign: 'right',
                  }}>
                  {userName}
                </Text>
              </Right>
            </CardItem>

            <CardItem bordered>
              <Left>
                <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                  User Address:
                </Text>
              </Left>
              <Right>
                {coordinates ? (
                  <View style={{justifyContent: 'flex-end'}}>
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 16,
                        fontFamily: 'ProductSans-Bold',
                        textAlign: 'right',
                      }}>
                      {userAddress}
                    </Text>

                    <Text
                      note
                      style={{
                        color: colors.text_secondary,
                        fontSize: 14,
                        textAlign: 'right',
                      }}>
                      {coordinates._latitude}, {coordinates._longitude}
                    </Text>

                    <Button
                      title={mapButtonText}
                      titleStyle={{color: colors.icons, paddingRight: 5}}
                      icon={<Icon name="map" color={colors.icons} />}
                      iconRight
                      full
                      bordered
                      onPress={() => this.openInMaps()}
                      style={{borderRadius: 24}}
                    />
                  </View>
                ) : (
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 16,
                      fontFamily: 'ProductSans-Bold',
                      textAlign: 'right',
                    }}>
                    No user coordinates found
                  </Text>
                )}
              </Right>
            </CardItem>
          </Card>

          <Card
            style={{
              borderRadius: 10,
              overflow: 'hidden',
            }}>
            <CardItem header bordered style={{backgroundColor: colors.primary}}>
              <Text style={{color: colors.icons, fontSize: 20}}>
                Order Items
              </Text>
            </CardItem>

            <FlatList
              data={orderItems}
              renderItem={({item, index}) => (
                <OrderItemCard item={item} key={index} />
              )}
              keyExtractor={(item, index) => `${item.name}${index.toString()}`}
              showsVerticalScrollIndicator={false}
            />

            <CardItem bordered>
              <Left>
                <Text note>{quantity} items</Text>
              </Left>
              <Right>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: colors.text_primary,
                      fontFamily: 'ProductSans-Light',
                    }}>
                    Subtotal:{' '}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: colors.primary,
                      fontFamily: 'ProductSans-Black',
                    }}>
                    ₱{totalAmount}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: colors.text_primary,
                      fontFamily: 'ProductSans-Light',
                    }}>
                    Estimated Shipping Price:{' '}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: colors.primary,
                      fontFamily: 'ProductSans-Black',
                    }}>
                    ₱{shippingPrice}130-200
                  </Text>
                </View>
              </Right>
            </CardItem>

            <CardItem footer bordered>
              <Left />

              <Right>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: colors.text_primary,
                      fontFamily: 'ProductSans-Light',
                    }}>
                    Order Total:{' '}
                  </Text>

                  <Text
                    style={{
                      fontSize: 18,
                      color: colors.primary,
                      fontFamily: 'ProductSans-Black',
                    }}>
                    ₱{totalAmount + 130} - ₱{totalAmount + 200}
                  </Text>
                </View>
              </Right>
            </CardItem>
          </Card>

          {orderStatus.cancelled.status && (
            <Card
              style={{
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              <CardItem
                header
                bordered
                style={{backgroundColor: colors.primary}}>
                <Text style={{color: colors.icons, fontSize: 20}}>
                  Reason for Cancellation
                </Text>
              </CardItem>
              <CardItem>
                <Body>
                  <Text style={{width: '100%', textAlign: 'justify'}}>
                    {orderStatus.cancelled.reason}
                  </Text>
                </Body>
              </CardItem>
            </Card>
          )}
        </ScrollView>
      </Container>
    );
  }
}

export default OrderDetailsScreen;
