import React, {Component} from 'react';
import {Overlay, Text, Button, Icon, ListItem} from 'react-native-elements';
import {
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';

@inject('detailsStore')
@inject('itemsStore')
@observer
class EditItemModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPaymentMethod: null,
      paymentMethods: {
        BOG: {
          name: 'Bogus Bank',
          description:
            'Use your Bogus Bank Online Banking account to make a payment (TEST ONLY).',
          devOnly: true,
        },
        BOGX: {
          name: 'Bogus Bank Over-The-Counter',
          description:
            'Deposit your payment over-the-counter at any Bogus Bank branch worldwide (TEST ONLY).',
          devOnly: true,
        },
        BDO: {
          name: 'BDO Internet Banking',
          description:
            'Use your BDO Retail Internet Banking (RIB) account to make a payment. Read our BDO RIB guide for more details.',
          minTime: 600,
          maxTime: 2130,
          devOnly: true,
          minAmount: 1.0,
          maxAmount: 1000000.0,
        },
        CBC: {
          name: 'Chinabank Online',
          description:
            'Use your Chinabank Online Banking account to make a payment.',
          minTime: 600,
          maxTime: 2100,
          minAmount: 1.0,
          maxAmount: 200000.0,
        },
        LBPA: {
          name: 'Landbank ATM Online',
          description:
            'Pay using your Landbank ATM account at the Landbank ePaymentPortal. Landbank charges a PHP10.00 service fee. Visit our How-To page for more details',
          minTime: 300,
          maxTime: 2130,
          minAmount: 1.0,
          maxAmount: 200000.0,
        },
        BPI: {
          name: 'BPI ExpressOnline/Mobile (Fund Transfer)',
          description:
            'Use your BPI ExpressOnline/Mobile (EOLM) Banking account to make a Fund Transfer. Choose this option only if you have previously registered Dragonpay for 3rd Party Fund Transfer or enabled Fund Transfer to Anyone. A P15 Service Fee and a small random verification fee is added.',
          minTime: 400,
          maxTime: 2330,
          minAmount: 1.0,
          maxAmount: 1000000.0,
          additionalCharge: 15.0,
        },
        MAYB: {
          name: 'Maybank Online Banking',
          description:
            'Pay online using Maybank2u Online Banking. NOTE: A P10.00 Service Fee will be added.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
          additionalCharge: 10.0,
        },
        RSB: {
          name: 'RobinsonsBank Online Bills Payment',
          description:
            'Use your RobinsonsBank Online Banking account to make a bills payment.',
          minTime: 0,
          maxTime: 2300,
          minAmount: 10.0,
          maxAmount: 1000000.0,
        },
        BDRX: {
          name: 'BDO Cash Deposit with Ref',
          description:
            'Perform a Cash Deposit with Reference Number at any BDO branch. Payments are automatically processed after a few minutes. NOTE: A P25 Service Fee will be added. Choose a different bank if you do not agree to this fee.',
          minAmount: 1.0,
          maxAmount: 2000000.0,
          additionalCharge: 25.0,
        },
        BPXB: {
          name: 'BPI Bills Payment',
          description:
            'Pay cash over-the-counter at any BPI branch through Bills Payment. NOTE: A P100 Service Fee will be added. Choose a different bank if you do not agree to this fee.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
          additionalCharge: 100.0,
        },
        MBXB: {
          name: 'Metrobank Cash Payment',
          description:
            'Make a cash bills payment over-the-counter at any Metrobank branch nationwide. NOTE: A P50 Service Fee will be added. Choose a different bank if you do not agree to this fee.',
          minAmount: 50.0,
          maxAmount: 2000000.0,
          additionalCharge: 50.0,
        },
        BNRX: {
          name: 'BDO Network Bank (formerly ONB) Cash Dep',
          description:
            'Perform a Cash Deposit with Reference Number at any BDO Network Bank (formerly ONB) branch. Payments are automatically processed after a few minutes. NOTE: A P15 Service Fee will be added. Choose a different bank if you do not agree to this fee.',
          minAmount: 10.0,
          maxAmount: 1000000.0,
          additionalCharge: 15.0,
        },
        AUB: {
          name: 'AUB Online/Cash Payment',
          description:
            'Pay using online banking or over-the-counter cash payment at any Asia United Bank branch nationwide',
          minAmount: 10.0,
          maxAmount: 1000000.0,
        },
        CBCX: {
          name: 'Chinabank ATM/Cash Payment',
          description:
            'Deposit your payment over-the-counter (OTC) at any Chinabank branch or ATM nationwide. Branches inside malls are open Saturdays. Provincial branches may charge handling fee for OTC. There are no charges for ATM payments.',
          devOnly: true,
          minAmount: 1.0,
          maxAmount: 20040.0,
        },
        EWXB: {
          name: 'Eastwest Bank Online/Cash Payment',
          description:
            'Transfer funds online or deposit cash over-the-counter at any EastWest Bank branch nationwide.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
        },
        LBXB: {
          name: 'Landbank Cash Payment',
          description:
            'Deposit your payment over-the-counter at any Landbank branch nationwide. NOTE: A P50.00 Service Fee will be added.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
          additionalCharge: 50.0,
        },
        PNBB: {
          name: 'PNB E-Banking Bills Payment',
          description:
            'Pay online using PNB e-Banking Bills Payment. Payments are automatically processed end of banking day.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
        },
        PNXB: {
          name: 'PNB Cash Payment',
          description:
            'Pay cash over-the-counter at any PNB branch. Payments are automatically processed end of day. NOTE: A P25 Service Fee will be added. Choose a different bank if you do not agree to this fee.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
          additionalCharge: 25.0,
        },
        RCXB: {
          name: 'RCBC Cash Payment',
          description:
            'Deposit your payment over-the-counter at any RCBC branch nationwide. NOTE: A P25.00 Service Fee will be added.',
          minAmount: 25.0,
          maxAmount: 1000000.0,
        },
        RSBB: {
          name: 'RobinsonsBank Over-The-Counter',
          description:
            'Make an over-the-counter Bills Payment at any RobinsonsBank branch nationwide. Payments are process in about 5 to 10 mins.',
          minAmount: 10.0,
          maxAmount: 1000000.0,
        },
        SBCB: {
          name: 'Security Bank Cash Payment',
          description:
            'Pay over-the-counter at any Security Bank branch. Payments are processed next day. NOTE: A P50 Service Fee will be added. Choose a different bank if you do not agree to this fee.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
          additionalCharge: 50.0,
        },
        UBXB: {
          name: 'Unionbank Cash Payment',
          description:
            'Deposit your payment over-the-counter at any Unionbank branch nationwide.',
          minAmount: 1.0,
          maxAmount: 2000000.0,
        },
        UCXB: {
          name: 'UCP ATM/Cash Payment',
          description:
            'Make a bills payment over-the-counter (OTC) at any UCPB branch or ATM nationwide.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
        },
        BAYD: {
          name: 'Bayad Center',
          description: 'Pay at any Bayad Center branch nationwide.',
          minAmount: 50.0,
          maxAmount: 500000.0,
        },
        LBC: {
          name: 'LBC',
          description:
            'Pay at any LBC outlet nationwide (except those inside SM Malls) 7-days-a-week. LBC is now a Bayad Center.',
          minAmount: 50.0,
          maxAmount: 200000.0,
        },
        SMR: {
          name: 'SM Dept/Supermarket/Savemore Counter',
          description:
            'Pay at any Payment Counter of SM Dept Store, SM Supermarket, Savemore nationwide 7-days-a-week. Payments are processed end of day.',
          minAmount: 50.0,
          maxAmount: 200000.0,
        },
        CEBL: {
          name: 'Cebuana Lhuiller Bills Payment',
          description:
            'Pay at any Cebuana Lhuillier branch nationwide. Payments are processed next day.',
          minAmount: 10.0,
          maxAmount: 500000.0,
        },
        RDS: {
          name: 'Robinsons Dept Store',
          description:
            'Pay at Robinsons Dept Store Bills Payment Counter 7-days-a-week up to 7pm. Payments are processed end of day.',
          minAmount: 50.0,
          maxAmount: 200000.0,
        },
        ECPY: {
          name: 'ECPay (Pawnshops, Payment Centers)',
          description:
            'Pay at any ECPay Collection Partner nationwide including Ever, Gaisano, NCCC, ExpressPay, CVM Pawnshop, Via Express, selected Tambunting, Smart/Cignal distributors, and many more.',
          minAmount: 50.0,
          maxAmount: 500000.0,
        },
        PLWN: {
          name: 'Palawan Pawnshop',
          description:
            'Make an over-the-counter Bills Payment at any Palawan Pawnshop branch nationwide.',
          minAmount: 10.0,
          maxAmount: 20000.0,
        },
        RDP: {
          name: 'RD Pawnshop',
          description:
            'Make an over-the-counter Bills Payment at any RD Pawnshop branch nationwide.',
          minAmount: 10.0,
          maxAmount: 50000.0,
        },
        RLNT: {
          name: 'Ruralnet Banks and Coops',
          description:
            'Pay at any rural bank or cooperative affiliated with RuralNet',
          minAmount: 20.0,
          maxAmount: 100000.0,
        },
        MBTC: {
          name: 'Metrobank Direct',
          description:
            'Use your Metrobankdirect Online Banking account to make a payment.',
          minTime: 300,
          maxTime: 2330,
          minAmount: 1.0,
          maxAmount: 1000000.0,
        },
        PSB: {
          name: 'PSBank Online',
          description:
            'Pay using PSBank Online. Payments are processed next day.',
          minAmount: 10.0,
          maxAmount: 25000.0,
        },
        RCBC: {
          name: 'RCBC Online Banking',
          description:
            'Use your RCBC AccessOne Online Banking account to make a payment. NOTE: A P5.00 Service Fee will be added.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
          additionalCharge: 5.0,
        },
        UBPB: {
          name: 'UnionBank Internet Banking',
          description:
            'Use your Unionbank Online Banking account to make a payment. There is a Php10.00 surcharge.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
          additionalCharge: 10.0,
        },
        UCPB: {
          name: 'UCPB Connect',
          description:
            'Use your UCPBConnect Online Banking account to make a payment.',
          minAmount: 1.0,
          maxAmount: 100000.0,
        },
        BITC: {
          name: 'Coins.ph Wallet/Bitcoin',
          description: 'Pay using Bitcoins or Coins.ph Wallet.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
        },
        GRPY: {
          name: 'GrabPay',
          description:
            'Pay using your GrabPay wallet. NOTE: Any centavo portion will be rounded up to the nearest Peso.',
          minAmount: 1.0,
          maxAmount: 10000.0,
        },
        I2I: {
          name: 'i2i Rural Banks',
          description:
            'Pay at any I2I-member Rural Bank including Cantilan Bank, City Savings Bank, and many others.',
          minAmount: 1.0,
          maxAmount: 100000.0,
        },
        GCSH: {
          name: 'GCash',
          description:
            'Pay using Globe GCash. NOTE: A P10 Service Fee may be added.',
          minAmount: 1.0,
          maxAmount: 30000.0,
          additionalCharge: 10.0,
        },
        711: {
          name: '7-Eleven',
          description:
            'Pay at any 7-11 convenience store in the Philippines nationwide 24x7.',
          minAmount: 250.0,
          maxAmount: 10000.0,
        },
        BDOA: {
          name: 'Banco De Oro ATM',
          description:
            'Pay at any BDO ATM nationwide. Payments are processed next day.',
          minAmount: 200.0,
          maxAmount: 1000000.0,
        },
        BPIA: {
          name: 'BPI Online/Mobile (NEW)',
          description:
            'Use your BPI Online/Mobile (EOLM) Banking account to make a payment. A P15 Service Fee is added.',
          minTime: 200,
          maxTime: 2330,
          minAmount: 1.0,
          maxAmount: 49980.01,
          additionalCharge: 15.0,
        },
        DPAY: {
          name: 'Dragonpay Prepaid Credits',
          description:
            'Use the Dragonpay Mobile App and pay using your prepaid credits in realtime and earn bonus loyalty points with your purchase.',
          minAmount: 1.0,
          maxAmount: 1000000.0,
        },
        MLH: {
          name: 'M. Lhuillier',
          description:
            'Pay at any M. Lhuillier outlet nationwide 7-days-a-week. A service fee will be charged by M. Lhuillier directly to you. Payments are processed next day.',
          minAmount: 180.0,
          maxAmount: 500000.0,
        },
      },
    };
  }

  handleSelectPaymentMethod() {}

  render() {
    const {selectedPaymentMethod, paymentMethods} = this.state;
    const {isVisible, closeModal, onConfirm} = this.props;

    return (
      <Overlay
        isVisible={isVisible}
        onBackdropPress={() => {
          closeModal();
        }}
        fullScreen
        width="auto"
        height="auto"
        overlayStyle={{flex: 1, padding: 0}}>
        <SafeAreaView style={{flex: 1}}>
          <StatusBar
            barStyle={
              Platform.OS === 'android' ? 'light-content' : 'dark-content'
            }
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
              paddingVertical: 7.5,
              backgroundColor: colors.primary,
              alignItems: 'center',
              elevation: 6,
            }}>
            <Text
              style={{
                fontSize: 20,
                color: colors.icons,
              }}>
              Payment Method
            </Text>

            <Button
              type="clear"
              icon={<Icon name="x" color={colors.icons} />}
              titleStyle={{color: colors.icons}}
              containerStyle={{
                borderRadius: 30,
              }}
              onPress={() => closeModal()}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic">
            {Object.entries(paymentMethods).map(([key, value]) => {
              const paymentMethod = {[key]: value};

              if (!value.devOnly) {
                return (
                  <ListItem
                    title={value.name}
                    subtitle={value.description}
                    bottomDivider={
                      key !== Object.keys(paymentMethods).slice(-1)[0]
                    }
                    chevron
                    key={key}
                    rightIcon={
                      selectedPaymentMethod &&
                      selectedPaymentMethod[key] === paymentMethod[key] ? (
                        <Icon name="check" color={colors.primary} />
                      ) : null
                    }
                    onPress={() =>
                      this.setState({selectedPaymentMethod: paymentMethod})
                    }
                  />
                );
              }
            })}
          </ScrollView>

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
              title="Confirm"
              titleStyle={{color: colors.icons}}
              disabled={!selectedPaymentMethod}
              buttonStyle={{backgroundColor: colors.accent, height: 50}}
              containerStyle={{
                alignSelf: 'flex-end',
                borderRadius: 30,
                flex: 1,
              }}
              onPress={() => onConfirm(selectedPaymentMethod)}
            />
          </SafeAreaView>
        </SafeAreaView>
      </Overlay>
    );
  }
}

export default EditItemModal;
