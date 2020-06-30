import React, {Component} from 'react';
import OptionsMenu from 'react-native-options-menu';
import {Header, Button, Icon, Text} from 'react-native-elements';
import {Platform, ActionSheetIOS, StyleSheet} from 'react-native';
import BaseOptionsMenu from './BaseOptionsMenu';
import {colors} from '../../assets/colors';

class BaseHeader extends Component {
  constructor(props) {
    super(props);
  }

  menuButton = () => {
    const {navigation} = this.props;

    if (navigation) {
      return (
        <Button
          onPress={() => navigation.openDrawer()}
          type="clear"
          color={colors.icons}
          icon={<Icon name="menu" color={colors.icons} />}
          containerStyle={{borderRadius: 24}}
        />
      );
    }

    return null;
  };

  backButton = () => {
    const {navigation} = this.props;

    if (navigation) {
      return (
        <Button
          onPress={() => navigation.goBack()}
          type="clear"
          color={colors.icons}
          icon={<Icon name="arrow-left" color={colors.icons} />}
          containerStyle={{borderRadius: 24}}
        />
      );
    }

    return null;
  };

  leftComponent = () => {
    const {backButton} = this.props;

    if (backButton) {
      return this.backButton();
    }

    return this.menuButton();
  };

  rightComponent = () => {
    const {actions, options, destructiveIndex} = this.props;

    if (options && actions) {
      return (
        <BaseOptionsMenu
          iconStyle={{color: colors.primary, marginRight: 10}}
          options={options}
          actions={actions}
          destructiveIndex={destructiveIndex}
        />
      );
    }
    return null;
  };

  centerComponent = () => {
    const {centerComponent, title} = this.props;

    if (centerComponent) {
      return centerComponent;
    }

    return <Text style={{fontSize: 20, color: colors.icons}}>{title}</Text>;
  };

  render() {
    return (
      <Header
        placement={Platform.OS === 'ios' ? 'center' : 'left'}
        leftComponent={this.leftComponent}
        centerComponent={this.centerComponent}
        rightComponent={this.rightComponent}
        statusBarProps={{
          barStyle: 'light-content',
          backgroundColor: colors.statusBar,
          translucent: true,
        }}
        containerStyle={styles.header}
        centerContainerStyle={{
          flex: 3,
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    justifyContent: 'space-around',
    zIndex: 100,
  },
  buttonContainer: {
    borderRadius: 24,
    color: '#fff',
  },
  titleText: {
    fontSize: 16,
    color: colors.icons,
  },
});

export default BaseHeader;
