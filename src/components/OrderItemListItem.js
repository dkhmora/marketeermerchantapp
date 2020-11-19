import React, {PureComponent} from 'react';
import {CardItem, Text, View} from 'native-base';
import {observer} from 'mobx-react';
import {colors} from '../../assets/colors';
import FastImage from 'react-native-fast-image';
import {Fade, Placeholder, PlaceholderMedia} from 'rn-placeholder';
import CustomizationOptionsList from './store_items/food/CustomizationOptionsList';
import {StyleSheet} from 'react-native';

@observer
class OrderItemCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      imageReady: false,
    };
  }

  render() {
    const {
      props: {
        item: {
          name,
          description,
          quantity,
          price,
          discountedPrice,
          image,
          selectedOptions,
          specialInstructions,
        },
        ...otherProps
      },
      state: {imageReady},
    } = this;
    const url = image
      ? {uri: `https://cdn.marketeer.ph${image}`}
      : require('../../assets/placeholder.jpg');
    const itemPrice = discountedPrice ? discountedPrice : price;

    return (
      <CardItem
        {...otherProps}
        bordered
        style={{
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: 5,
          paddingTop: 0,
          flexDirection: 'column',
        }}>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}>
          <View
            style={{
              elevation: 3,
              borderRadius: 10,
              height: 55,
              width: 55,
              overflow: 'hidden',
              backgroundColor: colors.icons,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.divider,
            }}>
            <FastImage
              key={name}
              source={url}
              style={{
                height: 55,
                width: 55,
                backgroundColor: colors.primary,
              }}
              resizeMode={FastImage.resizeMode.cover}
              onLoad={() => this.setState({imageReady: true})}
            />
          </View>

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
            <Text style={{fontFamily: 'ProductSans-Bold', fontSize: 18}}>
              {name}
            </Text>

            <Text
              numberOfLines={2}
              style={{
                fontFamily: 'ProductSans-Regular',
                fontSize: 14,
                color: colors.text_secondary,
              }}>
              {description}
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
                fontFamily: 'ProductSans-Regular',
                fontSize: 16,
                color: colors.text_primary,
              }}>
              ₱{itemPrice}
            </Text>

            <Text
              style={{
                color: colors.text_secondary,
                borderBottomColor: colors.divider,
                borderBottomWidth: 1,
                textAlign: 'right',
                width: '100%',
                fontSize: 12,
              }}>
              x{quantity}
            </Text>

            <Text
              style={{
                fontFamily: 'ProductSans-Black',
                fontSize: 18,
                color: colors.text_primary,
              }}>
              ₱{itemPrice * quantity}
            </Text>
          </View>
        </View>

        <View style={{width: '100%'}}>
          <CustomizationOptionsList
            selectedOptions={selectedOptions}
            specialInstructions={specialInstructions}
          />
        </View>
      </CardItem>
    );
  }
}

export default OrderItemCard;
