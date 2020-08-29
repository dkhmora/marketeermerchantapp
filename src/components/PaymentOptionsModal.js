import React, {Component} from 'react';
import {Overlay, Text, Button, Icon, ListItem} from 'react-native-elements';
import {
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';
import FastImage from 'react-native-fast-image';
import Hyperlink from 'react-native-hyperlink';
import stripHtml from 'string-strip-html';
import Toast from './Toast';
import InAppBrowser from 'react-native-inappbrowser-reborn';

@inject('detailsStore')
@inject('itemsStore')
@inject('paymentsStore')
@observer
class PaymentOptionsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPaymentMethod: null,
    };
  }

  async componentDidMount() {
    this.getAvailablePaymentMethods();
  }

  async getAvailablePaymentMethods() {
    this.props.paymentsStore.getAvailablePaymentMethods();
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
          showTitle: true,
          toolbarColor: colors.primary,
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right',
          },
        });
      } else {
        Linking.openURL(url);
      }
    } catch (err) {
      Toast({text: err.message, type: 'danger'});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isVisible !== this.props.isVisible && this.props.isVisible) {
      this.setState({selectedPaymentMethod: this.props.selectedPaymentMethod});
    }
  }

  render() {
    const {selectedPaymentMethod} = this.state;
    const {availablePaymentMethods} = this.props.paymentsStore;
    const {isVisible, closeModal, onConfirm} = this.props;

    return (
      <Overlay
        isVisible={isVisible}
        onBackdropPress={() => {
          closeModal();
        }}
        fullScreen
        animationType="fade"
        width="auto"
        height="auto"
        overlayStyle={{flex: 1, padding: 0, backgroundColor: colors.primary}}>
        <SafeAreaView style={{flex: 1}}>
          <StatusBar barStyle="light-content" />

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

          {Object.keys(availablePaymentMethods).length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentInsetAdjustmentBehavior="automatic">
              {Object.entries(availablePaymentMethods)
                .sort((a, b) => a[1].longName > b[1].longName)
                .map(([key, value], index) => {
                  const paymentMethod = {[key]: value};

                  return (
                    <ListItem
                      title={value.longName}
                      subtitle={
                        <Hyperlink
                          linkStyle={{color: colors.accent}}
                          onPress={(url, text) => this.openLink(url)}>
                          <Text style={{color: colors.text_secondary}}>
                            {
                              stripHtml(value.remarks, {
                                dumpLinkHrefsNearby: {
                                  enabled: true,
                                  putOnNewLine: false,
                                  wrapHeads: '[',
                                  wrapTails: ']',
                                },
                              }).result
                            }
                          </Text>
                        </Hyperlink>
                      }
                      bottomDivider={
                        key !== Object.keys(availablePaymentMethods).slice(0)[0]
                      }
                      leftElement={
                        <FastImage
                          source={{uri: value.logo}}
                          style={{width: '20%', height: 50}}
                          resizeMode={FastImage.resizeMode.contain}
                        />
                      }
                      chevron
                      disabled={value.status !== 'A'}
                      key={key}
                      containerStyle={{
                        paddingBottom:
                          index ===
                          Object.keys(availablePaymentMethods).length - 1
                            ? 30
                            : 0,
                      }}
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
                })}
            </ScrollView>
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

          <SafeAreaView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -24,
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
                margin: 10,
              }}
              onPress={() => onConfirm(selectedPaymentMethod)}
            />
          </SafeAreaView>
        </SafeAreaView>
      </Overlay>
    );
  }
}

export default PaymentOptionsModal;
