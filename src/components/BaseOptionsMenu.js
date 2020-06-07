import React, {Component} from 'react';
import {Platform, ActionSheetIOS} from 'react-native';
import {Button, Icon} from 'native-base';
import OptionsMenu from 'react-native-options-menu';

class BaseOptionsMenu extends Component {
  constructor(props) {
    super(props);
  }

  openOptions() {
    const {options, actions, destructiveIndex} = this.props;

    let optionActions = {};

    if (options.length === actions.length) {
      options.map((option, index) => {
        optionActions[option] = actions[index];
      });
    } else {
      console.log('Please put an equal number of options and actions');
    }

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel'].concat(options),
        destructiveIndex,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else {
          optionActions[buttonIndex - 1];
        }
      },
    );
  }

  render() {
    const {options, actions, destructiveIndex} = this.props;
    const {iconStyle} = this.props;

    const optionsIcon = <Icon name="more" style={{...iconStyle}} />;

    return Platform.OS === 'android' ? (
      <OptionsMenu
        customButton={optionsIcon}
        destructiveIndex={destructiveIndex}
        options={options}
        actions={actions}
      />
    ) : (
      <Button transparent onPress={() => this.openOptions()}>
        <optionsIcon />
      </Button>
    );
  }
}

export default BaseOptionsMenu;
