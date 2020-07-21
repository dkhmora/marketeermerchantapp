import React, {Component} from 'react';
import {Overlay, Text, Button, Icon, Input} from 'react-native-elements';
import {View} from 'react-native';
import {styles} from '../../assets/styles';
import * as Animatable from 'react-native-animatable';
import {inject, observer} from 'mobx-react';
import Toast from './Toast';

@inject('ordersStore')
@observer
class CancelOrderModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cancelReasonCheck: false,
      cancelReason: '',
      loading: false,
    };
  }

  handleCancelReasonChange = (cancelReason) => {
    this.setState({cancelReason});

    if (cancelReason !== '') {
      this.setState({
        cancelReasonCheck: true,
      });
    } else {
      this.setState({
        cancelReasonCheck: false,
      });
    }
  };

  handleConfirm() {
    const {order, closeModal} = this.props;

    this.setState({loading: true});

    this.props.ordersStore
      .cancelOrder(order.orderId, order.merchantId, this.state.cancelReason)
      .then(() => {
        this.setState({loading: false});

        closeModal();

        Toast({
          text: `Order # ${order.merchantOrderNumber} successfully cancelled!`,
          buttonText: 'Okay',
          type: 'success',
          duration: 3500,
          style: {margin: 20, borderRadius: 16},
        });
      });
  }

  render() {
    const {order, isVisible, closeModal, ...otherProps} = this.props;
    const {cancelReasonCheck} = this.state;

    return (
      <Overlay
        {...otherProps}
        isVisible={isVisible}
        onBackdropPress={() => {
          closeModal();
        }}
        windowBackgroundColor="rgba(255, 255, 255, .5)"
        overlayBackgroundColor="red"
        width="80%"
        height="auto"
        overlayStyle={{borderRadius: 10, padding: 15, width: '80%'}}>
        <View>
          <Text
            style={{
              fontSize: 24,
              fontFamily: 'ProductSans-Regular',
              paddingBottom: 20,
            }}>
            Are you sure you want to cancel Order # {order.merchantOrderNumber}?
          </Text>

          <View style={[styles.action]}>
            <Input
              numberOfLines={8}
              maxLength={600}
              placeholder="Reason for Cancellation"
              value={this.state.cancelReason}
              onChangeText={(value) => this.handleCancelReasonChange(value)}
              style={{
                borderRadius: 24,
              }}
              inputStyle={{textAlignVertical: 'top'}}
            />
          </View>

          {cancelReasonCheck ? (
            <Animatable.View
              useNativeDriver
              animation="bounceIn"
              style={{position: 'absolute', right: 10, bottom: '50%'}}>
              <Icon name="check-circle" color="#388e3c" size={20} />
            </Animatable.View>
          ) : null}

          <Text
            style={{
              alignSelf: 'flex-end',
              justifyContent: 'flex-start',
            }}>
            Character Limit: {this.state.cancelReason.length}/600
          </Text>

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
                onPress={() => closeModal()}
              />
            )}

            <Button
              title="Confirm"
              type="clear"
              disabled={!cancelReasonCheck}
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

export default CancelOrderModal;