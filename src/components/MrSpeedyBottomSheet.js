import {computed} from 'mobx';
import {inject, observer} from 'mobx-react';
import React, {Component} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
  Switch,
  View,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {
  Button,
  ButtonGroup,
  Icon,
  Image,
  ListItem,
  Text,
} from 'react-native-elements';
import Animated, {call, onChange} from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import {colors} from '../../assets/colors';
import Toast from './Toast';

const SCREEN_WIDTH = Dimensions.get('window').width;

@inject('ordersStore')
@inject('authStore')
@inject('detailsStore')
@observer
class MrSpeedyBottomSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bottomSheetPadding: 0,
      selectedVehicleIndex: 0,
      selectedWeightIndex: 0,
      motobox: false,
      mrspeedyEstimateLoading: false,
      storePhoneNumber: '',
      storePhoneNumberError: null,
      mrspeedyOrderPrice: '0.00',
      openRatio: 0,
    };

    this.drawerCallbackNode = new Animated.Value(0);
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
    this.initializeKeyboardConfiguration();
  }

  componentDidUpdate(prevProps, prevState) {
    const {selectedVehicleIndex, selectedWeightIndex} = this.state;

    if (
      prevState !== this.state &&
      this.props.ordersStore.selectedOrder &&
      (prevState.selectedVehicleIndex !== selectedVehicleIndex ||
        (selectedVehicleIndex === 1 &&
          prevState.selectedWeightIndex !== selectedWeightIndex))
    ) {
      this.getMrspeedyOrderPriceEstimate();
    }
  }

  initializeKeyboardConfiguration() {
    if (Platform.OS === 'android') {
      Keyboard.addListener('keyboardDidShow', (event) => {
        const keyboardHeight = event.endCoordinates.height;
        this.setState({bottomSheetPadding: keyboardHeight - 20}, () => {
          if (this.bottomSheet) {
            this.bottomSheet.snapTo(2);
          }
        });
      });
      Keyboard.addListener('keyboardDidHide', (event) => {
        this.setState({bottomSheetPadding: 0}, () => {
          if (this.bottomSheet) {
            this.bottomSheet.snapTo(1);
          }
        });
      });
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
          this.bottomSheet && this.bottomSheet.snapTo(0);

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

  onCallback = ([value]) => {
    this.setState({
      openRatio: 1 - value,
    });
  };

  render() {
    const {
      bottomSheetPadding,
      selectedVehicleIndex,
      selectedWeightIndex,
      motobox,
      mrspeedyEstimateLoading,
      storePhoneNumber,
      storePhoneNumberError,
      mrspeedyOrderPrice,
    } = this.state;
    const {clearSelectedOrderOnClose} = this.props;

    return (
      <View style={{...StyleSheet.absoluteFillObject}}>
        <Animated.Code
          exec={onChange(
            this.drawerCallbackNode,
            call([this.drawerCallbackNode], this.onCallback),
          )}
        />
        <BottomSheet
          ref={(sheetRef) => (this.bottomSheet = sheetRef)}
          snapPoints={[0, 360, 360 + bottomSheetPadding]}
          borderRadius={30}
          initialSnap={0}
          callbackNode={this.drawerCallbackNode}
          onCloseStart={
            clearSelectedOrderOnClose
              ? () => (this.props.ordersStore.selectedOrder = null)
              : null
          }
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
                  buttonStyle={{
                    borderRadius: 30,
                    borderWidth: 1,
                    borderColor: colors.primary,
                  }}
                  innerBorderStyle={{borderColor: 'transaprent'}}
                  buttonContainerStyle={{
                    borderWidth: 0,
                    borderColor: 'transaprent',
                  }}
                  activeOpacity={0.7}
                  containerStyle={{
                    height: 30,
                    width: '80%',
                    borderWidth: 0,
                    borderColor: 'transaprent',
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
                      onValueChange={() => this.setState({motobox: !motobox})}
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
                        <Icon name="hash" color={colors.primary} size={16} />
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
    );
  }
}

export default MrSpeedyBottomSheet;
