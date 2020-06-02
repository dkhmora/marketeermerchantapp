import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Container} from 'native-base';
// Custom Components
import OrdersFlatList from '../components/OrdersFlatList';
import BaseHeader from '../components/BaseHeader';

const TabOrders = createMaterialTopTabNavigator();

class OrdersTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {name} = this.props.route;
    const {navigation} = this.props;

    return (
      <Container>
        <BaseHeader title={name} optionsButton navigation={navigation} />
        <TabOrders.Navigator
          tabBarOptions={{
            scrollEnabled: true,
            style: {backgroundColor: '#E91E63'},
            activeTintColor: '#fff',
            inactiveTintcolor: '#eee',
            indicatorStyle: {backgroundColor: '#FFEB3B'},
          }}
          headerMode="none">
          <TabOrders.Screen
            name="Pending"
            component={OrdersFlatList}
            initialParams={{
              storeFunctionName: 'setPendingOrders',
              storeVarName: 'pendingOrders',
            }}
          />
          <TabOrders.Screen
            name="Accepted"
            component={OrdersFlatList}
            initialParams={{
              storeFunctionName: 'setAcceptedOrders',
              storeVarName: 'acceptedOrders',
            }}
          />
          <TabOrders.Screen
            name="Shipped"
            component={OrdersFlatList}
            initialParams={{
              storeFunctionName: 'setShippedOrders',
              storeVarName: 'shippedOrders',
            }}
          />
          <TabOrders.Screen
            name="Completed"
            component={OrdersFlatList}
            initialParams={{
              storeFunctionName: 'setCompletedOrders',
              storeVarName: 'completedOrders',
            }}
          />
          <TabOrders.Screen
            name="Cancelled"
            component={OrdersFlatList}
            initialParams={{
              storeFunctionName: 'setCancelledOrders',
              storeVarName: 'cancelledOrders',
            }}
          />
        </TabOrders.Navigator>
      </Container>
    );
  }
}

export default OrdersTab;
