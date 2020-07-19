import React, {Component} from 'react';
import {Overlay, Text, Button, Icon} from 'react-native-elements';
import {View, TextInput} from 'react-native';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import * as Animatable from 'react-native-animatable';
import {inject, observer} from 'mobx-react';

@inject('detailsStore')
@inject('itemsStore')
@observer
class ChangeStockModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stockCheck: false,
      stock: '',
    };
  }

  handleStockChange = (stock) => {
    const numberRegexp = /^[0-9]+$/;
    const emptyRegexp = /^$|\s+/;

    this.setState({stock});

    if (!emptyRegexp.test(stock) && numberRegexp.test(Number(stock))) {
      this.setState({
        stockCheck: true,
      });
    } else {
      this.setState({
        stockCheck: false,
      });
    }
  };

  handleConfirm() {
    const {merchantId} = this.props.detailsStore.storeDetails;
    const {stock} = this.state;
    const {item, closeModal} = this.props;

    this.props.itemsStore.changeStock(merchantId, item, stock).then(() => {
      closeModal();

      this.setState({stockCheck: false, stock: ''});
    });
  }

  render() {
    const {item, isVisible, closeModal, ...otherProps} = this.props;
    const {stockCheck} = this.state;

    return (
      <Overlay
        {...otherProps}
        isVisible={isVisible}
        onBackdropPress={() => {
          closeModal();
        }}
        windowBackgroundColor="rgba(255, 255, 255, .5)"
        overlayBackgroundColor="red"
        width="auto"
        height="auto"
        overlayStyle={{borderRadius: 10, padding: 0}}>
        <View style={{width: '80%', padding: 15}}>
          <Text
            style={{
              fontSize: 24,
              fontFamily: 'ProductSans-Regular',
              paddingBottom: 20,
            }}>
            Change {item.name}'s Stock
          </Text>

          <View style={styles.action}>
            <View style={styles.icon_container}>
              <Icon name="hash" color={colors.primary} size={20} />
            </View>

            <TextInput
              placeholder={`${item.name}'s Stock`}
              maxLength={10}
              keyboardType="numeric"
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(value) => this.handleStockChange(value)}
            />

            {stockCheck ? (
              <Animatable.View useNativeDriver animation="bounceIn">
                <Icon name="check-circle" color="#388e3c" size={20} />
              </Animatable.View>
            ) : null}
          </View>

          <Button
            title="Confirm"
            type="clear"
            disabled={!stockCheck}
            containerStyle={{
              alignSelf: 'flex-end',
              paddingTop: 20,
              borderRadius: 30,
            }}
            onPress={() => this.handleConfirm()}
          />
        </View>
      </Overlay>
    );
  }
}

export default ChangeStockModal;
