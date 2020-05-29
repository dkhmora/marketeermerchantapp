import React from 'react';
import {Container} from 'native-base';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import BaseList from '../components/BaseList';
import {NavigationContainer} from '@react-navigation/native';
import BaseHeader from '../components/BaseHeader';

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

export default function BaseTab({route, navigation}) {
  const {
    categories,
    items,
    leftTextKey,
    middleTextKey,
    fabButton,
  } = route.params;

  const scroll = categories.length > 2 ? true : false;

  return (
    <Container style={{flex: 1}}>
      <BaseHeader title={route.name} optionsButton navigation={navigation} />

      <NavigationContainer theme={NavigationTheme} independent={true}>
        <TabBase.Navigator tabBarOptions={{scrollEnabled: scroll}}>
          {categories.map((category, index) => {
            const pageCategory = category;
            const categoryItems = items.filter((item) => {
              return item.category === category;
            });
            return (
              <TabBase.Screen
                name={`${category}`}
                component={BaseList}
                key={index}
                initialParams={{
                  pageCategory,
                  categoryItems,
                  leftTextKey,
                  middleTextKey,
                  fabButton,
                }}
              />
            );
          })}
        </TabBase.Navigator>
      </NavigationContainer>
    </Container>
  );
}
