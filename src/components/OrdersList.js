import React, {Component} from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {View} from 'native-base';
import {observer, inject} from 'mobx-react';
// Custom Components
import OrderCard from './OrderCard';
import {colors} from '../../assets/colors';
import {computed} from 'mobx';
import {Text} from 'react-native-elements';
import DeviceInfo from 'react-native-device-info';

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

    return [];
  }

  @computed get orderLoading() {
    if (
      this.props.ordersStore.orders.length ===
      this.props.detailsStore.storeDetails.orderNumber
    ) {
      return false;
    }

    return true;
  }

  componentDidMount() {
    this.unsubscribeTabPress = this.props.navigation.addListener(
      'tabPress',
      (e) => {
        this.flatList &&
          this.flatList.scrollToOffset({animated: true, offset: 0});
      },
    );
  }

  componentWillUnmount() {
    this.unsubscribeTabPress && this.unsubscribeTabPress();
  }

  async retrieveOrders() {
    const {storeId} = this.props.detailsStore.storeDetails;

    this.props.ordersStore.unsubscribeSetStoreDetails &&
      this.props.ordersStore.unsubscribeSetStoreDetails();

    return this.props.ordersStore.setOrders(storeId);
  }

  onRefresh() {
    this.setState({loading: true});

    this.retrieveOrders().then(() => {
      this.setState({loading: false});
    });
  }

  formatData(data, numColumns) {
    const numberOfFullRows = Math.floor(data.length / numColumns);

    let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;
    while (
      numberOfElementsLastRow !== numColumns &&
      numberOfElementsLastRow !== 0
    ) {
      data.push({key: `blank-${numberOfElementsLastRow}`, empty: true});
      numberOfElementsLastRow += 1;
    }

    return data;
  }

  renderItem = ({item, index}) => {
    if (item.empty) {
      return (
        <View style={{flex: 1, backgroundColor: 'transparent'}} key={index} />
      );
    }

    return (
      <OrderCard
        order={item}
        tabName={this.props.route.name}
        navigation={this.props.navigation}
        key={item.orderId}
      />
    );
  };

  render() {
    const {loading} = this.state;
    const dataSource = this.orders ? this.orders.slice() : [];

    const isTablet = DeviceInfo.isTablet();
    const numColumns = isTablet ? 2 : 1;

    return (
      <View style={{flex: 1}}>
        <FlatList
          ref={(flatList) => (this.flatList = flatList)}
          data={this.formatData(dataSource, numColumns)}
          numColumns={numColumns}
          contentContainerStyle={{flexGrow: 1, padding: 5}}
          initialNumToRender={10}
          windowSize={11}
          style={{flex: 1}}
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
