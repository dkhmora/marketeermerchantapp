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
  const {keyText, valueText, editable, ...otherProps} = props;

  return (
    <ListItem {...otherProps} button={true} style={{minHeight: 80}}>
      <Left style={{flex: 7}}>
        <Text>{keyText}</Text>
      </Left>
      <Body style={{flex: 9}}>
        {editable ? (
          <Item rounded>
            <Input placeholder="Edit" value={valueText} />
          </Item>
        ) : (
          <Text>{valueText}</Text>
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
