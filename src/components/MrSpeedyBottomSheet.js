import {computed} from 'mobx';
import {inject, observer} from 'mobx-react';
import React, {Component} from 'react';
import {ActivityIndicator, Platform, View, StyleSheet} from 'react-native';
import {
  Button,
  ButtonGroup,
  Icon,
  Image,
  ListItem,
  Text,
} from 'react-native-elements';
import {Switch, ScrollView} from 'react-native-gesture-handler';
import {Modalize} from 'react-native-modalize';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import {colors} from '../../assets/colors';
import ConfirmationModal from './ConfirmationModal';
import Toast from './Toast';

const inset = initialWindowMetrics && initialWindowMetrics.insets;
const bottomPadding = Platform.OS === 'ios' ? inset.bottom : 0;
@inject('ordersStore')
@inject('authStore')
@inject('detailsStore')
@observer
class MrSpeedyBottomSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedVehicleIndex: 0,
      selectedWeightIndex: 0,
      motobox: true,
      mrspeedyEstimateLoading: false,
      storePhoneNumber: '',
      storePhoneNumberError: null,
      mrspeedyOrderPrice: '0.00',
      changeOrderStatusModal: false,
    };
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

  componentDidUpdate(prevProps, prevState) {
    const {
      selectedVehicleIndex,
      selectedWeightIndex,
      mrspeedyEstimateLoading,
      mrspeedyOrderPrice,
    } = this.state;

    if (
      this.props.ordersStore.selectedOrder &&
      ((!mrspeedyEstimateLoading && mrspeedyOrderPrice === '0.00') ||
        prevState.selectedVehicleIndex !== selectedVehicleIndex ||
        (selectedVehicleIndex === 1 &&
          prevState.selectedWeightIndex !== selectedWeightIndex))
    ) {
      this.getMrspeedyOrderPriceEstimate();
    }
  }

  checkStorePhoneNumber() {
    const {storePhoneNumber} = this.state;
    const regexp = new RegExp(/^(639)\d{9}$/);
    const formattedPhoneNubmer = `63${storePhoneNumber}`;

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
    const {orderId, storeId} = selectedOrder;
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

    const formattedPhoneNubmer = `63${storePhoneNumber}`;

    const mrspeedyBookingData = {
      vehicleType,
      motobox,
      orderWeight,
      storePhoneNumber: formattedPhoneNubmer,
    };

    if (
      selectedOrder.mrspeedyBookingData &&
      selectedOrder.mrspeedyBookingData.order &&
      selectedOrder.mrspeedyBookingData.order.status === 'canceled'
    ) {
      this.props.ordersStore
        .rebookMrspeedyBooking({
          mrspeedyBookingData,
          orderId,
        })
        .then((response) => {
          if (response.data.s === 200) {
            this.modalizeRef && this.modalizeRef.open();

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
      this.props.ordersStore
        .setOrderStatus(
          orderId,
          storeId,
          storeDetails.merchantId,
          mrspeedyBookingData,
        )
        .then((response) => {
          this.props.authStore.appReady = true;

          if (response.data.s === 200) {
            this.modalizeRef && this.modalizeRef.open();

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
  }

  resetState() {
    this.setState({
      selectedVehicleIndex: 0,
      selectedWeightIndex: 0,
      motobox: true,
      mrspeedyEstimateLoading: false,
      storePhoneNumber: '',
      storePhoneNumberError: null,
      mrspeedyOrderPrice: '0.00',
    });
  }

  render() {
    const {
      selectedVehicleIndex,
      selectedWeightIndex,
      motobox,
      mrspeedyEstimateLoading,
      storePhoneNumber,
      storePhoneNumberError,
      mrspeedyOrderPrice,
      changeOrderStatusModal,
    } = this.state;
    const {clearSelectedOrderOnClose} = this.props;
    const {selectedOrder} = this.props.ordersStore;
    const preBooking =
      selectedOrder &&
      selectedOrder.deliveryMethod === 'Mr. Speedy' &&
      selectedOrder.paymentMethod === 'Online Banking' &&
      selectedOrder.orderStatus.pending.status;

    return (
      <>
        {selectedOrder && (
          <ConfirmationModal
            isVisible={changeOrderStatusModal}
            title={`Ship Order # ${selectedOrder.storeOrderNumber}?`}
            body={`Are you sure you want to ship Order # ${selectedOrder.storeOrderNumber} and book a delivery via Mr. Speedy?`}
            onConfirm={() => {
              this.setState({changeOrderStatusModal: false}, () => {
                this.handleChangeOrderStatus();
              });
            }}
            closeModal={() => this.setState({changeOrderStatusModal: false})}
          />
        )}

        <Modalize
          ref={(modalizeRef) => (this.modalizeRef = modalizeRef)}
          modalHeight={400 + bottomPadding}
          onClosed={() => {
            if (clearSelectedOrderOnClose) {
              this.props.ordersStore.selectedOrder = null;
            }

            this.resetState();
          }}
          onOpened={() =>
            mrspeedyOrderPrice === '0.00' &&
            this.getMrspeedyOrderPriceEstimate()
          }
          avoidKeyboardLikeIOS={true}
          keyboardAvoidingBehavior="padding"
          handleStyle={{backgroundColor: colors.text_secondary, opacity: 0.85}}
          modalStyle={{
            backgroundColor: colors.icons,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: 'rgba(0,0,0,0.2)',
          }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.icons,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              overflow: 'hidden',
              paddingVertical: 5,
              paddingBottom: bottomPadding,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../../assets/images/mrspeedy-logo.png')}
                style={{
                  height: 50,
                  width: 100,
                  resizeMode: 'contain',
                }}
              />

              <Text numberOfLines={1} style={{fontSize: 18}}>
                {` | Order # ${
                  selectedOrder ? selectedOrder.storeOrderNumber : ''
                }`}
              </Text>
            </View>

            <View style={{paddingHorizontal: 10}}>
              <ButtonGroup
                onPress={(index) => {
                  this.weightScrollViewRef &&
                    this.weightScrollViewRef.scrollTo({
                      animated: false,
                      x: 0,
                      y: 0,
                    });
                  if (index !== selectedVehicleIndex) {
                    this.setState({selectedWeightIndex: 0});
                  }
                  this.setState({selectedVehicleIndex: index});
                }}
                selectedIndex={selectedVehicleIndex}
                buttons={['Motorbike', 'Car']}
                buttonStyle={{
                  borderRadius: 30,
                  paddingRight: 0,
                  padding: 0,
                }}
                buttonContainerStyle={{
                  borderRadius: 30,
                }}
                innerBorderStyle={{color: 'transparent', width: 5}}
                activeOpacity={0.7}
                containerStyle={{
                  height: 30,
                  width: '80%',
                  borderRadius: 30,
                  paddingLeft: -5,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                }}
                selectedButtonStyle={{
                  backgroundColor: colors.icons,
                  borderColor: colors.primary,
                  borderWidth: 1,
                }}
                selectedTextStyle={{
                  color: colors.primary,
                }}
              />
            </View>

            <View style={{flex: 1}}>
              <ScrollView
                ref={(scrollref) => (this.weightScrollViewRef = scrollref)}
                style={{flexGrow: 0}}
                horizontal
                showsHorizontalScrollIndicator={false}>
                <ButtonGroup
                  onPress={(index) =>
                    this.setState({selectedWeightIndex: index})
                  }
                  selectedIndex={selectedWeightIndex}
                  buttons={this.weightButtonLabels}
                  activeOpacity={0.7}
                  buttonStyle={{
                    borderRadius: 30,
                    paddingHorizontal: 10,
                  }}
                  buttonContainerStyle={{
                    borderRadius: 30,
                  }}
                  innerBorderStyle={{color: 'transparent', width: 10}}
                  containerStyle={{
                    height: 40,
                    flex: 1,
                    borderRadius: 30,
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.41,
                  }}
                  textStyle={{textAlign: 'center'}}
                  selectedButtonStyle={{
                    backgroundColor: colors.icons,
                    borderColor: colors.primary,
                    borderWidth: 1,
                  }}
                  selectedTextStyle={{
                    color: colors.primary,
                  }}
                />
              </ScrollView>

              <ListItem
                title="Require Motobox"
                titleStyle={{
                  fontSize: 17,
                  color: colors.text_primary,
                }}
                containerStyle={{
                  width: '100%',
                }}
                rightElement={
                  <Switch
                    trackColor={{
                      false: '#767577',
                      true: colors.primary,
                    }}
                    thumbColor={'#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => this.setState({motobox: !motobox})}
                    value={selectedVehicleIndex === 0 ? motobox : false}
                    disabled={selectedVehicleIndex === 1}
                  />
                }
              />

              <ListItem
                title="Your Contact Number"
                titleStyle={{
                  fontSize: 17,
                  color: colors.text_primary,
                }}
                containerStyle={{
                  width: '100%',
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
                        size={18}
                        style={{marginRight: 5}}
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
                    fontSize: 17,
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
                  onChangeText: (phone) => {
                    this.setState({storePhoneNumber: phone}, () =>
                      this.checkStorePhoneNumber(),
                    );
                  },
                  errorMessage: storePhoneNumberError,
                  errorStyle: {flexWrap: 'wrap'},
                  errorProps: {numberOfLines: 2},
                }}
              />
            </View>

            <ListItem
              title={
                mrspeedyEstimateLoading ? (
                  <ActivityIndicator color={colors.primary} size="small" />
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
              }}
              rightElement={
                <Button
                  onPress={() => {
                    this.setState({changeOrderStatusModal: true});
                  }}
                  disabled={
                    mrspeedyEstimateLoading ||
                    storePhoneNumber.length <= 0 ||
                    storePhoneNumberError !== null
                  }
                  title={preBooking ? 'Accept Order' : 'Place Order'}
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
        </Modalize>
      </>
    );
  }
}

export default MrSpeedyBottomSheet;
