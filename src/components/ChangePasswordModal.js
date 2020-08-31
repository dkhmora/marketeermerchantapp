import React, {Component} from 'react';
import {Overlay, Text, Button, Icon, Input} from 'react-native-elements';
import {View} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {inject, observer} from 'mobx-react';
import {colors} from '../../assets/colors';

@inject('authStore')
@observer
class ChangePasswordModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      currentPassword: '',
      currentPasswordError: null,
      newPassword: '',
      newPasswordError: null,
      confirmNewPasswordError: null,
      confirmNewPassword: '',
    };
  }

  handleCurrentPasswordChange = (currentPassword) => {
    this.setState({currentPassword});

    if (currentPassword === '') {
      this.setState({
        currentPasswordError: 'Current Password must not be empty',
      });
    } else {
      this.setState({
        currentPasswordError: '',
      });
    }
  };

  handleNewPasswordChange = (newPassword) => {
    this.setState({newPassword});

    if (newPassword === '') {
      this.setState({
        newPasswordError: 'New Password must not be empty',
      });
    } else if (newPassword.length < 6) {
      this.setState({
        newPasswordError: 'Password must be more than 6 characters long',
      });
    } else {
      this.setState({
        newPasswordError: '',
      });
    }
  };

  handleConfirmNewPasswordChange = (confirmNewPassword) => {
    this.setState({confirmNewPassword});

    if (confirmNewPassword !== this.state.newPassword) {
      this.setState({
        confirmNewPasswordError: 'Passwords must match',
      });
    } else {
      this.setState({
        confirmNewPasswordError: '',
      });
    }
  };

  handleConfirm() {
    const {currentPassword, newPassword} = this.state;
    const {closeModal} = this.props;

    this.setState({loading: true});

    this.props.authStore
      .changePassword({currentPassword, newPassword})
      .then(() => {
        this.resetData();
        closeModal();
      });
  }

  resetData() {
    this.setState({
      loading: false,
      currentPassword: '',
      currentPasswordError: null,
      newPassword: '',
      newPasswordError: null,
      confirmNewPasswordError: null,
      confirmNewPassword: '',
    });
  }

  render() {
    const {closeModal, isVisible} = this.props;
    const {
      newPasswordError,
      confirmNewPasswordError,
      currentPasswordError,
    } = this.state;

    return (
      <Overlay
        isVisible={isVisible}
        onBackdropPress={() => {
          closeModal();
        }}
        statusBarTranslucent
        animationType="fade"
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
            Change Password
          </Text>

          <Input
            maxLength={32}
            secureTextEntry
            errorMessage={currentPasswordError && currentPasswordError}
            placeholder="Current Password"
            placeholderTextColor={colors.text_secondary}
            value={this.state.currentPassword}
            onChangeText={(value) => this.handleCurrentPasswordChange(value)}
          />

          <View style={{flexDirection: 'column'}}>
            <Input
              maxLength={32}
              secureTextEntry
              placeholder="New Password"
              placeholderTextColor={colors.text_secondary}
              errorMessage={
                this.state.newPasswordError && this.state.newPasswordError
              }
              value={this.state.newPassword}
              onChangeText={(value) => this.handleNewPasswordChange(value)}
              rightIcon={
                newPasswordError === '' ? (
                  <Animatable.View useNativeDriver animation="bounceIn">
                    <Icon name="check-circle" color="#388e3c" size={20} />
                  </Animatable.View>
                ) : null
              }
            />

            <Text
              style={{
                alignSelf: 'flex-end',
                justifyContent: 'flex-start',
              }}>
              Character Count: {this.state.newPassword.length}/32
            </Text>
          </View>

          <Input
            maxLength={32}
            secureTextEntry
            placeholder="Confirm New Password"
            placeholderTextColor={colors.text_secondary}
            errorMessage={
              this.state.confirmNewPasswordError &&
              this.state.confirmNewPasswordError
            }
            value={this.state.confirmNewPassword}
            onChangeText={(value) => this.handleConfirmNewPasswordChange(value)}
            rightIcon={
              confirmNewPasswordError === '' ? (
                <Animatable.View useNativeDriver animation="bounceIn">
                  <Icon name="check-circle" color="#388e3c" size={20} />
                </Animatable.View>
              ) : null
            }
          />

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
              disabled={
                newPasswordError !== '' ||
                confirmNewPasswordError !== '' ||
                currentPasswordError !== ''
              }
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

export default ChangePasswordModal;
