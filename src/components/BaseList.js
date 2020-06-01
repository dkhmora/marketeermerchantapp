import React from 'react';
import {Container, List, Fab, Icon} from 'native-base';
import BaseListItem from './BaseListItem';

export default function BaseList({route, navigation}) {
  const {
    pageCategory,
    categoryItems,
    leftTextKey,
    middleTextKey,
    fabButton,
  } = route.params;

  const ListItems = () => {
    const listItem = categoryItems.map((item, index) => {
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

  const ButtonFab = () => {
    if (fabButton) {
      return (
        <Fab
          position="bottomRight"
          style={{backgroundColor: '#5B0EB5'}}
          onPress={() =>
            navigation
              .dangerouslyGetParent()
              .navigate('Add Item', {pageCategory})
          }>
          <Icon name="add" />
        </Fab>
      );
    }
    return null;
  };

  if (ListItems) {
    return (
      <Container style={{flex: 1}}>
        <List>
          <ListItems />
        </List>
        <ButtonFab />
      </Container>
    );
  }
}

BaseList.defaultProps = {
  fabButton: false,
};
