import React, {Component} from 'react';
import {Card, CardItem, Left, Right, Body} from 'native-base';
import {Text, Icon, Button} from 'react-native-elements';
import {View, ActivityIndicator, SafeAreaView} from 'react-native';
import BaseHeader from '../components/BaseHeader';
import {ScrollView} from 'react-native-gesture-handler';
import OrderItemListItem from '../components/OrderItemListItem';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';
import MapView, {Marker} from 'react-native-maps';
import Toast from '../components/Toast';

@inject('ordersStore')
@inject('detailsStore')
@inject('authStore')
@observer
class OrderDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orderItems: [],
      loading: true,
      allowDragging: true,
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
          latitude: storeDetails.storeLocation.latitude,
          longitude: storeDetails.storeLocation.longitude,
        },
      ],
      {
        edgePadding: {left: 40, right: 40, top: 100, bottom: 100},
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

  handleChangeOrderStatus() {
    const {order} = this.props.route.params;

    this.props.authStore.appReady = false;

    this.props.ordersStore
      .setOrderStatus(order.orderId, order.merchantId)
      .then(() => {
        this.props.navigation.goBack();
      })
      .then(() => {
        this.props.authStore.appReady = true;

        Toast({
          text: `Successfully changed Order # ${order.merchantOrderNumber} status!`,
          type: 'success',
          duration: 3500,
        });
      });
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
    const {order, orderStatus} = this.props.route.params;
    const {navigation} = this.props;
    const {orderItems, loading} = this.state;
    const {storeDetails} = this.props.detailsStore;
    const buttonText =
      orderStatus[0] === 'PAID'
        ? 'SHIP'
        : orderStatus[0] === 'PENDING'
        ? 'ACCEPT'
        : orderStatus[0] === 'SHIPPED'
        ? 'COMPLETE'
        : null;

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title={`Order # ${order.merchantOrderNumber} | ${orderStatus}`}
          backButton
          options={['Cancel Order']}
          actions={[
            () => {
              this.props.ordersStore.cancelOrderModal = true;
              this.props.ordersStore.selectedOrder = order;
            },
          ]}
          navigation={navigation}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={this.state.allowDragging}
          style={{
            flex: 1,
            flexDirection: 'column',
            paddingHorizontal: 10,
          }}>
          <Card
            style={{
              borderRadius: 10,
              overflow: 'hidden',
            }}>
            <CardItem
              header
              bordered
              button
              onPress={() => {
                navigation.navigate('Order Chat', {
                  order,
                  orderStatus,
                });
              }}
              style={{
                backgroundColor: colors.primary,
                justifyContent: 'space-between',
              }}>
              <Text style={{color: colors.icons, fontSize: 20}}>
                Customer Details
              </Text>

              <View>
                <Icon name="message-square" color={colors.icons} />
                <Text style={{color: colors.icons}}>Chat</Text>
              </View>
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
                    color: colors.text_primary,
                    fontSize: 16,
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
                    color: colors.text_primary,
                    fontSize: 16,
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
                        color: colors.text_primary,
                        fontSize: 16,
                        textAlign: 'right',
                      }}>
                      {order.deliveryAddress}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      color: colors.text_primary,
                      fontSize: 16,
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
                  onTouchStart={() => this.setState({allowDragging: false})}
                  onTouchEnd={() => this.setState({allowDragging: true})}
                  onTouchCancel={() => this.setState({allowDragging: true})}
                  provider="google"
                  style={{
                    height: 300,
                    width: '100%',
                  }}
                  ref={(map) => {
                    this.map = map;
                  }}
                  onMapReady={() => this.onMapReady()}
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

                  {storeDetails.storeLocation.latitude &&
                    storeDetails.storeLocation.longitude && (
                      <Marker
                        ref={(marker) => {
                          this.storeMarker = marker;
                        }}
                        title={`${storeDetails.storeName} Set Location`}
                        tracksViewChanges={false}
                        coordinate={{
                          latitude: storeDetails.storeLocation.latitude,
                          longitude: storeDetails.storeLocation.longitude,
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

          <SafeAreaView>
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
                  Order Details
                </Text>
              </CardItem>

              <CardItem bordered>
                <Left>
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                    Order Status:
                  </Text>
                </Left>

                <Right>
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 16,
                      textAlign: 'right',
                    }}>
                    {orderStatus}
                  </Text>
                </Right>
              </CardItem>

              <CardItem bordered>
                <Left>
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                    Delivery Method:
                  </Text>
                </Left>

                <Right>
                  <Text
                    style={{
                      color: colors.text_primary,
                      fontSize: 16,
                      textAlign: 'right',
                    }}>
                    {order.deliveryMethod}
                  </Text>
                </Right>
              </CardItem>

              <CardItem bordered>
                <Left>
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                    Payment Method:
                  </Text>
                </Left>

                <Right>
                  <Text
                    style={{
                      color: colors.text_primary,
                      fontSize: 16,
                      textAlign: 'right',
                    }}>
                    {order.paymentMethod}
                  </Text>
                </Right>
              </CardItem>
            </Card>

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
                        color: colors.text_primary,
                        fontFamily: 'ProductSans-Black',
                      }}>
                      ₱ {order.subTotal}
                    </Text>
                  </View>

                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text
                      style={{
                        fontSize: 15,
                        color: colors.text_primary,
                        fontFamily: 'ProductSans-Light',
                      }}>
                      Delivery Price:{' '}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: colors.text_primary,
                        fontFamily: 'ProductSans-Black',
                      }}>
                      {order.deliveryPrice && order.deliveryPrice > 0
                        ? `₱${order.deliveryPrice}`
                        : order.deliveryPrice === null
                        ? '(Contact Merchant)'
                        : '₱0 (Free Delivery)'}
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
                        color: colors.text_primary,
                        fontFamily: 'ProductSans-Black',
                      }}>
                      ₱
                      {order.subTotal +
                        (order.deliveryPrice ? order.deliveryPrice : 0)}
                    </Text>
                  </View>
                </Right>
              </CardItem>
            </Card>

            {buttonText && (
              <Button
                onPress={() => this.handleChangeOrderStatus()}
                title={buttonText}
                titleStyle={{color: colors.icons}}
                containerStyle={{
                  borderRadius: 24,
                  marginTop: 10,
                  height: 50,
                }}
                buttonStyle={{height: 50, backgroundColor: colors.accent}}
              />
            )}

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
          </SafeAreaView>
        </ScrollView>
      </View>
    );
  }
}

export default OrderDetailsScreen;
