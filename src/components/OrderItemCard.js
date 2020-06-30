import React, {Component} from 'react';
import {Card, CardItem, Left, Body, Right, Text, View, H3} from 'native-base';
import {Image} from 'react-native';
import {observer} from 'mobx-react';
import {observable} from 'mobx';
import storage from '@react-native-firebase/storage';
import {colors} from '../../assets/colors';

@observer
class OrderItemCard extends Component {
  constructor(props) {
    super(props);
  }

  @observable url = null;

  getImage = async () => {
    const ref = storage().ref(this.props.image);
    const link = await ref.getDownloadURL();
    this.url = link;
  };

  componentDidMount() {
    if (this.props.image) {
      console.log(this.props.image);
      this.getImage();
    }
  }

  render() {
    const {item, ...otherProps} = this.props;

    return (
      <CardItem bordered>
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 8,
          }}>
          {this.url ? (
            <Image
              source={{uri: this.url}}
              style={{
                height: 55,
                aspectRatio: 1,
                borderColor: colors.primary,
                borderWidth: 1,
                borderRadius: 10,
                width: null,
                backgroundColor: '#e1e4e8',
              }}
            />
          ) : (
            <Image
              source={require('../../assets/placeholder.jpg')}
              style={{
                height: 55,
                aspectRatio: 1,
                borderColor: colors.primary,
                borderWidth: 1,
                borderRadius: 10,
                width: null,
                backgroundColor: '#e1e4e8',
              }}
            />
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
                color: colors.text_secondary,
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
            <Text style={{fontFamily: 'ProductSans-Black', fontSize: 18}}>
              ₱ {item.price * item.quantity}
            </Text>
          </View>
        </View>
      </CardItem>
    );
  }
}

export default OrderItemCard;
