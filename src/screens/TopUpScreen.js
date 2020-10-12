import React, {Component} from 'react';
import PaymentOptionsModal from '../components/PaymentOptionsModal';
import {View, Linking, TextInput, Dimensions, Platform} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Text, ListItem, Button, Icon} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';
import {colors} from '../../assets/colors';
import ConfirmationModal from '../components/ConfirmationModal';
import {computed} from 'mobx';
import {inject, observer} from 'mobx-react';
import Toast from '../components/Toast';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {CardItem, Card} from 'native-base';
import {styles} from '../../assets/styles';
import * as Animatable from 'react-native-animatable';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import crashlytics from '@react-native-firebase/crashlytics';

const SCREEN_HEIGHT = Dimensions.get('screen').height;
const inset = initialWindowMetrics && initialWindowMetrics.insets;
const bottomPadding = Platform.OS === 'ios' ? inset.bottom : 0;
@inject('paymentsStore')
@inject('authStore')
@inject('detailsStore')
@observer
class TopUpScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentOptionsModal: false,
      confirmTopUpModal: false,
      topUpAmount: null,
      email: this.props.authStore.userEmail,
      emailCheck: false,
      selectedPaymentMethod: null,
      minTopUpAmount: 1000,
    };
  }

  @computed get selectedPayment() {
    const {selectedPaymentMethod} = this.state;

    return selectedPaymentMethod
      ? Object.values(selectedPaymentMethod)[0]
      : null;
  }

  @computed get selectedPaymentProcId() {
    const {selectedPaymentMethod} = this.state;

    return selectedPaymentMethod ? Object.keys(selectedPaymentMethod)[0] : null;
  }

  @computed get totalAmount() {
    const {selectedPayment} = this;

    if (selectedPayment) {
      if (this.state.topUpAmount) {
        const amount = this.state.topUpAmount + selectedPayment.surcharge;

        return Math.round((amount + Number.EPSILON) * 100) / 100;
      }

      return selectedPayment.surcharge;
    }

    return 0;
  }

  componentDidMount() {
    this.checkEmail(this.state.email);

    crashlytics().log('StoreItemsScreen');
  }

  handleEmailChange = (email) => {
    this.setState({email}, () => {
      this.checkEmail(this.state.email);
    });
  };

  checkEmail = (email) => {
    const regexp = new RegExp(
      /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/,
    );

    if (email.length !== 0 && regexp.test(email)) {
      this.setState({
        emailCheck: true,
      });
    } else {
      this.setState({
        emailCheck: false,
      });
    }
  };

  handleTopUp() {
    const {email, topUpAmount} = this.state;
    const {selectedPaymentProcId} = this;

    this.props.authStore.appReady = false;

    this.props.paymentsStore
      .getTopUpPaymentLink({
        topUpAmount,
        email,
        processId: selectedPaymentProcId,
      })
      .then((data) => {
        if (data.s === 200) {
          this.openLink(data.m.url);
        }
      });
  }

  async openLink(url) {
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(url, {
          dismissButtonStyle: 'close',
          preferredBarTintColor: colors.primary,
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'pageSheet',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: false,
          toolbarColor: colors.primary,
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          forceCloseOnRedirection: false,
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right',
          },
        });

        this.props.authStore.appReady = true;
      } else {
        Linking.openURL(url);
      }
    } catch (err) {
      Toast({text: err.message, type: 'danger'});
    }
  }

  render() {
    const {
      topUpAmount,
      paymentOptionsModal,
      selectedPaymentMethod,
      confirmTopUpModal,
      email,
      emailCheck,
      minTopUpAmount,
    } = this.state;

    const {selectedPayment, totalAmount} = this;

    const {merchantDetails} = this.props.detailsStore;

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title="Top Up Markee Credits"
          navigation={this.props.navigation}
          backButton
        />

        <PaymentOptionsModal
          isVisible={paymentOptionsModal}
          selectedPaymentMethod={selectedPaymentMethod}
          closeModal={() => this.setState({paymentOptionsModal: false})}
          onConfirm={(paymentMethod) => {
            this.setState({
              selectedPaymentMethod: paymentMethod,
              paymentOptionsModal: false,
            });
          }}
        />

        <ConfirmationModal
          isVisible={confirmTopUpModal}
          closeModal={() => this.setState({confirmTopUpModal: false})}
          title="Confirm Top Up"
          body={
            <Card
              style={{
                width: '100%',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              <CardItem
                header
                bordered
                style={{
                  backgroundColor: colors.primary,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  height: 55,
                }}>
                <Text style={{color: colors.icons, fontSize: 20}}>
                  Markee Credits
                </Text>
              </CardItem>

              <CardItem bordered style={{justifyContent: 'space-between'}}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontFamily: 'ProductSans-Bold',
                  }}>
                  {'Current Markee Credits: '}
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'ProductSans-Bold',
                    color: colors.primary,
                  }}>
                  ₱{merchantDetails.creditData.credits.toFixed(2)}
                </Text>
              </CardItem>

              <CardItem bordered style={{justifyContent: 'space-between'}}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontFamily: 'ProductSans-Bold',
                  }}>
                  {'New Markee Credits: '}
                </Text>

                <Text
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  style={{
                    fontSize: 16,
                    fontFamily: 'ProductSans-Bold',
                    color: colors.primary,
                  }}>
                  ₱
                  {(merchantDetails.creditData.credits + topUpAmount).toFixed(
                    2,
                  )}
                </Text>
              </CardItem>
            </Card>
          }
          onConfirm={() => {
            this.handleTopUp();
            this.setState({confirmTopUpModal: false});
          }}
        />

        <View style={{flex: 1}}>
          <KeyboardAwareScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{height: SCREEN_HEIGHT}}>
            <ListItem
              title="Top up value"
              titleStyle={{fontSize: 20}}
              bottomDivider
              input={{
                leftIcon: (
                  <Text style={{fontSize: 28, color: colors.primary}}>₱</Text>
                ),
                inputStyle: {
                  textAlign: 'left',
                  fontFamily: 'ProductSans-Light',
                  fontSize: 28,
                  color: colors.primary,
                },
                containerStyle: {borderBottomWidth: 1},
                placeholder: '0',
                placeholderTextColor: colors.text_secondary,
                keyboardType: 'numeric',
                value: topUpAmount ? topUpAmount.toString() : null,
                onChangeText: (amountText) =>
                  this.setState({topUpAmount: Number(amountText)}),
              }}
            />

            <ListItem
              title="Payment Method"
              onPress={() => this.setState({paymentOptionsModal: true})}
              subtitle={
                selectedPayment
                  ? `${selectedPayment.longName} (₱${
                      selectedPayment.minAmount < minTopUpAmount
                        ? minTopUpAmount
                        : selectedPayment.minAmount
                    } - ₱${selectedPayment.maxAmount})`
                  : 'Please select a payment method'
              }
              subtitleStyle={{fontSize: 16, color: colors.primary}}
              titleStyle={{fontSize: 20}}
              bottomDivider
              chevron
            />

            <ListItem
              title="Email Address"
              titleStyle={{fontSize: 20, flex: 0}}
              subtitle={
                <View style={[styles.action, {flexDirection: 'column'}]}>
                  <View style={{flexDirection: 'row', width: '100%'}}>
                    <View style={styles.icon_container}>
                      <Icon name="mail" color={colors.primary} size={20} />
                    </View>

                    <TextInput
                      placeholder="gordon_norman@gmail.com"
                      placeholderTextColor={colors.text_secondary}
                      maxLength={256}
                      style={styles.textInput}
                      autoCapitalize="none"
                      value={email}
                      onChangeText={(value) => this.handleEmailChange(value)}
                    />

                    {emailCheck ? (
                      <Animatable.View useNativeDriver animation="bounceIn">
                        <Icon name="check-circle" color="#388e3c" size={20} />
                      </Animatable.View>
                    ) : null}
                  </View>

                  <Text style={{color: colors.text_secondary, fontSize: 12}}>
                    We'll send you your receipt here
                  </Text>
                </View>
              }
              bottomDivider
            />
          </KeyboardAwareScrollView>
        </View>

        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            elevation: 10,
            backgroundColor: colors.primary,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
          }}>
          {selectedPaymentMethod && (
            <View
              style={{
                flexDirection: 'column',
                width: '100%',
                paddingHorizontal: 10,
                paddingBottom: 10,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingBottom: 5,
                }}>
                <Text
                  style={{
                    color: colors.icons,
                    fontSize: 18,
                  }}>
                  Top up amount
                </Text>

                <Text
                  style={{
                    color: colors.icons,
                    fontFamily: 'ProductSans-Regular',
                    fontSize: 18,
                  }}>
                  ₱{topUpAmount ? topUpAmount.toFixed(2) : '0.00'}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 5,
                }}>
                <View>
                  <Text
                    style={{
                      color: colors.icons,
                      fontSize: 18,
                    }}>
                    Surcharge
                  </Text>

                  <Text
                    style={{
                      color: colors.icons,
                      fontSize: 12,
                    }}>
                    (Paid in payment portal)
                  </Text>
                </View>

                <Text
                  style={{
                    color: colors.icons,
                    fontSize: 18,
                  }}>
                  ₱{selectedPayment.surcharge.toFixed(2)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 5,
                  borderTopWidth: 1,
                  borderColor: colors.icons,
                }}>
                <Text
                  style={{
                    color: colors.icons,
                    fontSize: 20,
                  }}>
                  Total amount
                </Text>

                <Text
                  style={{
                    color: colors.icons,
                    fontFamily: 'ProductSans-Bold',
                    fontSize: 20,
                  }}>
                  ₱{totalAmount ? totalAmount.toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>
          )}

          <Button
            title="Top Up"
            titleStyle={{color: colors.icons}}
            onPress={() => this.setState({confirmTopUpModal: true})}
            disabled={
              !selectedPaymentMethod ||
              minTopUpAmount > topUpAmount ||
              selectedPayment.minAmount > topUpAmount ||
              !emailCheck ||
              !topUpAmount
            }
            buttonStyle={{
              backgroundColor: colors.accent,
              height: 50,
            }}
            containerStyle={{
              alignSelf: 'flex-end',
              borderRadius: 30,
              width: '100%',
              marginBottom: bottomPadding,
            }}
          />
        </View>
      </View>
    );
  }
}

export default TopUpScreen;
