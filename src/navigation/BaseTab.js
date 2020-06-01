import React, {useEffect} from 'react';
import {Container} from 'native-base';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import BaseList from '../components/BaseList';
import {NavigationContainer, useLinkProps} from '@react-navigation/native';
import BaseHeader from '../components/BaseHeader';
import AnimatedLoader from 'react-native-animated-loader';
import {StyleSheet} from 'react-native';

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

export default function BaseTab({route, navigation}) {
  const {
    categories,
    items,
    leftTextKey,
    middleTextKey,
    fabButton,
  } = route.params;

  useEffect(() => {
    return console.log(items);
  }, [items]);

  if (categories) {
    console.log(categories);
    const scroll = categories.length > 2 ? true : false;

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={route.name} optionsButton navigation={navigation} />

        <NavigationContainer theme={NavigationTheme} independent={true}>
          <TabBase.Navigator tabBarOptions={{scrollEnabled: scroll}}>
            {categories.map((category, index) => {
              const pageCategory = category;
              let categoryItems = [];

              route.name === 'Order Tab'
                ? (categoryItems = items.filter((item) => {
                    return item.orderStatus[`${category}`].status === true;
                  }))
                : (categoryItems = items.filter((item) => {
                    return item.category === category;
                  }));
              console.log(categoryItems);

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

  return (
    <AnimatedLoader
      visible={true}
      overlayColor="rgba(255,255,255,0.75)"
      source={require('../../assets/loader.json')}
      animationStyle={styles.lottie}
      speed={1}
    />
  );
}

BaseTab.defaultProps = {
  categories: [],
  items: [],
  fabButton: false,
};

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
});
