import React, {Component} from 'react';
import {Container} from 'native-base';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ItemsList from '../components/ItemsList';
import BaseHeader from '../components/BaseHeader';
import {observer, inject} from 'mobx-react';

const TabBase = createMaterialTopTabNavigator();
@inject('itemsStore')
@observer
class StoreItemsTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {itemCategories} = this.props.itemsStore;
    const {name} = this.props.route;
    const {navigation} = this.props;

    const scroll = itemCategories.length > 2 ? true : false;

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={name} optionsButton navigation={navigation} />

        <TabBase.Navigator
          tabBarOptions={{
            scrollEnabled: scroll,
            style: {backgroundColor: '#E91E63'},
            activeTintColor: '#fff',
            inactiveTintcolor: '#eee',
            indicatorStyle: {backgroundColor: '#FFC107'},
          }}>
          {itemCategories.map((category, index) => {
            this.props.itemsStore.setCategoryItems(category);

            return (
              <TabBase.Screen
                name={`${category}`}
                component={ItemsList}
                key={index}
                initialParams={{
                  category,
                  navigation,
                }}
              />
            );
          })}
        </TabBase.Navigator>
      </Container>
    );
  }
}

export default StoreItemsTab;
