import React, {useEffect, useState} from 'react';
import {
  Card,
  CardItem,
  Left,
  Body,
  Text,
  Button,
  Right,
  Icon,
  View,
} from 'native-base';
import {Image} from 'react-native';
import moment, {ISO_8601} from 'moment';
import OptionsMenu from 'react-native-options-menu';
import storage from '@react-native-firebase/storage';
export default function ItemCard(props) {
  const {
    name,
    image,
    description,
    price,
    stock,
    sales,
    unit,
    createdAt,
    ...otherProps
  } = props;

  const timeStamp = moment(createdAt, ISO_8601).fromNow();

  const [url, setUrl] = useState('');

  const ref = storage().ref(image);

  const getImage = async () => {
    const link = await ref.getDownloadURL();
    console.log(link);
    setUrl(link);
  };
  useEffect(() => {
    getImage();
  });

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
          <Left>
            <Body>
              <Text style={{color: '#fff'}}>{name}</Text>
              <Text note style={{color: '#ddd'}}>
                Left Stock: {stock}
              </Text>
            </Body>
          </Left>
          <Right style={{marginLeft: '-50%'}}>
            <Button transparent>
              <OptionsMenu
                customButton={
                  <Icon
                    active
                    name="dots-three-vertical"
                    type="Entypo"
                    style={{color: '#fff'}}
                  />
                }
                destructiveIndex={1}
                options={['Delete Item']}
                actions={[]}
              />
            </Button>
          </Right>
        </CardItem>
        <CardItem cardBody>
          {url ? (
            <Image
              source={{uri: url}}
              style={{height: 150, width: null, flex: 1}}
            />
          ) : (
            <Image
              source={require('../../assets/placeholder.jpg')}
              style={{height: 150, width: null, flex: 1}}
            />
          )}
        </CardItem>
        <CardItem
          bordered
          style={{
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            position: 'relative',
            bottom: 20,
          }}>
          <Body>
            <Text>{description}</Text>
          </Body>
        </CardItem>
        <CardItem bordered style={{bottom: 20}}>
          <Body>
            <Text>
              ₱{price}/{unit}
            </Text>
          </Body>
        </CardItem>
        <CardItem footer bordered style={{bottom: 20, marginBottom: -20}}>
          <Left>
            <Text note>Created {timeStamp}</Text>
          </Left>
          <Right>
            <Button rounded light>
              <Text>Edit</Text>
            </Button>
          </Right>
        </CardItem>
      </Card>
    </View>
  );
}

ItemCard.defaultProps = {
  editable: false,
};
