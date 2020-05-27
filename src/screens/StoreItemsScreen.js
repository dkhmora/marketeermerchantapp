import React from 'react';
import {Container} from 'native-base';
import {createStackNavigator} from '@react-navigation/stack';
import BaseHeader from '../components/BaseHeader';
import BaseTab from '../navigation/BaseTab';

const StackOrder = createStackNavigator();

export const StoreItemsScreen = ({navigation}) => {
  const categories = [
    {
      name: 'Fruits',
    },
    {
      name: 'Vegetables',
    },
    {
      name: 'Drinks',
    },
    {
      name: 'Others',
    },
  ];

  const collection = 'items';
  const leftTextKey = 'itemId';
  const middleTextKey = 'userId';

  return (
    <Container>
      <BaseHeader title="Store Items" optionsButton navigation={navigation} />

      <StackOrder.Navigator initialRouteName="Item Tab" headerMode="none">
        <StackOrder.Screen
          name="Item Tab"
          component={BaseTab}
          j
          initialParams={{categories, collection, leftTextKey, middleTextKey}}
        />
      </StackOrder.Navigator>
    </Container>
  );
};
