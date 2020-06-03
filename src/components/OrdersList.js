import React, {Component} from 'react';
import {FlatList} from 'react-native';
import {Container, View} from 'native-base';
import {observer, inject} from 'mobx-react';
// Custom Components
import OrderCard from './OrderCard';

@inject('authStore')
@inject('ordersStore')
@observer
class OrdersList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.ordersStore[`${this.props.route.params.storeFunctionName}`](
      this.props.authStore.merchantId,
    );
  }

  render() {
    const {storeVarName} = this.props.route.params;
    const dataSource = this.props.ordersStore[`${storeVarName}`].slice();

    return (
      <Container style={{flex: 1}}>
        <View style={{paddingHorizontal: 10}}>
          <FlatList
            data={dataSource}
            renderItem={({item, index}) => (
              <OrderCard
                orderNumber={`${item.orderNumber}`}
                userName={`${item.userName}`}
                numberOfItems={`${item.numberOfItems}`}
                totalAmount={`${item.totalAmount}`}
                orderId={`${item.orderId}`}
                userAddress={`${item.userAddress}`}
                createdAt={`${item.createdAt}`}
                key={index}
              />
            )}
            keyExtractor={(item) => item.orderId}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Container>
    );
  }
}

export default OrdersList;
