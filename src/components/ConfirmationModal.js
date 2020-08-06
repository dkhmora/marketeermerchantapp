import React, {PureComponent} from 'react';
import {Overlay, Text, Button} from 'react-native-elements';
import {View} from 'react-native';
import {inject, observer} from 'mobx-react';

@inject('authStore')
@observer
class ConfirmationModal extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {closeModal, isVisible, onConfirm, title, body} = this.props;

    return (
      <Overlay
        isVisible={isVisible}
        onBackdropPress={() => {
          closeModal();
        }}
        windowBackgroundColor="rgba(255, 255, 255, .5)"
        overlayBackgroundColor="red"
        width="80%"
        height="auto"
        overlayStyle={{borderRadius: 10, padding: 15, width: '80%'}}>
        <View style={{flexDirection: 'column'}}>
          <Text
            style={{
              fontSize: 24,
              fontFamily: 'ProductSans-Regular',
              paddingBottom: 20,
            }}>
            {title}
          </Text>

          <Text
            style={{
              fontSize: 20,
            }}>
            {body}
          </Text>

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
