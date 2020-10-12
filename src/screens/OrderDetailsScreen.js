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
import {ScrollView, Switch} from 'react-native-gesture-handler';
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
      mrspeedyOrderPrice: '0.00',
      mrspeedyEstimateLoading: false,
      storePhoneNumber: '',
      storePhoneNumberError: null,
      loading: true,
      allowDragging: true,
      changeOrderStatusModal: false,
      selectedVehicleIndex: 0,
      selectedWeightIndex: 0,
      motobox: false,
      bottomSheetPadding: 0,
    };
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

  @computed get mrspeedyVehicleType() {
    const {selectedOrder} = this.props.ordersStore;

    if (selectedOrder.mrspeedyBookingData) {
      return selectedOrder.mrspeedyBookingData.order.vehicle_type_id === 8
        ? 'Motorbike'
        : 'Car';
    }

    return null;
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

  @computed get weightButtonLabels() {
    const {selectedVehicleIndex} = this.state;

    if (selectedVehicleIndex === 0) {
      return [
        'Less than 1 Kg',
        'Less than 5 Kg',
        'Less than 10 Kg',
        'Less than 15 Kg',
        'Less than 20 Kg',
      ];
    }

    return ['Less than 300 Kg', 'Less than 500 Kg', 'Less than 750 Kg'];
  }

  componentDidMount() {
    const {orderId} = this.props.route.params;

    if (orderId) {
      this.getOrderItems();
      this.props.ordersStore.getOrder(orderId);
    }

    this.initializeKeyboardConfiguration();
    crashlytics().log('OrderDetailsScreen');
  }

  componentWillUnmount() {
    this.props.ordersStore.unsubscribeGetOrder &&
      this.props.ordersStore.unsubscribeGetOrder();

    this.props.ordersStore.selectedOrder = null;
    this.props.ordersStore.orderMessages = null;
  }

  componentDidUpdate(prevProps, prevState) {
    const {selectedVehicleIndex, selectedWeightIndex} = this.state;

    if (
      prevState !== this.state &&
      (prevState.selectedVehicleIndex !== selectedVehicleIndex ||
        (selectedVehicleIndex === 1 &&
          prevState.selectedWeightIndex !== selectedWeightIndex))
    ) {
      this.getMrspeedyOrderPriceEstimate();
    }
  }

  checkStorePhoneNumber() {
    const {storePhoneNumber} = this.state;
    const regexp = new RegExp(/^(\+639)\d{9}$/);
    const formattedPhoneNubmer = `+63${storePhoneNumber}`;

    if (storePhoneNumber.length === 0) {
      this.setState({
        storePhoneNumberError: 'Your Contact Number cannot be empty',
      });
    } else if (!regexp.test(formattedPhoneNubmer)) {
      this.setState({
        storePhoneNumberError:
          'Your Contact Number must be a valid Mobile Phone Number',
      });
    } else {
      this.setState({
        storePhoneNumberError: null,
      });
    }
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

  getMrspeedyOrderPriceEstimate() {
    this.setState({mrspeedyEstimateLoading: true}, () => {
      const {selectedOrder} = this.props.ordersStore;
      const {
        subTotal,
        deliveryCoordinates,
        deliveryAddress,
        paymentMethod,
      } = selectedOrder;
      const {storeLocation, address} = this.props.detailsStore.storeDetails;
      const {selectedVehicleIndex, selectedWeightIndex} = this.state;
      const vehicleType = selectedVehicleIndex === 0 ? 8 : 7;
      let orderWeight = 0;
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

      if (selectedVehicleIndex === 1) {
        orderWeight =
          selectedWeightIndex === 0
            ? 299
            : selectedWeightIndex === 1
            ? 499
            : 699;
      }

      this.props.ordersStore
        .getMrspeedyOrderPriceEstimate({
          subTotal,
          deliveryLatitude: deliveryCoordinates.latitude,
          deliveryLongitude: deliveryCoordinates.longitude,
          deliveryAddress,
          storeLatitude: storeLocation.latitude,
          storeLongitude: storeLocation.longitude,
          vehicleType,
          orderWeight,
          storeAddress: address,
          paymentMethod,
        })
        .then((response) => {
          if (response.data.s === 200) {
            this.setState({mrspeedyOrderPrice: response.data.d});
          }
          this.setState({mrspeedyEstimateLoading: false});
        });
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
          this.sheetRef && this.sheetRef.snapTo(0);

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

  initializeKeyboardConfiguration() {
    if (Platform.OS === 'android') {
      Keyboard.addListener('keyboardDidShow', (event) => {
        const keyboardHeight = event.endCoordinates.height;
        this.setState({bottomSheetPadding: keyboardHeight - 20}, () => {
          if (this.sheetRef) {
            this.sheetRef.snapTo(2);
          }
        });
      });
      Keyboard.addListener('keyboardDidHide', (event) => {
        if (this.sheetRef) {
          this.sheetRef.snapTo(1);
        }
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
    const {selectedOrder} = this.props.ordersStore;
    const {orderId} = this.props.route.params;
    const {orderStatus} = this;
    const {navigation} = this.props;
    const {
      orderItems,
      loading,
      selectedWeightIndex,
      selectedVehicleIndex,
      motobox,
      mrspeedyOrderPrice,
      mrspeedyEstimateLoading,
      storePhoneNumber,
      storePhoneNumberError,
      bottomSheetPadding,
    } = this.state;
    const buttonText =
      orderStatus[0] === 'PAID'
        ? 'SHIP'
        : orderStatus[0] === 'PENDING'
        ? 'ACCEPT'
        : orderStatus[0] === 'SHIPPED'
        ? 'COMPLETE'
        : null;

    return (
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
                  activeOpacity={0.9}
                  onPress={() => {
                    navigation.navigate('Order Chat', {
                      orderId,
                      data: true,
                    });
                  }}
                  style={{
                    backgroundColor: colors.icons,
                    justifyContent: 'space-between',
                    paddingTop: 0,
                    paddingBottom: 0,
                    height: 60,
                    elevation: 2,
                  }}>
                  <Text style={{color: colors.primary, fontSize: 20}}>
                    Customer Details
                  </Text>

                  <View>
                    <Icon name="message-square" color={colors.primary} />
                    <Text style={{color: colors.primary}}>Chat</Text>
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
                  <CardItem
                    header
                    bordered
                    style={{
                      backgroundColor: colors.icons,
                      justifyContent: 'space-between',
                      paddingTop: 0,
                      paddingBottom: 0,
                      height: 60,
                      elevation: 2,
                    }}>
                    <Text style={{color: colors.primary, fontSize: 20}}>
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

                {selectedOrder.mrspeedyBookingData && (
                  <Card
                    style={{
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}>
                    <CardItem
                      header
                      bordered
                      style={{
                        justifyContent: 'space-between',
                        paddingTop: 0,
                        paddingBottom: 0,
                        height: 60,
                        elevation: 2,
                      }}>
                      <Image
                        source={require('../../assets/images/mrspeedy-logo.png')}
                        style={{height: 50, width: 100, resizeMode: 'contain'}}
                      />
                    </CardItem>

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
                                selectedOrder.mrspeedyBookingData.order.courier
                                  .phone
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
                      onTouchStart={() => this.setState({allowDragging: false})}
                      onTouchEnd={() => this.setState({allowDragging: true})}
                      onTouchCancel={() => this.setState({allowDragging: true})}
                      courierCoordinates={
                        selectedOrder.mrspeedyBookingData.order.courier
                          ? {
                              latitude: Number(
                                selectedOrder.mrspeedyBookingData.order.courier
                                  .latitude,
                              ),
                              longitude: Number(
                                selectedOrder.mrspeedyBookingData.order.courier
                                  .longitude,
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
                  <CardItem
                    header
                    bordered
                    style={{
                      backgroundColor: colors.icons,
                      justifyContent: 'space-between',
                      paddingTop: 0,
                      paddingBottom: 0,
                      height: 60,
                      elevation: 2,
                    }}>
                    <Text style={{color: colors.primary, fontSize: 20}}>
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
                          ₱{selectedOrder.subTotal}
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
                          this.sheetRef && this.sheetRef.snapTo(1);
                          this.checkStorePhoneNumber();
                          this.getMrspeedyOrderPriceEstimate();
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
              snapPoints={[0, 360, 360 + bottomSheetPadding]}
              borderRadius={30}
              initialSnap={0}
              renderContent={() => (
                <View
                  onTouchStart={() => Keyboard.dismiss()}
                  style={{
                    alignItems: 'center',
                    backgroundColor: colors.icons,
                    borderTopWidth: 0.7,
                    borderRightWidth: 0.7,
                    borderLeftWidth: 0.7,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    borderColor: 'rgba(0,0,0,0.4)',
                    height: 360 + bottomSheetPadding,
                    paddingVertical: 5,
                  }}>
                  <Image
                    source={require('../../assets/images/mrspeedy-logo.png')}
                    style={{
                      height: 50,
                      width: 100,
                      resizeMode: 'contain',
                    }}
                  />
                  <View style={{paddingHorizontal: 10}}>
                    <ButtonGroup
                      onPress={(index) => {
                        if (index !== selectedVehicleIndex) {
                          this.setState({selectedWeightIndex: 0});
                        }
                        this.setState({selectedVehicleIndex: index});
                      }}
                      selectedIndex={selectedVehicleIndex}
                      buttons={['Motorbike', 'Car']}
                      activeOpacity={0.7}
                      containerStyle={{
                        height: 30,
                        width: '80%',
                        borderRadius: 15,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        borderColor: 'rgba(0,0,0,0.7)',
                      }}
                      selectedButtonStyle={{
                        backgroundColor: colors.primary,
                      }}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <ScrollView
                      horizontal
                      style={{flexGrow: 0}}
                      showsHorizontalScrollIndicator={false}>
                      <ButtonGroup
                        onPress={(index) =>
                          this.setState({selectedWeightIndex: index})
                        }
                        selectedIndex={selectedWeightIndex}
                        buttons={this.weightButtonLabels}
                        activeOpacity={0.7}
                        containerStyle={{
                          minWidth: SCREEN_WIDTH - 22,
                          height: 50,
                          borderRadius: 8,
                          elevation: 5,
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          borderWidth: 0.7,
                          borderColor: 'rgba(0,0,0,0.7)',
                        }}
                        buttonStyle={{
                          alignItems: 'center',
                          paddingHorizontal: 5,
                        }}
                        textStyle={{textAlign: 'center'}}
                        selectedButtonStyle={{
                          backgroundColor: colors.primary,
                          elevation: 5,
                        }}
                      />
                    </ScrollView>

                    <ListItem
                      title="Require Motobox"
                      titleStyle={{
                        fontSize: 18,
                        color: colors.text_primary,
                      }}
                      containerStyle={{
                        width: '100%',
                        height: 65,
                        paddingTop: 10,
                        paddingBottom: 10,
                      }}
                      rightElement={
                        <Switch
                          trackColor={{
                            false: '#767577',
                            true: colors.primary,
                          }}
                          thumbColor={'#f4f3f4'}
                          ios_backgroundColor="#3e3e3e"
                          onValueChange={() =>
                            this.setState({motobox: !motobox})
                          }
                          value={motobox}
                        />
                      }
                    />

                    <ListItem
                      title="Your Contact Number"
                      titleStyle={{
                        fontSize: 18,
                        color: colors.text_primary,
                      }}
                      containerStyle={{
                        width: '100%',
                        height: 65,
                        paddingTop: 10,
                        paddingBottom: 10,
                      }}
                      input={{
                        leftIcon: (
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                            }}>
                            <Icon
                              name="hash"
                              color={colors.primary}
                              size={16}
                            />
                            <Text
                              style={{
                                color: colors.text_primary,
                                fontSize: 18,
                              }}>
                              (+63)
                            </Text>
                          </View>
                        ),
                        inputStyle: {
                          textAlign: 'left',
                          fontFamily: 'ProductSans-Light',
                          fontSize: 20,
                          color: colors.primary,
                          borderBottomWidth: 1,
                        },
                        inputContainerStyle: {
                          paddingVertical: 20,
                        },
                        placeholder: '9171234567',
                        placeholderTextColor: colors.text_secondary,
                        keyboardType: 'numeric',
                        value: storePhoneNumber,
                        //onFocus: () =>
                        //this.sheetRef && this.sheetRef.snapTo(2),
                        onChangeText: (phone) => {
                          this.setState({storePhoneNumber: phone}, () =>
                            this.checkStorePhoneNumber(),
                          );
                        },
                        errorMessage: storePhoneNumberError,
                      }}
                    />

                    <ListItem
                      title={
                        mrspeedyEstimateLoading ? (
                          <ActivityIndicator
                            color={colors.primary}
                            size="small"
                          />
                        ) : (
                          `₱${mrspeedyOrderPrice}`
                        )
                      }
                      titleStyle={{
                        fontSize: 26,
                        fontFamily: 'ProductSans-Black',
                        color: colors.primary,
                      }}
                      containerStyle={{
                        width: '100%',
                        height: 65,
                        paddingTop: 10,
                        paddingBottom: 10,
                      }}
                      rightElement={
                        <Button
                          onPress={() => {
                            this.setState({changeOrderStatusModal: true});
                          }}
                          disabled={
                            mrspeedyEstimateLoading ||
                            storePhoneNumber.length <= 0 ||
                            storePhoneNumberError !== undefined
                          }
                          title="Place Order"
                          titleStyle={{color: colors.icons}}
                          containerStyle={{
                            borderRadius: 24,
                            marginTop: 0,
                            marginBottom: 0,
                          }}
                          buttonStyle={{
                            backgroundColor: colors.accent,
                          }}
                        />
                      }
                    />
                  </View>
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
