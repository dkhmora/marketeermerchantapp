import React, {Component} from 'react';
import {FlatList, RefreshControl, ActivityIndicator} from 'react-native';
import {View} from 'native-base';
import {observer, inject} from 'mobx-react';
// Custom Components
import OrderCard from './OrderCard';
import {colors} from '../../assets/colors';
import * as Animatable from 'react-native-animatable';

@inject('authStore')
@inject('ordersStore')
@observer
class OrdersList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: true,
      loading: false,
      lastVisible: null,
      limit: 5,
      onEndReachedCalledDuringMomentum: true,
    };
  }

  componentDidMount() {
    this.retrieveInitial();
  }

  retrieveInitial = () => {
    const {storeVarName} = this.props.route.params;

    this.setState({loading: true});

    this.props.ordersStore[`${this.props.route.params.storeFunctionName}`](
      this.props.authStore.merchantId,
      this.state.limit,
    ).then(() => {
      this.setState({
        loading: false,
        lastVisible:
          this.props.ordersStore[`${storeVarName}`].length > 0 &&
          this.props.ordersStore[`${storeVarName}`][0].merchantOrderNumber -
            this.state.limit +
            1,
      });
    });
  };

  retrieveMore = () => {
    if (
      !this.state.onEndReachedCalledDuringMomentum &&
      this.state.lastVisible >= 1
    ) {
      this.setState({refreshing: true, onEndReachedCalledDuringMomentum: true});

      this.props.ordersStore[`${this.props.route.params.storeFunctionName}`](
        this.props.authStore.merchantId,
        this.state.limit,
        this.state.lastVisible,
      ).then(() => {
        this.setState({
          refreshing: false,
          lastVisible: this.state.lastVisible - this.state.limit,
          onEndReachedCalledDuringMomentum: false,
        });
      });
    }
  };

  renderFooter = () => {
    const {storeVarName} = this.props.route.params;

    return (
      <View style={{bottom: 50, width: '100%'}}>
        {this.state.onEndReachedCalledDuringMomentum &&
          this.props.ordersStore[`${storeVarName}`].length >=
            this.state.limit && (
            <Animatable.View
              animation="slideInUp"
              duration={400}
              useNativeDriver
              style={{
                alignItems: 'center',
                flex: 1,
              }}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{
                  backgroundColor: colors.icons,
                  borderRadius: 30,
                  padding: 5,
                  elevation: 5,
                }}
              />
            </Animatable.View>
          )}
      </View>
    );
  };

  onRefresh() {
    this.retrieveInitial();
  }

  render() {
    const {navigation} = this.props;
    const {storeVarName} = this.props.route.params;
    const {name} = this.props.route;
    const {merchantId} = this.props.authStore;
    const dataSource = this.props.ordersStore[`${storeVarName}`].slice();

    return (
      <View style={{flex: 1}}>
        <FlatList
          data={dataSource}
          style={{flex: 1, paddingHorizontal: 10}}
          renderItem={({item, index}) => (
            <OrderCard
              merchantId={merchantId}
              merchantOrderNumber={item.merchantOrderNumber}
              orderStatus={item.orderStatus}
              deliveryCoordinates={item.deliveryCoordinates}
              userName={`${item.userName}`}
              quantity={item.quantity}
              shippingPrice={item.shippingPrice}
              paymentMethod={item.paymentMethod}
              totalAmount={item.totalAmount}
              orderId={item.orderId}
              deliveryAddress={item.deliveryAddress}
              createdAt={item.createdAt}
              tabName={name}
              navigation={navigation}
              key={index}
            />
          )}
          keyExtractor={(item) => item.orderId}
          showsVerticalScrollIndicator={false}
          onEndReached={this.retrieveMore}
          onEndReachedThreshold={0.01}
          onMomentumScrollBegin={() => {
            this.state.onEndReachedCalledDuringMomentum = false;
          }}
          refreshControl={
            <RefreshControl
              colors={[colors.primary, colors.dark]}
              refreshing={this.state.loading}
              onRefresh={this.onRefresh.bind(this)}
            />
          }
          refreshing={this.state.onEndReachedCalledDuringMomentum}
          ListFooterComponent={this.renderFooter}
        />
      </View>
    );
  }
}

export default OrdersList;
