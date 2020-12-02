import React from 'react';
import {View, Text} from 'react-native';
import {Badge, Icon} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {checkVarType} from '../util/helpers';

export default function ChatIcon({badgeCount}) {
  return (
    <View style={{alignItems: 'center'}}>
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 5,
          paddingTop: 5,
        }}>
        <Icon name="message-square" color={colors.primary} />

        {checkVarType(badgeCount, 'number') && badgeCount > 0 && (
          <Badge
            value={badgeCount}
            badgeStyle={{
              backgroundColor: colors.accent,
            }}
            containerStyle={{
              position: 'absolute',
              top: 0,
              right: 0,
            }}
          />
        )}
      </View>

      <Text style={{color: colors.primary}}>Chat</Text>
    </View>
  );
}
