import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Container} from 'native-base';
// Custom Components
import OrdersList from '../components/OrdersList';
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
            indicatorStyle: {backgroundColor: '#FFC107'},
          }}
          headerMode="none">
          <TabOrders.Screen
            name="Pending"
            component={OrdersList}
            initialParams={{
              storeFunctionName: 'setPendingOrders',
              storeVarName: 'pendingOrders',
              buttonText: 'accept',
            }}
          />
          <TabOrders.Screen
            name="Accepted"
            component={OrdersList}
            initialParams={{
              storeFunctionName: 'setAcceptedOrders',
              storeVarName: 'acceptedOrders',
              buttonText: 'ship',
            }}
          />
          <TabOrders.Screen
            name="Shipped"
            component={OrdersList}
            initialParams={{
              storeFunctionName: 'setShippedOrders',
              storeVarName: 'shippedOrders',
            }}
          />
          <TabOrders.Screen
            name="Completed"
            component={OrdersList}
            initialParams={{
              storeFunctionName: 'setCompletedOrders',
              storeVarName: 'completedOrders',
            }}
          />
          <TabOrders.Screen
            name="Cancelled"
            component={OrdersList}
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
