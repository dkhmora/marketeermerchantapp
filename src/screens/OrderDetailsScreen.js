import React, {Component} from 'react';
import {Card, CardItem, Left, Right, Body} from 'native-base';
import {Text, Icon, Button, Avatar} from 'react-native-elements';
import {
  View,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import BaseHeader from '../components/BaseHeader';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import OrderItemListItem from '../components/OrderItemListItem';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import {computed} from 'mobx';
import crashlytics from '@react-native-firebase/crashlytics';
import MapCardItem from '../components/MapCardItem';
import CardItemHeader from '../components/CardItemHeader';
import MrSpeedyBottomSheet from '../components/MrSpeedyBottomSheet';
import moment from 'moment';

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
      cancelMrspeedyBookingModal: false,
      courierCoordinates: null,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.ordersStore.selectedOrder &&
      this.props.ordersStore.selectedOrder.deliveryMethod === 'Mr. Speedy' &&
      this.props.ordersStore.selectedOrder.mrspeedyBookingData &&
      this.props.ordersStore.selectedOrder.mrspeedyBookingData.order
    ) {
      if (
        this.props.ordersStore.selectedOrder.mrspeedyBookingData.order
          .status === 'active' &&
        !this.props.ordersStore.getCourierInterval
      ) {
        this.props.ordersStore.clearGetCourierInterval();

        this.setCourierInfo();

        this.props.ordersStore.getCourierInterval = setInterval(() => {
          this.setCourierInfo();
        }, 10000);
      }
    } else {
      this.props.ordersStore.clearGetCourierInterval();
    }
  }

  componentDidMount() {
    this.props.ordersStore.clearGetCourierInterval();
  }

  setCourierInfo() {
    if (
      this.props.ordersStore.selectedOrder &&
      this.props.ordersStore.selectedOrder.deliveryMethod === 'Mr. Speedy' &&
      this.props.ordersStore.selectedOrder.mrspeedyBookingData &&
      this.props.ordersStore.selectedOrder.mrspeedyBookingData.order &&
      this.props.ordersStore.selectedOrder.mrspeedyBookingData.order.status ===
        'active'
    ) {
      this.props.ordersStore
        .getMrSpeedyCourierInfo(
          this.props.ordersStore.selectedOrder.mrspeedyBookingData.order
            .order_id,
        )
        .then((response) => {
          if (response.s === 200) {
            const courierInfo = response.d;

            if (courierInfo && courierInfo.latitude && courierInfo.longitude) {
              const courierCoordinates = {
                latitude: Number(courierInfo.latitude),
                longitude: Number(courierInfo.longitude),
              };

              this.setState({courierCoordinates});
            }
          }
        });
    }
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

  @computed get mrspeedyVehicleType() {
    const {selectedOrder} = this.props.ordersStore;

    if (selectedOrder.mrspeedyBookingData) {
      return selectedOrder.mrspeedyBookingData.order.vehicle_type_id === 8
        ? 'Motorbike'
        : 'Car';
    }

    return null;
  }

  @computed get mrspeedyOrderStatus() {
    const {selectedOrder} = this.props.ordersStore;

    if (
      selectedOrder.mrspeedyBookingData &&
      selectedOrder.mrspeedyBookingData.order
    ) {
      const {status} = selectedOrder.mrspeedyBookingData.order;

      switch (status) {
        case 'new':
          return 'Newly created order, waiting for verification from our dispatchers.';
        case 'available':
          return 'Order was verified and is available for couriers.';
        case 'active':
          return 'A courier was assigned and is working on the order.';
        case 'completed':
          return 'Order is completed.';
        case 'canceled':
          return 'Order was canceled.';
        case 'delayed':
          return 'Order execution was delayed by a dispatcher.';
        case 'reactivated':
          return 'Order was reactivated and is again available for couriers.';

        default:
          return status.toUpperCase();
      }
    }

    return null;
  }

  @computed get deliveryPriceText() {
    const {selectedOrder} = this.props.ordersStore;

    if (selectedOrder) {
      const {
        deliveryPrice,
        deliveryMethod,
        mrspeedyBookingData,
      } = selectedOrder;

      if (deliveryPrice && deliveryPrice > 0) {
        if (deliveryPrice > 0) {
          return `₱${selectedOrder.deliveryPrice}`;
        }

        return '₱0';
      }

      if (deliveryMethod === 'Mr. Speedy') {
        if (mrspeedyBookingData && mrspeedyBookingData.estimatedOrderPrices) {
          return `₱${mrspeedyBookingData.estimatedOrderPrices.motorbike} - ₱${mrspeedyBookingData.estimatedOrderPrices.car}`;
        }

        return 'To be determined once order is shipped';
      }
    }

    return 'N/A';
  }

  @computed get orderTotalText() {
    const {selectedOrder} = this.props.ordersStore;

    if (selectedOrder) {
      const {
        deliveryPrice,
        deliveryMethod,
        mrspeedyBookingData,
        subTotal,
      } = selectedOrder;

      if (deliveryPrice) {
        if (deliveryPrice > 0) {
          return `₱${(subTotal + deliveryPrice).toFixed(2)}`;
        }
      }

      if (deliveryMethod === 'Mr. Speedy') {
        if (mrspeedyBookingData) {
          const {estimatedOrderPrices} = mrspeedyBookingData;

          if (estimatedOrderPrices) {
            return `₱${(subTotal + estimatedOrderPrices.motorbike).toFixed(
              2,
            )} - ₱${(subTotal + estimatedOrderPrices.car).toFixed(2)}`;
          }
        }

        return 'To be determined once order is shipped';
      }
    }

    return 'N/A';
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

  cancelMrspeedyBooking() {
    this.props.authStore.appReady = false;

    const {orderId} = this.props.route.params;

    this.props.ordersStore.cancelMrspeedyBooking(orderId).then((response) => {
      if (response.s === 200) {
        Toast({text: response.m});
      } else {
        Toast({text: response.m, type: 'danger'});
      }

      this.props.authStore.appReady = true;
    });
  }

  handleChangeOrderStatus() {
    this.props.authStore.appReady = false;

    const {selectedOrder} = this.props.ordersStore;
    const {orderId} = this.props.route.params;
    const {storeDetails} = this.props.detailsStore;
    const {
      selectedVehicleIndex,
      selectedWeightIndex,
      motobox,
      storePhoneNumber,
    } = this.state;
    const vehicleType = selectedVehicleIndex === 0 ? 8 : 7;
    let orderWeight =
      selectedWeightIndex === 0 ? 299 : selectedWeightIndex === 1 ? 499 : 699;
    if (selectedVehicleIndex === 0) {
      orderWeight =
        selectedWeightIndex === 0
          ? 1
          : selectedWeightIndex === 1
          ? 4
          : selectedWeightIndex === 2
          ? 9
          : selectedWeightIndex === 3
          ? 14
          : 19;
    }

    const formattedPhoneNubmer = `+63${storePhoneNumber}`;

    const mrspeedyBookingData = {
      vehicleType,
      motobox,
      orderWeight,
      storePhoneNumber: formattedPhoneNubmer,
    };

    this.props.ordersStore
      .setOrderStatus(
        orderId,
        selectedOrder.storeId,
        storeDetails.merchantId,
        mrspeedyBookingData,
      )
      .then((response) => {
        this.props.authStore.appReady = true;

        if (response.data.s === 200) {
          this.props.ordersStore.mrspeedyBottomSheet &&
            this.props.ordersStore.mrspeedyBottomSheet.snapTo(0);

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
    const {orderItems, loading, courierCoordinates} = this.state;
    const buttonText =
      orderStatus[0] === 'PAID'
        ? 'SHIP'
        : orderStatus[0] === 'PENDING'
        ? 'ACCEPT'
        : orderStatus[0] === 'SHIPPED'
        ? 'COMPLETE'
        : null;

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (this.mrspeedyBottomSheet.state.openRatio > 0) {
            this.mrspeedyBottomSheet.bottomSheet.snapTo(0);
          }
        }}>
        <View style={{height: SCREEN_HEIGHT + StatusBar.currentHeight}}>
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
                closeModal={() =>
                  this.setState({changeOrderStatusModal: false})
                }
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
                  <CardItemHeader
                    title={
                      <View
                        style={{
                          flexDirection: 'row',
                          flex: 1,
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <Text style={{color: colors.primary, fontSize: 20}}>
                          Customer Details
                        </Text>

                        <View>
                          <Icon name="message-square" color={colors.primary} />
                          <Text style={{color: colors.primary}}>Chat</Text>
                        </View>
                      </View>
                    }
                    onPress={() =>
                      navigation.navigate('Order Chat', {
                        orderId,
                        data: true,
                      })
                    }
                    activeOpacity={0.8}
                  />

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

                  {!selectedOrder.mrspeedyBookingData && (
                    <MapCardItem
                      onTouchStart={() => this.setState({allowDragging: false})}
                      onTouchEnd={() => this.setState({allowDragging: true})}
                      onTouchCancel={() => this.setState({allowDragging: true})}
                    />
                  )}
                </Card>

                <SafeAreaView>
                  <Card
                    style={{
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}>
                    <CardItemHeader title="Order Details" />

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

                  {selectedOrder.mrspeedyBookingData &&
                    selectedOrder.mrspeedyBookingData.order && (
                      <Card
                        style={{
                          borderRadius: 10,
                          overflow: 'hidden',
                        }}>
                        <ConfirmationModal
                          isVisible={this.state.cancelMrspeedyBookingModal}
                          title="Are you sure?"
                          body={`Do you want to cancel the current Mr. Speedy booking for Order #${selectedOrder.storeOrderNumber}?`}
                          onConfirm={() => {
                            this.setState(
                              {cancelMrspeedyBookingModal: false},
                              () => {
                                this.cancelMrspeedyBooking();
                              },
                            );
                          }}
                          closeModal={() =>
                            this.setState({cancelMrspeedyBookingModal: false})
                          }
                        />

                        <CardItemHeader
                          title={
                            <View
                              style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}>
                              <Image
                                source={require('../../assets/images/mrspeedy-logo.png')}
                                style={{
                                  height: 50,
                                  width: 100,
                                  resizeMode: 'contain',
                                }}
                              />

                              {selectedOrder.mrspeedyBookingData.order
                                .status === 'new' ||
                                selectedOrder.mrspeedyBookingData.order
                                  .status === 'available' ||
                                selectedOrder.mrspeedyBookingData.order
                                  .status === 'active' ||
                                selectedOrder.mrspeedyBookingData.order
                                  .status === 'delayed'}
                              <Button
                                title="Cancel Booking"
                                type="clear"
                                onPress={() =>
                                  this.setState({
                                    cancelMrspeedyBookingModal: true,
                                  })
                                }
                              />
                            </View>
                          }
                        />

                        <CardItem bordered>
                          <Left>
                            <Text
                              style={{
                                fontSize: 16,
                                fontFamily: 'ProductSans-Bold',
                              }}>
                              Status:
                            </Text>
                          </Left>

                          <Right>
                            <Text
                              style={{
                                color: colors.primary,
                                fontSize: 16,
                                textAlign: 'right',
                              }}>
                              {this.mrspeedyOrderStatus}
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
                              Status Description:
                            </Text>
                          </Left>

                          <Right>
                            <Text
                              style={{
                                color: colors.text_primary,
                                fontSize: 16,
                                textAlign: 'right',
                              }}>
                              {
                                selectedOrder.mrspeedyBookingData.order
                                  .status_description
                              }
                            </Text>
                          </Right>
                        </CardItem>

                        {selectedOrder.mrspeedyBookingData.order.courier && (
                          <View>
                            <CardItem bordered>
                              <Text
                                style={{
                                  flex: 1,
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Courier Name:
                              </Text>

                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'flex-end',
                                  alignItems: 'center',
                                }}>
                                {selectedOrder.mrspeedyBookingData.order.courier
                                  .photo_url && (
                                  <Avatar
                                    rounded
                                    size="medium"
                                    source={{
                                      uri:
                                        selectedOrder.mrspeedyBookingData.order
                                          .courier.photo_url,
                                    }}
                                  />
                                )}

                                <Text
                                  style={{
                                    color: colors.text_primary,
                                    fontSize: 16,
                                    textAlign: 'right',
                                    marginLeft: 10,
                                  }}>
                                  {`${selectedOrder.mrspeedyBookingData.order.courier.name} ${selectedOrder.mrspeedyBookingData.order.courier.surname}`}
                                </Text>
                              </View>
                            </CardItem>

                            <CardItem bordered>
                              <Left>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontFamily: 'ProductSans-Bold',
                                  }}>
                                  Courier Phone Number:
                                </Text>
                              </Left>

                              <Right>
                                <Text
                                  style={{
                                    color: colors.text_primary,
                                    fontSize: 16,
                                    textAlign: 'right',
                                  }}>
                                  +
                                  {
                                    selectedOrder.mrspeedyBookingData.order
                                      .courier.phone
                                  }
                                </Text>
                              </Right>
                            </CardItem>
                          </View>
                        )}

                        <CardItem bordered>
                          <Left>
                            <Text
                              style={{
                                fontSize: 16,
                                fontFamily: 'ProductSans-Bold',
                              }}>
                              Courier Vehicle:
                            </Text>
                          </Left>

                          <Right>
                            <Text
                              style={{
                                color: colors.text_primary,
                                fontSize: 16,
                                textAlign: 'right',
                              }}>
                              {this.mrspeedyVehicleType}
                            </Text>
                          </Right>
                        </CardItem>

                        <MapCardItem
                          onTouchStart={() =>
                            this.setState({allowDragging: false})
                          }
                          onTouchEnd={() =>
                            this.setState({allowDragging: true})
                          }
                          onTouchCancel={() =>
                            this.setState({allowDragging: true})
                          }
                          vehicleType={this.mrspeedyVehicleType}
                          courierCoordinates={courierCoordinates}
                        />
                      </Card>
                    )}

                  <Card
                    style={{
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}>
                    <CardItemHeader title="Order Items" />

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
                            {'Subtotal: '}
                          </Text>
                          <Text
                            style={{
                              fontSize: 18,
                              color: colors.text_primary,
                              fontFamily: 'ProductSans-Black',
                            }}>
                            {`₱${selectedOrder.subTotal.toFixed(2)}`}
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
                            {'Delivery Price: '}
                          </Text>
                          <Text
                            style={{
                              fontSize: 18,
                              color: colors.text_primary,
                              fontFamily: 'ProductSans-Black',
                              textAlign: 'right',
                            }}>
                            {this.deliveryPriceText}
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
                            {'Order Total: '}
                          </Text>

                          <Text
                            style={{
                              fontSize: 18,
                              color: colors.text_primary,
                              fontFamily: 'ProductSans-Black',
                              textAlign: 'right',
                            }}>
                            {this.orderTotalText}
                          </Text>
                        </View>
                      </Right>
                    </CardItem>
                  </Card>

                  {buttonText &&
                    !(
                      buttonText === 'COMPLETE' &&
                      selectedOrder.deliveryMethod === 'Mr. Speedy'
                    ) && (
                      <Button
                        onPress={() => {
                          if (
                            (selectedOrder.deliveryMethod === 'Mr. Speedy' &&
                              selectedOrder.paymentMethod === 'COD' &&
                              selectedOrder.orderStatus.paid.status) ||
                            (selectedOrder.deliveryMethod === 'Mr. Speedy' &&
                              selectedOrder.paymentMethod ===
                                'Online Banking' &&
                              selectedOrder.orderStatus.pending.status)
                          ) {
                            this.mrspeedyBottomSheet.bottomSheet &&
                              this.mrspeedyBottomSheet.bottomSheet.snapTo(1);
                            this.mrspeedyBottomSheet.getMrspeedyOrderPriceEstimate();
                          } else {
                            this.setState({changeOrderStatusModal: true});
                          }
                        }}
                        title={buttonText}
                        titleStyle={{color: colors.icons}}
                        containerStyle={{
                          borderRadius: 24,
                          marginTop: 10,
                          height: 50,
                        }}
                        buttonStyle={{
                          height: 50,
                          backgroundColor: colors.accent,
                        }}
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

              <MrSpeedyBottomSheet
                ref={(mrspeedyBottomSheet) =>
                  (this.mrspeedyBottomSheet = mrspeedyBottomSheet)
                }
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
      </TouchableWithoutFeedback>
    );
  }
}

export default OrderDetailsScreen;
