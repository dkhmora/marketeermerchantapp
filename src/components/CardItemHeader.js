import {CardItem} from 'native-base';
import React, {Component} from 'react';
import {Text} from 'react-native-elements';
import {colors} from '../../assets/colors';

class CardItemHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {title, onPress, activeOpacity} = this.props;

    return (
      <CardItem
        header
        bordered
        activeOpacity={activeOpacity}
        button={onPress !== undefined}
        onPress={() => onPress()}
        style={{
          backgroundColor: colors.icons,
          justifyContent: 'space-between',
          paddingTop: 0,
          paddingBottom: 0,
          height: 60,
          elevation: 2,
        }}>
        {typeof title === 'string' ? (
          <Text style={{color: colors.primary, fontSize: 20}}>{title}</Text>
        ) : (
          title
        )}
      </CardItem>
    );
  }
}

export default CardItemHeader;
