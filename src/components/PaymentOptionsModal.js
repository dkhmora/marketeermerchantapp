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
@inject('paymentsStore')
@observer
class EditItemModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPaymentMethod: null,
    };
  }

  render() {
    const {paymentMethods} = this.props.paymentsStore;
    const {selectedPaymentMethod} = this.state;
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
