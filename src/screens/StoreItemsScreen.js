import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {observer, inject} from 'mobx-react';
// Custom Components
import StoreItemsTab from '../navigation/StoreItemsTab';
import AddItemScreen from './AddItemScreen';

const StackOrder = createStackNavigator();
@inject('authStore')
@inject('detailsStore')
@inject('itemsStore')
@observer
class StoreItemsScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.itemsStore.setStoreItems(
      this.props.authStore.merchantId,
      this.props.detailsStore.storeCategories,
    );
  }

  render() {
    return (
      <StackOrder.Navigator initialRouteName="Store Items" headerMode="none">
        <StackOrder.Screen
          name="Store Items"
          component={StoreItemsTab}
          initialParams={{
            leftTextKey: 'price',
            middleTextKey: 'description',
            fabButton: true,
          }}
        />
        <StackOrder.Screen name="Add Item" component={AddItemScreen} />
      </StackOrder.Navigator>
    );
  }
}

export default StoreItemsScreen;
