import React from 'react';
import {View, Dimensions, Text} from 'react-native';
import {Container, List} from 'native-base';
import BaseListItem from '../components/BaseListItem';
import BaseHeader from '../components/BaseHeader';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

const orderItems = {
  item1: true,
  item2: true,
  item3: true,
};

const categories = ['Fruits', 'Vegetables', 'Some Other'];

function ItemListItems() {
  const listItem = items.map((item, index) => {
    const orderId = item.orderId;
    const userId = item.userId;
    return (
      <BaseListItem keyText={`${orderId}`} valueText={userId} key={index} />
    );
  });
  return listItem;
}

const ItemList = ({route}) => {
  const {navigation, category} = route.params;
  return (
    <List style={{flex: 1}} listBorderColor="red">
      <Text>{category}</Text>
    </List>
  );
};

export const StoreItemsScreen = ({navigation}) => {
  const TabItem = createMaterialTopTabNavigator();

  const NavigationTheme = {
    dark: false,
    colors: {
      primary: '#5B0EB5',
      background: '#fff',
      card: '#fff',
      text: '#1A191B',
      border: '#eee',
    },
  };

  const ItemTab = () => {
    const scroll = categories.length > 2 ? true : false;
    return (
      <TabItem.Navigator tabBarOptions={{scrollEnabled: scroll}}>
        {categories.map((category) => {
          return (
            <TabItem.Screen
              name={`${category}`}
              component={ItemList}
              initialParams={{category}}
            />
          );
        })}
      </TabItem.Navigator>
    );
  };

  const StackOrder = createStackNavigator();

  return (
    <NavigationContainer theme={NavigationTheme} independent={true}>
      <BaseHeader title="Store Items" optionsButton navigation={navigation} />

      <StackOrder.Navigator initialRouteName="Item Tab" headerMode="none">
        <StackOrder.Screen name="Item Tab" component={ItemTab} />
      </StackOrder.Navigator>
    </NavigationContainer>
  );
};
