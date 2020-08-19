import React, {PureComponent} from 'react';
import {Overlay, Text, Button} from 'react-native-elements';
import {View, Dimensions, KeyboardAvoidingView} from 'react-native';
import {inject, observer} from 'mobx-react';
import FastImage from 'react-native-fast-image';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TextInput} from 'react-native-gesture-handler';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;
@inject('authStore')
@observer
class ConfirmationModal extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {closeModal, isVisible, onConfirm, title, body, image} = this.props;

    return (
      <Overlay
        isVisible={isVisible}
        onBackdropPress={() => {
          closeModal();
        }}
        statusBarTranslucent
        overlayStyle={{
          width: SCREEN_WIDTH * 0.8,
          height: 'auto',
          borderRadius: 10,
          padding: 15,
        }}>
        <View style={{flexDirection: 'column'}}>
          <Text
            style={{
              fontSize: 24,
              fontFamily: 'ProductSans-Regular',
              paddingBottom: 20,
            }}>
            {title}
          </Text>

          {typeof body === 'string' ? (
            <Text
              style={{
                fontSize: 20,
              }}>
              {body}
            </Text>
          ) : (
            body
          )}

          {image && (
            <View
              style={{
                height: Dimensions.get('screen').height * 0.4,
              }}>
              <FastImage
                source={{uri: image}}
                style={{
                  flex: 1,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              marginTop: 40,
            }}>
            <Button
              title="Cancel"
              type="clear"
              containerStyle={{
                alignSelf: 'flex-end',
                borderRadius: 30,
              }}
              onPress={() => closeModal()}
            />

            <Button
              title="Confirm"
              type="clear"
              containerStyle={{
                alignSelf: 'flex-end',
                borderRadius: 30,
              }}
              onPress={() => onConfirm()}
            />
          </View>
        </View>
      </Overlay>
    );
  }
}

export default ConfirmationModal;
