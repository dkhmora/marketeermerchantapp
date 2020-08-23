import React, {Component} from 'react';
import {Header, Button, Icon, Text} from 'react-native-elements';
import {Platform, StyleSheet, View} from 'react-native';
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
          titleStyle={{color: colors.icons}}
          icon={<Icon name="menu" color={colors.icons} />}
          containerStyle={{borderRadius: 24}}
        />
      );
    }

    return null;
  };

  backButton = () => {
    const {navigation, backButtonAction} = this.props;

    if (navigation) {
      return (
        <Button
          onPress={
            backButtonAction ? backButtonAction : () => navigation.goBack()
          }
          type="clear"
          color={colors.icons}
          titleStyle={{color: colors.icons}}
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
    const {actions, options, destructiveIndex, rightComponent} = this.props;

    if (options && actions) {
      return (
        <BaseOptionsMenu
          iconStyle={{
            color: colors.primary,
            marginRight: Platform.OS === 'android' ? 10 : 0,
          }}
          options={options}
          actions={actions}
          destructiveIndex={destructiveIndex}
        />
      );
    }

    if (rightComponent) {
      return rightComponent;
    }

    return <View style={{width: 40}} />;
  };

  centerComponent = () => {
    const {centerComponent, title} = this.props;

    if (centerComponent) {
      console.log('center');
      return centerComponent;
    }
    console.log('notcenter', title);

    return (
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={{fontSize: 20, color: colors.icons}}>
        {title}
      </Text>
    );
  };

  render() {
    const {...otherProps} = this.props;

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
        leftContainerStyle={{flex: 0}}
        rightContainerStyle={{flex: 0}}
        centerContainerStyle={{
          flex: 1,
        }}
        {...otherProps}
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
