import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Linking,
  Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import Toast from '../components/Toast';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import crashlytics from '@react-native-firebase/crashlytics';
import { ScrollView } from 'react-native-gesture-handler';

@inject('authStore')
@observer
class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      emailCheck: false,
      secureTextEntry: true,
      forgotPasswordModal: false,
    };
  }

  componentDidMount() {
    this.props.authStore.appReady = true;

    if (this.props.route.params) {
      const {reset} = this.props.route.params;

      if (reset) {
        this.props.navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }
    }

    crashlytics().log('LoginScreen');
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

  handlePasswordChange = (value) => {
    this.setState({
      password: value,
    });
  };

  updateSecureTextEntry = () => {
    this.setState({
      secureTextEntry: !this.state.secureTextEntry,
    });
  };

  handleSignIn() {
    const {email, password} = this.state;

    this.props.authStore.appReady = false;

    this.props.authStore.signIn(email, password).then(() => {
      this.props.authStore.appReady = true;
    });
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

  openMerchantSignUpForm() {
    const url = 'https://marketeer.ph/components/pages/partnermerchantsignup';

    this.openLink(url);
  }

  openTermsAndConditions() {
    const url = 'https://marketeer.ph/components/pages/termsandconditions';

    this.openLink(url);
  }

  openPrivacyPolicy() {
    const url = 'https://marketeer.ph/components/pages/privacypolicy';

    this.openLink(url);
  }

  render() {
    const {emailCheck} = this.state;

    return (
      <View style={[styles.container, {paddingTop: 0}]}>
        <StatusBar animated translucent backgroundColor={colors.statusBar} />

        <ForgotPasswordModal
          isVisible={this.state.forgotPasswordModal}
          closeModal={() => this.setState({forgotPasswordModal: false})}
        />

        <Animatable.View
          duration={800}
          useNativeDriver
          animation="fadeInUp"
          style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{
              height: 150,
              width: 200,
              resizeMode: 'contain',
            }}
          />
        </Animatable.View>

        <Animatable.View
          useNativeDriver
          animation="fadeInUpBig"
          style={styles.footer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardOpeningTime={20}
            extraScrollHeight={20}
            contentContainerStyle={{flex: 1}}>
            <View>
              <Text style={styles.text_header}>Login</Text>

              <Text style={styles.text_footer}>Email Address</Text>

              <View style={styles.action}>
                <View style={styles.icon_container}>
                  <Icon name="user" color={colors.primary} size={20} />
                </View>

                <TextInput
                  placeholder="myemail@gmail.com"
                  placeholderTextColor={colors.text_secondary}
                  maxLength={256}
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(value) => this.handleEmailChange(value)}
                />

                {this.state.emailCheck ? (
                  <Animatable.View useNativeDriver animation="bounceIn">
                    <Icon name="check-circle" color="#388e3c" size={20} />
                  </Animatable.View>
                ) : null}
              </View>

              <Text
                style={[
                  styles.text_footer,
                  {
                    marginTop: 20,
                  },
                ]}>
                Password
              </Text>

              <View style={styles.action}>
                <View style={styles.icon_container}>
                  <Icon name="lock" color={colors.primary} size={20} />
                </View>

                <TextInput
                  placeholder="Password"
                  placeholderTextColor={colors.text_secondary}
                  maxLength={32}
                  secureTextEntry={this.state.secureTextEntry ? true : false}
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(value) => this.handlePasswordChange(value)}
                />

                <TouchableOpacity onPress={this.updateSecureTextEntry}>
                  {this.state.secureTextEntry ? (
                    <Icon name="eye" color="grey" size={20} />
                  ) : (
                    <Icon name="eye-off" color="grey" size={20} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => this.setState({forgotPasswordModal: true})}>
                <Text style={styles.touchable_text}>Forgot Password?</Text>
              </TouchableOpacity>

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingTop: 10,
                  marginBottom: 50,
                  flexWrap: 'wrap',
                }}>
                <Text
                  style={([styles.color_textPrivate], {textAlign: 'justify'})}>
                  By using our service, you agree to our
                </Text>

                <TouchableOpacity onPress={() => this.openTermsAndConditions()}>
                  <Text style={[styles.touchable_text, {textAlign: 'justify'}]}>
                    {' Terms and Conditions'}
                  </Text>
                </TouchableOpacity>

                <Text
                  style={([styles.color_textPrivate], {textAlign: 'justify'})}>
                  and
                </Text>

                <TouchableOpacity onPress={() => this.openPrivacyPolicy()}>
                  <Text style={[styles.touchable_text, {textAlign: 'justify'}]}>
                    {' Privacy Policy'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                onPress={() => this.handleSignIn()}
                title="Login"
                type="outline"
                disabled={!emailCheck}
                containerStyle={{
                  marginTop: 40,
                }}
                buttonStyle={{
                  height: 50,
                  borderColor: emailCheck ? colors.primary : 'grey',
                  borderRadius: 24,
                  borderWidth: 1,
                }}
              />

              {Platform.OS === 'android' && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    paddingTop: 10,
                    flexWrap: 'wrap',
                  }}>
                  <Text style={styles.color_textPrivate}>
                    {'Are you a merchant? '}
                  </Text>

                  <TouchableOpacity
                    onPress={() => this.openMerchantSignUpForm()}>
                    <Text style={styles.touchable_text}>Come and join us!</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </Animatable.View>
      </View>
    );
  }
}

export default LoginScreen;
