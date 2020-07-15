import React, {Component} from 'react';
import {FlatList, RefreshControl, ActivityIndicator} from 'react-native';
import {View} from 'native-base';
import {observer, inject} from 'mobx-react';
// Custom Components
import OrderCard from './OrderCard';
import {colors} from '../../assets/colors';
import * as Animatable from 'react-native-animatable';
import {computed} from 'mobx';

@inject('authStore')
@inject('ordersStore')
@inject('detailsStore')
@observer
class OrdersList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: true,
      loading: true,
    };
  }

  componentDidMount() {
    this.retrieveOrders().then(() => {
      this.setState({loading: false});
    });
  }

  async retrieveOrders() {
    return await this.props.ordersStore[
      `${this.props.route.params.storeFunctionName}`
    ](this.props.detailsStore.storeDetails.merchantId);
  }

  onRefresh() {
    this.setState({loading: true});

    this.retrieveOrders().then(() => {
      this.setState({loading: false});
    });
  }

  render() {
    const {navigation} = this.props;
    const {storeVarName} = this.props.route.params;
    const {name} = this.props.route;
    const {loading} = this.state;
    const dataSource = this.props.ordersStore[`${storeVarName}`].slice();

    return (
      <View style={{flex: 1}}>
        <FlatList
          data={dataSource}
          style={{flex: 1, paddingHorizontal: 10}}
          renderItem={({item, index}) => (
            <OrderCard
              order={item}
              tabName={name}
              navigation={navigation}
              key={index}
            />
          )}
          keyExtractor={(item) => item.orderId}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              colors={[colors.primary, colors.dark]}
              refreshing={loading}
              onRefresh={this.onRefresh.bind(this)}
            />
          }
        />
      </View>
    );
  }
}

export default OrdersList;
