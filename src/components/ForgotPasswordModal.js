import React, {Component} from 'react';
import {Overlay, Text, Button, Icon} from 'react-native-elements';
import {View, TextInput, Keyboard} from 'react-native';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import * as Animatable from 'react-native-animatable';
import {inject} from 'mobx-react';

@inject('authStore')
class ForgotPasswordModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emailCheck: false,
      email: '',
    };
  }

  handleEmailChange = (email) => {
    const regexp = new RegExp(
      /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/,
    );

    this.setState({email});

    if (email.length !== 0 && regexp.test(email)) {
      this.setState({
        emailCheck: true,
      });
    } else {
      this.setState({
        emailCheck: false,
      });
    }
  };

  handleConfirm() {
    const {email} = this.state;
    const {closeModal} = this.props;

    this.props.authStore.appReady = false;
    closeModal();

    this.props.authStore.resetPassword(email).then(() => {
      this.setState({emailCheck: false, email: ''});

      this.props.authStore.appReady = true;
    });
  }

  handleBackdropPress() {
    const {closeModal} = this.props;

    closeModal();

    this.setState({email: '', emailCheck: false});
  }

  render() {
    const {isVisible, closeModal, ...otherProps} = this.props;
    const {emailCheck} = this.state;

    return (
      <Overlay
        {...otherProps}
        isVisible={isVisible}
        onBackdropPress={() => this.handleBackdropPress()}
        statusBarTranslucent
        animationType="fade"
        width="auto"
        height="auto"
        overlayStyle={{borderRadius: 10, padding: 0}}>
        <View style={{width: '80%', padding: 15}}>
          <Text
            onPress={() => Keyboard.dismiss()}
            style={{
              fontSize: 24,
              fontFamily: 'ProductSans-Regular',
              paddingBottom: 20,
            }}>
            Forgot Password
          </Text>

          <Text
            onPress={() => Keyboard.dismiss()}
            style={{
              color: colors.text_primary,
              fontSize: 16,
              paddingBottom: 20,
            }}>
            Please enter your account email where we will send you a link to
            reset your password.
          </Text>

          <View style={styles.action}>
            <View style={styles.icon_container}>
              <Icon name="mail" color={colors.primary} size={20} />
            </View>

            <TextInput
              placeholder="gordon_norman@gmail.com"
              maxLength={256}
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(value) => this.handleEmailChange(value)}
            />

            {emailCheck ? (
              <Animatable.View useNativeDriver animation="bounceIn">
                <Icon name="check-circle" color="#388e3c" size={20} />
              </Animatable.View>
            ) : null}
          </View>

          <Button
            title="Confirm"
            type="clear"
            disabled={!emailCheck}
            containerStyle={{
              alignSelf: 'flex-end',
              borderRadius: 30,
              marginTop: 20,
            }}
            onPress={() => this.handleConfirm()}
          />
        </View>
      </Overlay>
    );
  }
}

export default ForgotPasswordModal;
