import {CardItem} from 'native-base';
import React, {Component} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-elements';
import {colors} from '../../assets/colors';

class CardItemHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      title,
      onPress,
      activeOpacity,
      style,
      titleStyle,
      rightComponent,
      leftComponent,
      ...otherProps
    } = this.props;

    return (
      <CardItem
        header
        bordered
        activeOpacity={activeOpacity}
        button={onPress !== undefined}
        onPress={() => onPress()}
        style={{
          backgroundColor: colors.icons,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 10,
          height: 60,
          elevation: 2,
          ...style,
        }}
        {...otherProps}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            {React.isValidElement(leftComponent) ? leftComponent : null}

            {typeof title === 'string' ? (
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: 'ProductSans-Bold',
                  fontSize: 20,
                  paddingLeft: 10,
                  ...titleStyle,
                }}>
                {title}
              </Text>
            ) : (
              title
            )}
          </View>

          {React.isValidElement(rightComponent) ? rightComponent : null}
        </View>
      </CardItem>
    );
  }
}

export default CardItemHeader;
