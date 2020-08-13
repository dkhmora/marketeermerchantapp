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
            }}
          />

          <ListItem
            title="Payment Method"
            onPress={() => this.setState({paymentOptionsModal: true})}
            subtitle={
              selectedPaymentMethod
                ? Object.values(selectedPaymentMethod)[0].name
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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            elevation: 10,
            backgroundColor: colors.primary,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
          }}>
          <Button
            title="Top Up"
            titleStyle={{color: colors.icons}}
            onPress={() => this.setState({confirmTopUpModal: true})}
            disabled={!selectedPaymentMethod}
            buttonStyle={{backgroundColor: colors.accent, height: 50}}
            containerStyle={{
              alignSelf: 'flex-end',
              borderRadius: 30,
              flex: 1,
            }}
          />
        </SafeAreaView>
      </View>
    );
  }
}

export default TopUpScreen;
