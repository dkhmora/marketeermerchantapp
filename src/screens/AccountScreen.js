import React, {Component} from 'react';
import BaseHeader from '../components/BaseHeader';
import {View} from 'react-native';
import {inject, observer} from 'mobx-react';
import {Card, CardItem} from 'native-base';
import {Text, Button, Icon, Input, Overlay} from 'react-native-elements';
import {colors} from '../../assets/colors';
import Toast from '../components/Toast';
import {styles} from '../../assets/styles';
import ChangePasswordModal from '../components/ChangePasswordModal';

@inject('authStore')
@observer
class AccountScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      changePasswordModal: false,
    };
  }

  handleChangePassword() {
    this.setState({
      changePasswordModal: true,
    });
  }

  closeModal() {
    this.setState({
      changePasswordModal: false,
    });
  }

  render() {
    const {navigation} = this.props;
    const {userEmail} = this.props.authStore;
    const {changePasswordModal} = this.state;

    return (
      <View style={{flex: 1}}>
        <BaseHeader title="Account Settings" navigation={navigation} />

        <ChangePasswordModal
          isVisible={changePasswordModal}
          closeModal={() => this.closeModal()}
        />

        <View
          style={{
            paddingHorizontal: 15,
            paddingVertical: 10,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
          }}>
          <Card style={{borderRadius: 10, overflow: 'hidden'}}>
            <CardItem header bordered>
              <Text
                style={{
                  fontFamily: 'ProductSans-Regular',
                  fontSize: 20,
                }}>
                Account Details
              </Text>
            </CardItem>

            <CardItem
              style={{
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'ProductSans-Bold',
                  fontSize: 16,
                  textAlignVertical: 'center',
                }}>
                Email address:{' '}
              </Text>

              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  textAlignVertical: 'center',
                }}>
                {userEmail}
              </Text>
            </CardItem>

            <CardItem
              button
              activeOpacity={0.7}
              onPress={() => this.handleChangePassword()}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.accent,
              }}>
              <Text
                style={{
                  fontFamily: 'ProductSans-Black',
                  color: colors.icons,
                }}>
                Change Password
              </Text>
            </CardItem>
          </Card>
        </View>
      </View>
    );
  }
}

export default AccountScreen;
