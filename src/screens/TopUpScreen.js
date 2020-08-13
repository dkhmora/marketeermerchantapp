import React, {Component} from 'react';
import PaymentOptionsModal from '../components/PaymentOptionsModal';
import {View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Input, Text, ListItem} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';
import {colors} from '../../assets/colors';

class TopUpScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {topUpModal: false, amount: 0};
  }

  render() {
    const {amount, topUpModal} = this.state;

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title="Top Up Markee Credits"
          navigation={this.props.navigation}
          backButton
        />

        <PaymentOptionsModal
          isVisible={topUpModal}
          closeModal={() => this.setState({topUpModal: false})}
          onConfirm={(paymentMethod) => console.log(paymentMethod)}
        />

        <KeyboardAwareScrollView>
          <ListItem
            title="Top up value"
            titleStyle={{fontSize: 24}}
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
            onPress={() => this.setState({topUpModal: true})}
            subtitle="BPI"
            subtitleStyle={{fontSize: 16, color: colors.primary}}
            titleStyle={{fontSize: 20}}
            bottomDivider
            chevron
          />
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

export default TopUpScreen;
