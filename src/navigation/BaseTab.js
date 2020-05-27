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
  const {categories, collection, leftTextKey, middleTextKey} = route.params;

  console.log(route.params.leftTextKey);

  const scroll = categories.length > 2 ? true : false;

  return (
    <NavigationContainer theme={NavigationTheme} independent={true}>
      <TabBase.Navigator tabBarOptions={{scrollEnabled: scroll}}>
        {categories.map((category) => {
          return (
            <TabBase.Screen
              name={`${category.name}`}
              component={BaseList}
              initialParams={{
                categories,
                collection,
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
