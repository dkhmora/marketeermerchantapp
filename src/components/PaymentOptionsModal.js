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
      paymentMethods: {},
    };
  }

  handleSelectPaymentMethod() {}

  render() {
    const {selectedPaymentMethod} = this.state;
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
            contentInsetAdjustmentBehavior="automatic"
            keyboardOpeningTime={20}
            extraScrollHeight={20}
            style={{paddingHorizontal: 15, paddingTop: 15}}>
            <ListItem
              title="BPI"
              subtitle="BPI Payment"
              bottomDivider
              chevron
            />

            <SafeAreaView
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                marginVertical: 30,
              }}>
              <Button
                title="Confirm"
                type="clear"
                disabled={!selectedPaymentMethod}
                loading={this.state.loading}
                loadingProps={{size: 'small', color: colors.primary}}
                containerStyle={{
                  alignSelf: 'flex-end',
                  borderRadius: 30,
                }}
                onPress={() => onConfirm(selectedPaymentMethod)}
              />
            </SafeAreaView>
          </ScrollView>
        </SafeAreaView>
      </Overlay>
    );
  }
}

export default EditItemModal;
