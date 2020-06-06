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
    const {navigation} = this.props;
    const {storeVarName, buttonText} = this.props.route.params;
    const {name} = this.props.route;
    const {merchantId} = this.props.authStore;
    const dataSource = this.props.ordersStore[`${storeVarName}`].slice();

    return (
      <Container style={{flex: 1}}>
        <View style={{paddingHorizontal: 10, flex: 1}}>
          <FlatList
            data={dataSource}
            renderItem={({item, index}) => (
              <OrderCard
                merchantId={merchantId}
                orderNumber={item.orderNumber}
                orderStatus={item.orderStatus}
                coordinates={item.coordinates}
                userName={`${item.userName}`}
                numberOfItems={item.numberOfItems}
                shippingPrice={item.shippingPrice}
                totalAmount={item.totalAmount}
                orderId={item.orderId}
                userAddress={item.userAddress}
                createdAt={item.createdAt}
                tabName={name}
                navigation={navigation}
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
