import React, {Component} from 'react';
import {View, StyleSheet, Platform, Keyboard} from 'react-native';
import {Button} from 'react-native-elements';
import BottomSheet from 'reanimated-bottom-sheet';
import {colors} from '../../../../assets/colors';

class AddOptionBottomSheet extends Component {
  constructor(props) {
    super(props);

    this.state = {bottomSheetPadding: 0};
  }

  initializeKeyboardConfiguration() {
    if (Platform.OS === 'android') {
      Keyboard.addListener('keyboardDidShow', (event) => {
        const keyboardHeight = event.endCoordinates.height;
        this.setState({bottomSheetPadding: keyboardHeight - 20});
      });
      Keyboard.addListener('keyboardDidHide', (event) => {
        this.setState({bottomSheetPadding: 0}, () => {
          if (this.bottomSheet) {
            this.bottomSheet.snapTo(1);
          }
        });
      });
    }
  }

  renderContent(props) {
    const {onConfirm, bottomSheetPadding} = props;

    return (
      <View
        onTouchStart={() => Keyboard.dismiss()}
        style={{
          alignItems: 'center',
          backgroundColor: colors.icons,
          borderTopWidth: 0.7,
          borderRightWidth: 0.7,
          borderLeftWidth: 0.7,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderColor: 'rgba(0,0,0,0.4)',
          height: 320 + bottomSheetPadding,
          paddingVertical: 5,
        }}>
        <Button title="On Confirm" onPress={() => onConfirm()} />
      </View>
    );
  }

  render() {
    const {bottomSheetPadding} = this.state;
    const {renderContent} = this;
    const {onConfirm} = this.props;

    return (
      <View style={{...StyleSheet.absoluteFillObject}}>
        <BottomSheet
          ref={(sheetRef) => (this.bottomSheet = sheetRef)}
          snapPoints={[0, 320, 320 + bottomSheetPadding]}
          borderRadius={30}
          initialSnap={0}
          callbackNode={this.drawerCallbackNode}
          renderContent={() => renderContent({onConfirm, bottomSheetPadding})}
        />
      </View>
    );
  }
}

export default AddOptionBottomSheet;
