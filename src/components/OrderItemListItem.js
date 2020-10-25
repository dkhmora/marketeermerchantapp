import React, {PureComponent} from 'react';
import {CardItem, Text, View} from 'native-base';
import {observer} from 'mobx-react';
import {colors} from '../../assets/colors';
import FastImage from 'react-native-fast-image';
import {Fade, Placeholder, PlaceholderMedia} from 'rn-placeholder';

@observer
class OrderItemCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      imageReady: false,
    };
  }

  render() {
    const {item, ...otherProps} = this.props;
    const {imageReady} = this.state;
    const url = item.image
      ? {uri: `https://cdn.marketeer.ph${item.image}`}
      : require('../../assets/placeholder.jpg');

    return (
      <CardItem
        bordered
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          paddingBottom: 5,
          paddingTop: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
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
            onLoad={() => this.setState({imageReady: true})}
          />

          {!imageReady && (
            <View
              style={{
                position: 'absolute',
              }}>
              <Placeholder Animation={Fade}>
                <PlaceholderMedia
                  style={{
                    backgroundColor: colors.primary,
                    aspectRatio: 1,
                    width: 55,
                    height: 55,
                    borderRadius: 10,
                  }}
                />
              </Placeholder>
            </View>
          )}

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
              ₱{item.price}
            </Text>

            <Text
              style={{
                color: colors.text_secondary,
                borderBottomColor: colors.divider,
                borderBottomWidth: 1,
                textAlign: 'right',
                width: '100%',
              }}>
              x{item.quantity}
            </Text>

            <Text
              style={{
                fontFamily: 'ProductSans-Black',
                fontSize: 18,
                color: colors.text_primary,
              }}>
              ₱{item.price * item.quantity}
            </Text>
          </View>
        </View>
      </CardItem>
    );
  }
}

export default OrderItemCard;
