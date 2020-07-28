import React, {Component} from 'react';
import {FlatList, RefreshControl, ActivityIndicator} from 'react-native';
import {View} from 'native-base';
import {observer, inject} from 'mobx-react';
// Custom Components
import OrderCard from './OrderCard';
import {colors} from '../../assets/colors';
import {computed} from 'mobx';

@inject('ordersStore')
@inject('detailsStore')
@observer
class OrdersList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      listOrderStatus: this.props.route.name.toLowerCase(),
    };
  }

  @computed get orders() {
    if (this.state.listOrderStatus) {
      const orderList = this.props.ordersStore.orders.filter((order) => {
        return order.orderStatus[this.state.listOrderStatus].status === true;
      });

      return orderList;
    }
    return [];
  }

  @computed get orderLoading() {
    if (
      this.props.detailsStore.storeDetails.orderNumber &&
      this.props.ordersStore.orders.length ===
        this.props.detailsStore.storeDetails.orderNumber
    ) {
      return false;
    }

    return true;
  }

  async retrieveOrders() {
    const {merchantId} = this.props.detailsStore.storeDetails;

    this.props.ordersStore.unsubscribeSetStoreDetails &&
      this.props.ordersStore.unsubscribeSetStoreDetails();

    return this.props.ordersStore.setOrders(merchantId);
  }

  onRefresh() {
    this.setState({loading: true});

    this.retrieveOrders().then(() => {
      this.setState({loading: false});
    });
  }

  render() {
    const {navigation} = this.props;
    const {name} = this.props.route;
    const {loading} = this.state;
    const dataSource = this.orders.slice();

    return (
      <View style={{flex: 1}}>
        <FlatList
          data={dataSource}
          initialNumToRender={5}
          style={{flex: 1, paddingHorizontal: 10}}
          renderItem={({item, index}) => (
            <OrderCard
              order={item}
              tabName={name}
              navigation={navigation}
              key={item.orderId}
            />
          )}
          keyExtractor={(item) => item.orderId}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              colors={[colors.primary, colors.dark]}
              refreshing={loading || this.orderLoading}
              onRefresh={this.onRefresh.bind(this)}
            />
          }
        />
      </View>
    );
  }
}

export default OrdersList;
