import React from 'react';
import OptionsMenu from 'react-native-options-menu';
import {Header, Text, Button, Icon, Body, Right, Left} from 'native-base';

export default function BaseHeader(props) {
  const {
    title,
    menuButton,
    backButton,
    navigation,
    actions,
    options,
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

  const myIcon = (
    <Icon name="more" size={30} style={{color: '#5B0EB5', marginRight: 8}} />
  );

  const RightHeaderButton = () => {
    if (options) {
      return (
        <OptionsMenu
          customButton={myIcon}
          destructiveIndex={1}
          options={options}
          actions={actions}
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
      <Body>
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
