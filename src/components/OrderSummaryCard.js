import React, {Component} from 'react';
import {Card, CardItem, Left, Body, Right, Text, View, H3} from 'native-base';
import {Image} from 'react-native';
import {observer} from 'mobx-react';
import {observable} from 'mobx';
import storage from '@react-native-firebase/storage';

@observer
class OrderSummaryCard extends Component {
  constructor(props) {
    super(props);
  }

  @observable url = '';

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
    const {
      name,
      image,
      price,
      unit,
      quantity,
      createdAt,
      ...otherProps
    } = this.props;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          marginHorizontal: 6,
          marginVertical: 3,
        }}>
        <Card
          {...otherProps}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
          }}>
          <CardItem header bordered style={{backgroundColor: '#E91E63'}}>
            <Text style={{color: '#fff'}}>Order Items</Text>
          </CardItem>
          <CardItem>
            <Left>
              <Image
                source={{uri: this.url}}
                style={{
                  height: 80,
                  aspectRatio: 1,
                  borderRadius: 24,
                  borderWidth: 1,
                  width: null,
                  backgroundColor: '#e1e4e8',
                }}
              />
            </Left>
            <Body
              style={{
                justifyContent: 'center',
                marginHorizontal: '-30%',
              }}>
              <Text>{name}</Text>
            </Body>
            <Right>
              <Text>₱{price}</Text>
              <Text note>x {quantity}</Text>
            </Right>
          </CardItem>
        </Card>
      </View>
    );
  }
}

export default OrderSummaryCard;
