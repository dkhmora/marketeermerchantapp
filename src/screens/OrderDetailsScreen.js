import React, {Component} from 'react';
import {Card, CardItem, Left, Right, Body} from 'native-base';
import {Text, Icon, Button} from 'react-native-elements';
import {
  View,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import BaseHeader from '../components/BaseHeader';
import {ScrollView} from 'react-native-gesture-handler';
import OrderItemListItem from '../components/OrderItemListItem';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';
import MapView, {Marker} from 'react-native-maps';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import {computed} from 'mobx';
import crashlytics from '@react-native-firebase/crashlytics';
import BottomSheet from 'reanimated-bottom-sheet';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
      changeOrderStatusModal: false,
    };
  }

  @computed get orderStatus() {
    const {selectedOrder} = this.props.ordersStore;

    if (selectedOrder) {
      const statusLabel = Object.entries(selectedOrder.orderStatus).map(
        ([key, value]) => {
          if (value.status) {
            return key.toUpperCase();
          }

          return;
        },
      );

      return statusLabel.filter((item) => item != null);
    }

    return 'Unknown';
  }

  componentDidMount() {
    const {orderId} = this.props.route.params;

    if (orderId) {
      this.getOrderItems();
      this.props.ordersStore.getOrder(orderId);
    }

    crashlytics().log('OrderDetailsScreen');
  }

  componentWillUnmount() {
    this.props.ordersStore.unsubscribeGetOrder &&
      this.props.ordersStore.unsubscribeGetOrder();

    this.props.ordersStore.selectedOrder = null;
    this.props.ordersStore.orderMessages = null;
  }

  onMapReady() {
    this.fitMarkers();

    this.customerMarker.showCallout();
  }

  fitMarkers() {
    const {selectedOrder} = this.props.ordersStore;
    const {storeDetails} = this.props.detailsStore;

    this.map.fitToCoordinates(
      [
        {
          latitude: selectedOrder.deliveryCoordinates.latitude,
          longitude: selectedOrder.deliveryCoordinates.longitude,
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
    const {orderId} = this.props.route.params;
    const {getOrderItems} = this.props.ordersStore;

    this.setState(
      {
        orderItems: await getOrderItems(orderId),
      },
      () => {
        this.setState({loading: false});
      },
    );
  }

  handleChangeOrderStatus() {
    const {selectedOrder} = this.props.ordersStore;
    const {orderId} = this.props.route.params;
    const {storeDetails} = this.props.detailsStore;

    if (selectedOrder.deliveryMethod !== 'Mr. Speedy') {
      this.props.authStore.appReady = false;

      this.props.ordersStore
        .setOrderStatus(orderId, selectedOrder.storeId, storeDetails.merchantId)
        .then((response) => {
          this.props.authStore.appReady = true;

          if (response.data.s === 200) {
            return Toast({
              text: response.data.m,
              type: 'success',
              duration: 3500,
            });
          }

          return Toast({
            text: response.data.m,
            type: 'danger',
            duration: 3500,
          });
        });
    } else {
      this.sheetRef.snapTo(1);
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
    const {selectedOrder} = this.props.ordersStore;
    const {orderId} = this.props.route.params;

    const {orderStatus} = this;
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
          centerComponent={
            !selectedOrder ? (
              <ActivityIndicator color={colors.icons} size="small" />
            ) : (
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{fontSize: 20, color: colors.icons}}>
                {`Order # ${selectedOrder.storeOrderNumber} | ${orderStatus}`}
              </Text>
            )
          }
          backButton
          options={orderStatus[0] === 'PENDING' ? ['Cancel Order'] : null}
          actions={[
            () => {
              this.props.ordersStore.cancelOrderModal = true;
              this.props.ordersStore.selectedCancelOrder = selectedOrder;
            },
          ]}
          navigation={navigation}
        />

        {selectedOrder && orderId ? (
          <View style={{flex: 1}}>
            <ConfirmationModal
              isVisible={this.state.changeOrderStatusModal}
              title={`${buttonText} Order # ${selectedOrder.storeOrderNumber}?`}
              body={`Are you sure you want to ${buttonText} Order # ${selectedOrder.storeOrderNumber}?`}
              onConfirm={() => {
                this.setState({changeOrderStatusModal: false}, () => {
                  this.handleChangeOrderStatus();
                });
              }}
              closeModal={() => this.setState({changeOrderStatusModal: false})}
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
                      orderId,
                      data: true,
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
                    <Text
                      style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
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
                      {selectedOrder.userName}
                    </Text>
                  </Right>
                </CardItem>

                <CardItem bordered>
                  <Left>
                    <Text
                      style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
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
                      {selectedOrder.userPhoneNumber}
                    </Text>
                  </Right>
                </CardItem>

                <CardItem>
                  <Left>
                    <Text
                      style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                      Delivery Address:
                    </Text>
                  </Left>
                  <Right>
                    {selectedOrder.deliveryCoordinates ? (
                      <View style={{justifyContent: 'flex-end'}}>
                        <Text
                          style={{
                            color: colors.text_primary,
                            fontSize: 16,
                            textAlign: 'right',
                          }}>
                          {selectedOrder.deliveryAddress}
                        </Text>
                      </View>
                    ) : (
                      <Text
                        style={{
                          color: colors.text_primary,
                          fontSize: 16,
                          textAlign: 'right',
                        }}>
                        No user location details found. Please cancel this
                        order.
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
                        latitude: selectedOrder.deliveryCoordinates.latitude,
                        longitude: selectedOrder.deliveryCoordinates.longitude,
                        latitudeDelta: 0.009,
                        longitudeDelta: 0.009,
                      }}>
                      {selectedOrder.deliveryCoordinates.latitude &&
                        selectedOrder.deliveryCoordinates.longitude && (
                          <Marker
                            ref={(marker) => {
                              this.customerMarker = marker;
                            }}
                            title="Customer Delivery Location"
                            tracksViewChanges={false}
                            coordinate={{
                              latitude:
                                selectedOrder.deliveryCoordinates.latitude,
                              longitude:
                                selectedOrder.deliveryCoordinates.longitude,
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
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'ProductSans-Bold',
                        }}>
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
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'ProductSans-Bold',
                        }}>
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
                        {selectedOrder.deliveryMethod}
                      </Text>
                    </Right>
                  </CardItem>

                  <CardItem bordered>
                    <Left>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'ProductSans-Bold',
                        }}>
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
                        {selectedOrder.paymentMethod}
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
                      <Text note>{selectedOrder.quantity} items</Text>
                    </Left>
                    <Right>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
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
                          ₱ {selectedOrder.subTotal}
                        </Text>
                      </View>

                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
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
                          {selectedOrder.deliveryPrice &&
                          selectedOrder.deliveryPrice > 0
                            ? `₱${selectedOrder.deliveryPrice}`
                            : selectedOrder.deliveryPrice === null
                            ? '(Contact Merchant)'
                            : '₱0 (Free Delivery)'}
                        </Text>
                      </View>
                    </Right>
                  </CardItem>

                  <CardItem footer bordered>
                    <Left />

                    <Right>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
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
                          {selectedOrder.subTotal +
                            (selectedOrder.deliveryPrice
                              ? selectedOrder.deliveryPrice
                              : 0)}
                        </Text>
                      </View>
                    </Right>
                  </CardItem>
                </Card>

                {buttonText && (
                  <Button
                    onPress={() =>
                      this.setState({changeOrderStatusModal: true})
                    }
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

                {selectedOrder.orderStatus.cancelled.status && (
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
                          {selectedOrder.orderStatus.cancelled.reason}
                        </Text>
                      </Body>
                    </CardItem>
                  </Card>
                )}
              </SafeAreaView>
            </ScrollView>

            <BottomSheet
              ref={(sheetRef) => (this.sheetRef = sheetRef)}
              snapPoints={[0, SCREEN_HEIGHT * 0.5]}
              borderRadius={30}
              initialSnap={0}
              renderContent={() => (
                <View
                  style={{
                    backgroundColor: colors.icons,
                    borderTopWidth: 0.7,
                    borderRightWidth: 0.7,
                    borderLeftWidth: 0.7,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    borderTopColor: colors.text_secondary,
                    height: SCREEN_HEIGHT * 0.95,
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../../assets/images/mrspeedy_logo.png')}
                    style={{
                      height: 50,
                      width: 100,
                      resizeMode: 'contain',
                    }}
                  />
                </View>
              )}
            />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.icons,
            }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    );
  }
}

export default OrderDetailsScreen;
