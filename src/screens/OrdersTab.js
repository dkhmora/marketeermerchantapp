import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import BaseHeader from '../components/BaseHeader';
import {Container, Text} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';

import {inject, observer} from 'mobx-react';
import BaseFlatList from '../components/BaseFlatList';

const TabOrders = createMaterialTopTabNavigator();

@inject('orderStore')
@inject('authStore')
@observer
class OrdersTab extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orderCategories: [
        'pending',
        'accepted',
        'shipped',
        'completed',
        'canceled',
      ],
    };
  }

  renderItem = ({item}) => {
    return <Text>{item.id}</Text>;
  };

  render() {
    const {orderCategories} = this.state;
    const {name} = this.props.route;
    const {navigation} = this.props;

    const scroll = orderCategories.length > 2 ? true : false;

    return (
      <Container>
        <BaseHeader title={name} optionsButton navigation={navigation} />
        <TabOrders.Navigator
          tabBarOptions={{
            scrollEnabled: scroll,
            style: {backgroundColor: '#E91E63'},
            activeTintColor: '#fff',
            inactiveTintcolor: '#eee',
            indicatorStyle: {backgroundColor: '#FFEB3B'},
          }}
          labelStyle={{activeTintColor: '#fff'}}
          headerMode="none">
          <TabOrders.Screen
            name="Pending"
            component={BaseFlatList}
            initialParams={{
              storeFunctionName: 'setPendingOrders',
              storeVarName: 'pendingOrders',
              leftTextKey: 'orderNumber',
              middleTextKey: 'user',
              fabButton: false,
            }}
          />
          <TabOrders.Screen
            name="Accepted"
            component={BaseFlatList}
            initialParams={{
              storeFunctionName: 'setAcceptedOrders',
              storeVarName: 'acceptedOrders',
              leftTextKey: 'orderNumber',
              middleTextKey: 'userId',
              fabButton: false,
            }}
          />
          <TabOrders.Screen
            name="Shipped"
            component={BaseFlatList}
            initialParams={{
              storeFunctionName: 'setShippedOrders',
              storeVarName: 'shippedOrders',
              leftTextKey: 'orderNumber',
              middleTextKey: 'userId',
              fabButton: false,
            }}
          />
          <TabOrders.Screen
            name="Completed"
            component={BaseFlatList}
            initialParams={{
              storeFunctionName: 'setCompletedOrders',
              storeVarName: 'completedOrders',
              leftTextKey: 'orderNumber',
              middleTextKey: 'userId',
              fabButton: false,
            }}
          />
          <TabOrders.Screen
            name="Cancelled"
            component={BaseFlatList}
            initialParams={{
              storeFunctionName: 'setCancelledOrders',
              storeVarName: 'cancelledOrders',
              leftTextKey: 'orderNumber',
              middleTextKey: 'userId',
              fabButton: false,
            }}
          />
        </TabOrders.Navigator>
      </Container>
    );
  }
}

export default OrdersTab;
