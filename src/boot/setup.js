import React, {Component} from 'react';
import App from '../App';
// For theme
import {StyleProvider, Button, Container, Text} from 'native-base';
import getTheme from '../theme/components';
import variables from '../theme/variables/commonColor';
import material from '../theme/variables/material';
import {ThemeProvider} from 'react-native-elements';
import {colors} from '../../assets/colors';

const theme = {
  BaseHeader: {
    titleStyle: {color: colors.icons},
  },
  Icon: {
    type: 'feather',
  },
  Text: {
    style: {
      color: colors.text_primary,
      fontFamily: 'ProductSans-Light',
    },
  },
  Button: {
    titleStyle: {
      color: colors.primary,
      fontFamily: 'ProductSans-Bold',
    },
  },
  Avatar: {
    titleStyle: {
      fontFamily: 'ProductSans-Light',
      color: colors.primary,
    },
  },
  ListItem: {
    titleStyle: {
      fontSize: 16,
      fontFamily: 'ProductSans-Light',
    },
  },
};
class Setup extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
  }
}

export default Setup;
