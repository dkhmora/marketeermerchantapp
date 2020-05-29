import React from 'react';
import {Container, List} from 'native-base';
import BaseListItem from './BaseListItem';

export default function BaseList({navigation, route}) {
  const {category, items, leftTextKey, middleTextKey} = route.params;

  const ListItems = () => {
    const listItem = items.map((item, index) => {
      return (
        <BaseListItem
          leftText={`${item[`${leftTextKey}`]}`}
          middleText={`${item[`${middleTextKey}`]}`}
          key={index}
        />
      );
    });
    return listItem;
  };

  return (
    <Container style={{flex: 1}}>
      <List>
        <ListItems />
      </List>
    </Container>
  );
}
