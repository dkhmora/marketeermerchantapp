import React, {Component} from 'react';
import {Container, Card, CardItem, Left, Right, Body, Toast} from 'native-base';
import {Text, Button, Icon} from 'react-native-elements';
import {
  View,
  Platform,
  Linking,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import BaseHeader from '../components/BaseHeader';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import OrderItemListItem from '../components/OrderItemListItem';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';
import MapView, {Marker} from 'react-native-maps';

@inject('ordersStore')
@inject('detailsStore')
@observer
class OrderDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orderItems: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getOrderItems();

    this.props.navigation
      .dangerouslyGetParent()
      .setOptions({gestureEnabled: false});
  }

  componentWillUnmount() {
    this.props.navigation
      .dangerouslyGetParent()
      .setOptions({gestureEnabled: true});
  }

  onMapReady() {
    this.fitMarkers();

    this.customerMarker.showCallout();
  }

  fitMarkers() {
    const {order} = this.props.route.params;
    const {storeDetails} = this.props.detailsStore;

    this.map.fitToCoordinates(
      [
        {
          latitude: order.deliveryCoordinates.latitude,
          longitude: order.deliveryCoordinates.longitude,
        },
        {
          latitude: storeDetails.deliveryCoordinates.latitude,
          longitude: storeDetails.deliveryCoordinates.longitude,
        },
      ],
      {
        edgePadding: {left: 40, right: 40, top: 150, bottom: 150},
        animated: true,
      },
    );
  }

  async getOrderItems() {
    const {order} = this.props.route.params;
    const {getOrderItems} = this.props.ordersStore;

    this.setState(
      {
        orderItems: await getOrderItems(order.orderId),
      },
      () => {
        this.setState({loading: false});
      },
    );
  }

  openInMaps() {
    const {order} = this.props.route.params;

    if (order.deliveryCoordinates) {
      const markerName = `Customer ${order.userName}'s Location`;

      const latLng = `${order.deliveryCoordinates.latitude},${order.deliveryCoordinates.longitude}`;
      const url = Platform.select({
        ios: `http://maps.apple.com/?q=${markerName}&ll=${latLng}`,
        android: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
      });

      Linking.openURL(url);
    } else {
      Toast.show({
        text: 'Error, no user deliveryCoordinates found!',
        buttonText: 'Okay',
        type: 'danger',
        duration: 7000,
        style: {margin: 20, borderRadius: 16},
      });
    }
  }

  OrderItemsList(orderItems) {
    return (
      <View>
        {orderItems.map((item, index) => {
          return <OrderItemListItem item={item} key={index} />;
        })}
      </View>
    );
  }

  render() {
    const {order} = this.props.route.params;
    const {navigation} = this.props;
    const {orderItems, loading} = this.state;
    const {storeDetails} = this.props.detailsStore;

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
          title={`Order #${order.merchantOrderNumber} Details`}
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
                  {order.userName}
                </Text>
              </Right>
            </CardItem>

            <CardItem bordered>
              <Left>
                <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                  Customer Contact Number:
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
                  {order.userPhoneNumber}
                </Text>
              </Right>
            </CardItem>

            <CardItem>
              <Left>
                <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                  Delivery Address:
                </Text>
              </Left>
              <Right>
                {order.deliveryCoordinates ? (
                  <View style={{justifyContent: 'flex-end'}}>
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 16,
                        fontFamily: 'ProductSans-Bold',
                        textAlign: 'right',
                      }}>
                      {order.deliveryAddress}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 16,
                      fontFamily: 'ProductSans-Bold',
                      textAlign: 'right',
                    }}>
                    No user location details found. Please cancel this order.
                  </Text>
                )}
              </Right>
            </CardItem>

            <CardItem
              style={{
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
              }}>
              <View style={{flex: 1, borderRadius: 10, overflow: 'hidden'}}>
                <MapView
                  style={{
                    height: 300,
                    width: '100%',
                  }}
                  ref={(map) => {
                    this.map = map;
                  }}
                  onMapReady={() => this.onMapReady()}
                  showsUserLocation
                  initialRegion={{
                    latitude: order.deliveryCoordinates.latitude,
                    longitude: order.deliveryCoordinates.longitude,
                    latitudeDelta: 0.009,
                    longitudeDelta: 0.009,
                  }}>
                  {order.deliveryCoordinates.latitude &&
                    order.deliveryCoordinates.longitude && (
                      <Marker
                        ref={(marker) => {
                          this.customerMarker = marker;
                        }}
                        title="Customer Delivery Location"
                        tracksViewChanges={false}
                        coordinate={{
                          latitude: order.deliveryCoordinates.latitude,
                          longitude: order.deliveryCoordinates.longitude,
                        }}>
                        <View>
                          <Icon color={colors.accent} name="map-pin" />
                        </View>
                      </Marker>
                    )}

                  {storeDetails.deliveryCoordinates.latitude &&
                    storeDetails.deliveryCoordinates.longitude && (
                      <Marker
                        ref={(marker) => {
                          this.storeMarker = marker;
                        }}
                        title={`${storeDetails.storeName} Set Location`}
                        tracksViewChanges={false}
                        coordinate={{
                          latitude: storeDetails.deliveryCoordinates.latitude,
                          longitude: storeDetails.deliveryCoordinates.longitude,
                        }}>
                        <View>
                          <Icon color={colors.primary} name="map-pin" />
                        </View>
                      </Marker>
                    )}
                </MapView>
              </View>
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

            {loading ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : (
              this.OrderItemsList(orderItems)
            )}

            <CardItem bordered>
              <Left>
                <Text note>{order.quantity} items</Text>
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
                    ₱ {order.totalAmount}
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
                    ₱ {order.shippingPrice}130-200
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
                    ₱ {order.totalAmount + 130} - ₱ {order.totalAmount + 200}
                  </Text>
                </View>
              </Right>
            </CardItem>
          </Card>

          {order.orderStatus.cancelled.status && (
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
                    {order.orderStatus.cancelled.reason}
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
