import React, {Component} from 'react';
import App from '../App';
// For theme
import {ThemeProvider} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {View, ActivityIndicator} from 'react-native';
import {inject, observer} from 'mobx-react';

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
    containerStyle: {
      borderRadius: 24,
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
  Input: {
    inputStyle: {
      fontFamily: 'ProductSans-Light',
    },
    placeholderTextColor: colors.text_secondary,
  },
  CheckBox: {
    checkedColor: colors.accent,
    fontFamily: 'ProductSans-Light',
    containerStyle: {
      borderRadius: 30,
      backgroundColor: colors.icons,
      borderColor: colors.icons,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
  },
};

@inject('authStore')
@observer
class Setup extends Component {
  componentDidMount() {}

  render() {
    const {appReady} = this.props.authStore;

    return (
      <ThemeProvider theme={theme}>
        <App />

        {!appReady && (
          <View
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </ThemeProvider>
    );
  }
}

export default Setup;
