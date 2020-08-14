import React, {Component} from 'react';
import PaymentOptionsModal from '../components/PaymentOptionsModal';
import {View, SafeAreaView} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Text, ListItem, Button} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';
import {colors} from '../../assets/colors';
import ConfirmationModal from '../components/ConfirmationModal';

class TopUpScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentOptionsModal: false,
      confirmTopUpModal: false,
      amount: 0,
      selectedPaymentMethod: null,
    };
  }

  handleTopUp() {
    console.log(`Top up ${this.state.selectedPaymentMethod}`);
  }

  render() {
    const {
      amount,
      paymentOptionsModal,
      selectedPaymentMethod,
      confirmTopUpModal,
    } = this.state;

    const selectedPayment = selectedPaymentMethod
      ? Object.values(selectedPaymentMethod)[0]
      : null;

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title="Top Up Markee Credits"
          navigation={this.props.navigation}
          backButton
        />

        <PaymentOptionsModal
          isVisible={paymentOptionsModal}
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
          body={`Are you sure you want to top up ${amount}`}
          onConfirm={() => {
            this.handleTopUp();
            this.setState({confirmTopUpModal: false});
          }}
        />

        <KeyboardAwareScrollView>
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
              placeholderTextColor: colors.text_secondary,
              keyboardType: 'numeric',
              value: amount.toString(),
              onChangeText: (amountText) =>
                this.setState({amount: Number(amountText)}),
            }}
          />

          <ListItem
            title="Payment Method"
            onPress={() => this.setState({paymentOptionsModal: true})}
            subtitle={
              selectedPaymentMethod
                ? `${selectedPayment.name} ${
                    selectedPayment.minAmount
                      ? `(₱${selectedPayment.minAmount} - ₱${selectedPayment.maxAmount})`
                      : ''
                  }`
                : 'Please select a payment method'
            }
            subtitleStyle={{fontSize: 16, color: colors.primary}}
            titleStyle={{fontSize: 20}}
            bottomDivider
            chevron
          />
        </KeyboardAwareScrollView>

        <SafeAreaView
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
                  ₱{amount}
                </Text>
              </View>

              {selectedPayment.additionalCharge && (
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
                      Payment provider charge
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
                    ₱{selectedPayment.additionalCharge}
                  </Text>
                </View>
              )}

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
                  ₱{amount}
                </Text>
              </View>
            </View>
          )}

          <Button
            title="Top Up"
            titleStyle={{color: colors.icons}}
            raised
            onPress={() => this.setState({confirmTopUpModal: true})}
            disabled={
              !selectedPaymentMethod ||
              Object.values(selectedPaymentMethod)[0].minAmount > amount
            }
            buttonStyle={{backgroundColor: colors.accent, height: 50}}
            containerStyle={{
              alignSelf: 'flex-end',
              borderRadius: 30,
              width: '100%',
            }}
          />
        </SafeAreaView>
      </View>
    );
  }
}

export default TopUpScreen;
