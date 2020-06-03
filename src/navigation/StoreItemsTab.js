import React, {Component} from 'react';
import {Container} from 'native-base';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import BaseList from '../components/BaseList';
import ItemsList from '../components/ItemsList';
import {NavigationContainer, useLinkProps} from '@react-navigation/native';
import BaseHeader from '../components/BaseHeader';
import AnimatedLoader from 'react-native-animated-loader';
import {StyleSheet} from 'react-native';
import {observer, inject} from 'mobx-react';

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
@inject('authStore')
@inject('detailsStore')
@inject('itemsStore')
@observer
class StoreItemsTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {storeCategories} = this.props.detailsStore;
    const {name} = this.props.route;
    const {navigation} = this.props;

    const scroll = storeCategories.length > 2 ? true : false;

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={name} optionsButton navigation={navigation} />

        <TabBase.Navigator
          tabBarOptions={{
            scrollEnabled: scroll,
            style: {backgroundColor: '#E91E63'},
            activeTintColor: '#fff',
            inactiveTintcolor: '#eee',
            indicatorStyle: {backgroundColor: '#FFEB3B'},
          }}>
          {storeCategories.map((category, index) => {
            this.props.itemsStore.setCategoryItems(category);

            return (
              <TabBase.Screen
                name={`${category}`}
                component={ItemsList}
                key={index}
                initialParams={{
                  category,
                }}
              />
            );
          })}
        </TabBase.Navigator>
      </Container>
    );
  }
}

StoreItemsTab.defaultProps = {
  categories: [],
  items: [],
  fabButton: false,
};

export default StoreItemsTab;
