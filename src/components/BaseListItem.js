import React from 'react';
import {
  Text,
  ListItem,
  Body,
  Right,
  Icon,
  Left,
  Input,
  Item,
} from 'native-base';

export default function BaseListItem(props) {
  const {
    image = '',
    leftText,
    middleText,
    editable,
    index,
    ...otherProps
  } = props;

  return (
    <ListItem {...otherProps} button={true} style={{minHeight: 80}} key={index}>
      <Left style={{flex: 7}}>{leftText ? <Text>{leftText}</Text> : null}</Left>
      <Body style={{flex: 9}}>
        {editable ? (
          <Item rounded>
            <Input placeholder="Edit" value={middleText} />
          </Item>
        ) : (
          <Text>{middleText}</Text>
        )}
      </Body>
      <Right style={{flex: 1}}>
        <Icon name="arrow-forward" />
      </Right>
    </ListItem>
  );
}

BaseListItem.defaultProps = {
  editable: false,
};
