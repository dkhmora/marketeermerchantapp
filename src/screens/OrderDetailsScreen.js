import React from 'react';
import {Container} from 'native-base';
import BaseHeader from '../components/BaseHeader';

export default function OrderDetailsScreen({route}) {
  const {navigation, orderId} = route.params;

  const actions = [
    {
      name: 'Accept Order',
      action: 'navigation.navigate("Order List")',
    },
  ];

  return (
    <Container>
      <BaseHeader
        title={`Order #${orderId} Details`}
        backButton
        optionsButton
        actions={actions}
        navigation={navigation}
      />
    </Container>
  );
}
