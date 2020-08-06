import React, {Component} from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {View} from 'native-base';
import {observer, inject} from 'mobx-react';
// Custom Components
import OrderCard from './OrderCard';
import {colors} from '../../assets/colors';
import {computed} from 'mobx';
import {Text} from 'react-native-elements';

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

      return orderList.length > 0 ? orderList : [];
    }

    return null;
  }

  @computed get orderLoading() {
    if (
      this.props.detailsStore.storeDetails.orderNumber &&
      this.props.ordersStore.orders.length ===
        this.props.detailsStore.storeDetails.orderNumber &&
      this.orders
    ) {
      return false;
    }

    return true;
  }

  componentDidMount() {
    this.unsubscribeTabPress = this.props.navigation.addListener(
      'tabPress',
      (e) => {
        this.flatList.scrollToOffset({animated: true, offset: 0});
      },
    );
  }

  componentWillUnmount() {
    this.unsubscribeTabPress && this.unsubscribeTabPress();
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

  renderItem = ({item, index}) => (
    <OrderCard
      order={item}
      tabName={this.props.route.name}
      navigation={this.props.navigation}
      key={item.orderId}
    />
  );

  render() {
    const {loading} = this.state;
    const dataSource = this.orders ? this.orders.slice() : [];

    return (
      <View style={{flex: 1}}>
        <FlatList
          ref={(flatList) => (this.flatList = flatList)}
          data={dataSource}
          contentContainerStyle={{flexGrow: 1}}
          initialNumToRender={5}
          windowSize={11}
          style={{flex: 1, paddingHorizontal: 10}}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.orderId}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !this.orderLoading && (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: 'center',
                    paddingHorizontal: 15,
                  }}>
                  No {this.props.route.name} Orders as of the moment.
                </Text>
              </View>
            )
          }
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
