import React, {Component} from 'react';
import {Card, CardItem, Left, Right, Body} from 'native-base';
import {Text, Icon, Button, ButtonGroup, ListItem} from 'react-native-elements';
import {
  View,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import BaseHeader from '../components/BaseHeader';
import {
  ScrollView,
  Switch,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import OrderItemListItem from '../components/OrderItemListItem';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';
import MapView, {Marker} from 'react-native-maps';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import {computed} from 'mobx';
import crashlytics from '@react-native-firebase/crashlytics';
import BottomSheet from 'reanimated-bottom-sheet';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import MapCardItem from '../components/MapCardItem';
import CardItemHeader from '../components/CardItemHeader';
import MrSpeedyBottomSheet from '../components/MrSpeedyBottomSheet';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

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

    if (selectedOrder.mrspeedyBookingData) {
      const {status} = selectedOrder.mrspeedyBookingData.order;

      switch (status) {
        case 'new':
          return 'Awaiting Verification';

        case 'available':
          return 'Available for Couriers';

        case 'reactivated':
          return 'yes';

        default:
          return status.toUpperCase();
      }
    }

    return null;
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
    const {orderItems, loading} = this.state;
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

                  {selectedOrder.mrspeedyBookingData && (
                    <Card
                      style={{
                        borderRadius: 10,
                        overflow: 'hidden',
                      }}>
                      <CardItemHeader
                        title={
                          <Image
                            source={require('../../assets/images/mrspeedy-logo.png')}
                            style={{
                              height: 50,
                              width: 100,
                              resizeMode: 'contain',
                            }}
                          />
                        }
                      />

                      <CardItem bordered>
                        <Left>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'ProductSans-Bold',
                            }}>
                            Delivery Status:
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

                      {selectedOrder.mrspeedyBookingData.order.courier && (
                        <View>
                          <CardItem bordered>
                            <Left>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Courier Name:
                              </Text>
                            </Left>

                            <Right>
                              <Text
                                style={{
                                  color: colors.text_primary,
                                  fontSize: 16,
                                  textAlign: 'right',
                                }}>
                                {`${selectedOrder.mrspeedyBookingData.order.courier.name} ${selectedOrder.mrspeedyBookingData.order.courier.surname}`}
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
                        onTouchEnd={() => this.setState({allowDragging: true})}
                        onTouchCancel={() =>
                          this.setState({allowDragging: true})
                        }
                        courierCoordinates={
                          selectedOrder.mrspeedyBookingData.order.courier
                            ? {
                                latitude: Number(
                                  selectedOrder.mrspeedyBookingData.order
                                    .courier.latitude,
                                ),
                                longitude: Number(
                                  selectedOrder.mrspeedyBookingData.order
                                    .courier.longitude,
                                ),
                              }
                            : null
                        }
                        vehicleType={this.mrspeedyVehicleType}
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
                            Subtotal:
                          </Text>
                          <Text
                            style={{
                              fontSize: 18,
                              color: colors.text_primary,
                              fontFamily: 'ProductSans-Black',
                            }}>
                            {` ₱${selectedOrder.subTotal}`}
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
                            {selectedOrder.deliveryPrice &&
                            selectedOrder.deliveryPrice > 0
                              ? `₱${selectedOrder.deliveryPrice}`
                              : selectedOrder.deliveryPrice === null
                              ? '(Will be shown upon booking of Mr. Speedy delivery)'
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
                            {'Order Total: '}
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

                  {buttonText &&
                    !(
                      buttonText === 'COMPLETE' &&
                      selectedOrder.deliveryMethod === 'Mr. Speedy'
                    ) && (
                      <Button
                        onPress={() => {
                          if (
                            selectedOrder.deliveryMethod === 'Mr. Speedy' &&
                            selectedOrder.orderStatus.paid.status
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
