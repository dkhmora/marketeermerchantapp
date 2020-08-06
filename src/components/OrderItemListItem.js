import React, {PureComponent} from 'react';
import {CardItem, Text, View} from 'native-base';
import {observer} from 'mobx-react';
import storage from '@react-native-firebase/storage';
import {colors} from '../../assets/colors';
import FastImage from 'react-native-fast-image';
import Toast from './Toast';

@observer
class OrderItemCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      url: require('../../assets/placeholder.jpg'),
    };
  }

  getImage = async () => {
    const ref = storage().ref(this.props.item.image);
    const link = await ref
      .getDownloadURL()
      .catch((err) => Toast({text: err, type: 'danger'}));

    if (link) {
      this.setState({url: {uri: link}});
    }
  };

  componentDidMount() {
    if (this.props.item.image) {
      this.getImage();
    }
  }

  render() {
    const {item, ...otherProps} = this.props;
    const {url} = this.state;

    return (
      <CardItem bordered>
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 8,
          }}>
          <FastImage
            key={item.name}
            source={url}
            style={{
              height: 55,
              width: 55,
              borderColor: colors.primary,
              borderWidth: 1,
              borderRadius: 10,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              paddingHorizontal: 10,
            }}>
            <Text style={{fontFamily: 'ProductSans-Regular', fontSize: 18}}>
              {item.name}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                fontFamily: 'ProductSans-Light',
                fontSize: 14,
                color: colors.text_secondary,
              }}>
              {item.description}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
            }}>
            <Text
              style={{
                fontFamily: 'ProductSans-Black',
                fontSize: 16,
                color: colors.text_primary,
              }}>
              ₱ {item.price}
            </Text>
            <Text
              style={{
                color: colors.text_secondary,
                borderBottomColor: colors.divider,
                borderBottomWidth: 1,
                textAlign: 'right',
                width: '100%',
              }}>
              x {item.quantity}
            </Text>
            <Text
              style={{
                fontFamily: 'ProductSans-Black',
                fontSize: 18,
                color: colors.text_primary,
              }}>
              ₱ {item.price * item.quantity}
            </Text>
          </View>
        </View>
      </CardItem>
    );
  }
}

export default OrderItemCard;
