import React from 'react';
import OptionsMenu from 'react-native-options-menu';
import {Header, Text, Button, Icon, Body, Right, Left} from 'native-base';
import {Platform, ActionSheetIOS} from 'react-native';
import BaseOptionsMenu from './BaseOptionsMenu';

export default function BaseHeader(props) {
  const {
    title,
    menuButton,
    backButton,
    navigation,
    actions,
    options,
    destructiveIndex,
    ...otherProps
  } = props;

  function openDrawer() {
    if (navigation) {
      navigation.openDrawer();
    }
  }

  function goBack() {
    if (navigation) {
      navigation.goBack();
    }
  }

  const LeftHeaderButton = () => {
    if (backButton) {
      return (
        <Button transparent onPress={goBack}>
          <Icon name="arrow-back" />
        </Button>
      );
    }
    if (menuButton) {
      return (
        <Button transparent onPress={openDrawer}>
          <Icon name="menu" />
        </Button>
      );
    }
    return null;
  };

  const RightHeaderButton = () => {
    if (options && actions) {
      return (
        <BaseOptionsMenu
          iconStyle={{color: '#E91E63', marginRight: 10}}
          options={options}
          actions={actions}
          destructiveIndex={destructiveIndex}
        />
      );
    }
    return null;
  };

  return (
    <Header {...otherProps} transparent style={{elevation: 1}}>
      <Left>
        <LeftHeaderButton />
      </Left>
      <Body style={{flex: 3}}>
        <Text>{title}</Text>
      </Body>
      <Right>
        <RightHeaderButton />
      </Right>
    </Header>
  );
}

BaseHeader.defaultProps = {
  menuButton: true,
  backButton: false,
};
