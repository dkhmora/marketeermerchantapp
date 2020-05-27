import React from 'react';
import {Container, List} from 'native-base';
import BaseListItem from './BaseListItem';

export default function BaseList({route}) {
  const {
    navigation,
    categories,
    collection,
    leftTextKey,
    middleTextKey,
  } = route.params;
  // TODO: Fetch document Ids using firestore using category and collection props

  let items;

  switch (collection) {
    case 'orders':
      items = [
        {
          orderId: 200000,
          isAccepted: false,
          isCanceled: false,
          isShipped: false,
          userId: 'qwlhelqhl2h3h1h3k1',
        },
        {
          orderId: 200001,
          isAccepted: false,
          isCanceled: false,
          isShipped: false,
          userId: 'qwlhelqhl2h3h1h3k2',
        },
        {
          orderId: 200002,
          isAccepted: false,
          isCanceled: false,
          isShipped: false,
          userId: 'qwlhelqhl2h3h1h3k3',
        },
      ];
      break;
    case 'items':
      items = [
        {
          itemId: 'item na ko',
          isAccepted: false,
          isCanceled: false,
          isShipped: false,
          userId: 'qwlhelqhl2h3h1h3k1',
        },
        {
          itemId: 'item na ko2',
          isAccepted: false,
          isCanceled: false,
          isShipped: false,
          userId: 'qwlhelqhl2h3h1h3k2',
        },
        {
          itemId: 'item na ko3',
          isAccepted: false,
          isCanceled: false,
          isShipped: false,
          userId: 'qwlhelqhl2h3h1h3k3',
        },
      ];
      break;
  }

  // Store fetched firebase data here

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
