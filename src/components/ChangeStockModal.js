import React, {Component} from 'react';
import {Overlay, Text, Button, Icon} from 'react-native-elements';
import {View, TextInput} from 'react-native';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import * as Animatable from 'react-native-animatable';
import {inject, observer} from 'mobx-react';
import Toast from './Toast';

@inject('detailsStore')
@inject('itemsStore')
@observer
class ChangeStockModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stockCheck: false,
      stock: '',
      loading: false,
    };
  }

  handleStockChange = (stock) => {
    const numberRegexp = /^-?[0-9]+$/;

    this.setState({stock});

    if (stock !== '' && numberRegexp.test(Number(stock))) {
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

    this.setState({loading: true});

    this.props.itemsStore
      .changeStock(
        merchantId,
        this.props.itemsStore.selectedItem,
        Number(Math.trunc(stock)),
      )
      .then(() => {
        this.setState({loading: false});

        this.closeModal();

        Toast({
          text: `Item ${this.props.itemsStore.selectedItem.name} successfully edited!`,
          buttonText: 'Okay',
          type: 'success',
          duration: 3500,
          style: {margin: 20, borderRadius: 16},
        });

        this.setState({stockCheck: false, stock: ''});
      });
  }

  closeModal() {
    if (!this.state.loading) {
      this.props.itemsStore.changeStockModal = false;
    }
  }

  render() {
    const {stockCheck} = this.state;

    return (
      <Overlay
        isVisible={this.props.itemsStore.changeStockModal}
        onBackdropPress={() => {
          this.closeModal();
        }}
        windowBackgroundColor="rgba(255, 255, 255, .5)"
        overlayBackgroundColor="red"
        width="auto"
        height="auto"
        overlayStyle={{borderRadius: 10, padding: 15, width: '80%'}}>
        <View>
          <Text
            style={{
              fontSize: 24,
              fontFamily: 'ProductSans-Regular',
              paddingBottom: 20,
            }}>
            Add Stock to{' '}
            {this.props.itemsStore.selectedItem &&
              this.props.itemsStore.selectedItem.name}
          </Text>

          <View style={styles.action}>
            <View style={styles.icon_container}>
              <Icon name="hash" color={colors.primary} size={20} />
            </View>

            <TextInput
              placeholder={`Additional ${
                this.props.itemsStore.selectedItem &&
                this.props.itemsStore.selectedItem.name
              } Stock`}
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              marginTop: 40,
            }}>
            {!this.state.loading && (
              <Button
                title="Cancel"
                type="clear"
                containerStyle={{
                  alignSelf: 'flex-end',
                  borderRadius: 30,
                }}
                onPress={() => this.closeModal()}
              />
            )}

            <Button
              title="Confirm"
              type="clear"
              disabled={!stockCheck}
              loading={this.state.loading}
              containerStyle={{
                alignSelf: 'flex-end',
                borderRadius: 30,
              }}
              onPress={() => this.handleConfirm()}
            />
          </View>
        </View>
      </Overlay>
    );
  }
}

export default ChangeStockModal;
