import React from 'react';
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
import moment, {ISO_8601} from 'moment';
import OptionsMenu from 'react-native-options-menu';

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

  return (
    <View style={{flex: 1, flexDirection: 'column'}}>
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
                Left Stock {stock}
              </Text>
            </Body>
          </Left>
          <Right>
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
        <CardItem bordered>
          <Left>
            <Text>Image:</Text>
          </Left>
          <Right>
            <Text>{image}</Text>
          </Right>
        </CardItem>
        <CardItem bordered>
          <Left>
            <Text>Description:</Text>
          </Left>
          <Right>
            <Text>{description}</Text>
          </Right>
        </CardItem>
        <CardItem bordered>
          <Left>
            <Text>Price:</Text>
          </Left>
          <Right>
            <Text>{price}</Text>
          </Right>
        </CardItem>
        <CardItem bordered>
          <Left>
            <Text>Unit:</Text>
          </Left>
          <Right>
            <Text>{unit}</Text>
          </Right>
        </CardItem>
        <CardItem footer bordered>
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
