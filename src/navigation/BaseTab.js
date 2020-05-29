import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import BaseList from '../components/BaseList';
import {NavigationContainer} from '@react-navigation/native';

const TabBase = createMaterialTopTabNavigator();

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
/*
const categories = [{
  name: 'Fruits',
  leftTextKey: 'name',
  middleTextKey: 'price'
}]; */

export default function BaseTab({route}) {
  const {categories, items, leftTextKey, middleTextKey} = route.params;

  const scroll = categories.length > 2 ? true : false;

  return (
    <NavigationContainer theme={NavigationTheme} independent={true}>
      <TabBase.Navigator tabBarOptions={{scrollEnabled: scroll}}>
        {categories.map((category, index) => {
          return (
            <TabBase.Screen
              name={`${category}`}
              component={BaseList}
              key={index}
              initialParams={{
                category,
                items,
                leftTextKey,
                middleTextKey,
              }}
            />
          );
        })}
      </TabBase.Navigator>
    </NavigationContainer>
  );
}
