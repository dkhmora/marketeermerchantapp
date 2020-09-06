import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {View, RefreshControl, ActivityIndicator, Platform} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Text} from 'react-native-elements';
import {colors} from '../../assets/colors';
import moment from 'moment';
import BaseHeader from '../components/BaseHeader';
import {computed} from 'mobx';
import * as Animatable from 'react-native-animatable';
import {initialWindowMetrics} from 'react-native-safe-area-context';

const inset = initialWindowMetrics && initialWindowMetrics.insets;
const bottomPadding = Platform.OS === 'ios' ? inset.bottom : 0;

@inject('paymentsStore')
@inject('detailsStore')
@observer
class TopUpHistoryScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentsLoading: true,
      retrieveLimit: 10,
      onEndReachedCalledDuringMomentum: false,
      refreshing: true,
      endReached: false,
    };
  }

  @computed get lastPaymentCreatedAt() {
    if (this.props.paymentsStore.payments.length > 0) {
      return this.props.paymentsStore.payments.slice(-1)[0].createdAt;
    }

    return 0;
  }

  componentDidMount() {
    this.getInitialPayments();
  }

  getAvailablePaymentMethods() {
    if (
      Object.keys(this.props.paymentsStore.availablePaymentMethods).length === 0
    ) {
      this.props.paymentsStore.getAvailablePaymentMethods().then(() => {
        this.setState({refreshing: false, paymentsLoading: false});
      });
    } else {
      this.setState({refreshing: false, paymentsLoading: false});
    }
  }

  getInitialPayments() {
    const {retrieveLimit} = this.state;
    const {merchantId} = this.props.detailsStore.merchantDetails;

    this.setState({refreshing: true}, () => {
      this.props.paymentsStore.getMerchantTopups({
        merchantId,
        retrieveLimit,
      });

      this.getAvailablePaymentMethods();
    });
  }

  retrieveMorePayments() {
    if (
      !this.state.onEndReachedCalledDuringMomentum &&
      this.lastPaymentCreatedAt >= 1 &&
      !this.state.endReached
    ) {
      const {retrieveLimit} = this.state;
      const {merchantId} = this.props.detailsStore.merchantDetails;

      this.setState(
        {refreshing: true, onEndReachedCalledDuringMomentum: true},
        () => {
          this.props.paymentsStore
            .getMerchantTopups({
              merchantId,
              lastVisible: this.lastPaymentCreatedAt,
              retrieveLimit,
            })
            .then((empty) => {
              this.setState({
                refreshing: false,
                paymentsLoading: false,
                onEndReachedCalledDuringMomentum: false,
                endReached: empty,
              });
            });
        },
      );
    }
  }

  onRefresh() {
    this.getInitialPayments();
  }

  PaymentListItem({item, paymentMethods}) {
    const timeStamp = moment(item.createdAt, 'x').format('MM-DD-YYYY hh:mm A');
    const paymentStatus =
      item.status === 'S'
        ? 'Success'
        : item.status === 'F'
        ? 'Failure'
        : item.status === 'P'
        ? 'Pending'
        : item.status === 'U'
        ? 'Unknown'
        : item.status === 'R'
        ? 'Refund'
        : item.status === 'K'
        ? 'Chargedback'
        : item.status === 'V'
        ? 'Voided'
        : item.status === 'A'
        ? 'Authorized'
        : 'Undefined';
    const paymentMethod = paymentMethods[item.processId]
      ? paymentMethods[item.processId].longName
      : 'Unknown Payment Method';

    return (
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          paddingVertical: 10,
          borderBottomColor: colors.divider,
          borderBottomWidth: 1,
          paddingHorizontal: 15,
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Text style={{fontSize: 15}}>{paymentMethod}</Text>

          <Text style={{color: colors.text_secondary, paddingBottom: 10}}>
            Receipt sent to {item.email}
          </Text>

          <Text style={{color: colors.text_secondary}}>{timeStamp}</Text>
        </View>

        <View
          style={{
            paddingHorizontal: 8,
            paddingTop: 8,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontSize: 15,
              paddingBottom: 10,
              fontFamily: 'ProductSans-Bold',
              color: item.status === 'S' ? colors.primary : colors.text_primary,
              textAlign: 'justify',
            }}>
            {item.status === 'S' && '+'}₱{item.topUpAmount}
          </Text>

          <Text
            style={{
              fontSize: 15,
              paddingBottom: 10,
              textAlign: 'justify',
              color: colors.text_secondary,
            }}>
            {paymentStatus}
          </Text>
        </View>
      </View>
    );
  }

  renderFooter = () => {
    return (
      <View style={{bottom: 50, width: '100%'}}>
        <View style={{height: bottomPadding}} />
        {this.state.onEndReachedCalledDuringMomentum && (
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

  render() {
    const {refreshing} = this.state;
    const {payments, availablePaymentMethods} = this.props.paymentsStore;
    const {navigation} = this.props;

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title="Markee Credits Top Up History"
          navigation={navigation}
          backButton
        />

        <FlatList
          style={{flex: 1}}
          data={payments}
          initialNumToRender={30}
          renderItem={({item, index}) => (
            <this.PaymentListItem
              item={item}
              key={index}
              paymentMethods={availablePaymentMethods}
            />
          )}
          refreshControl={
            <RefreshControl
              colors={[colors.primary, colors.dark]}
              refreshing={refreshing}
              onRefresh={this.onRefresh.bind(this)}
            />
          }
          keyExtractor={(item, index) => `${item.transactionId}.${index}`}
          onMomentumScrollBegin={() => {
            this.state.onEndReachedCalledDuringMomentum = false;
          }}
          onEndReached={() => this.retrieveMorePayments()}
          onEndReachedThreshold={0.01}
          refreshing={this.state.onEndReachedCalledDuringMomentum}
          ListFooterComponent={this.renderFooter}
        />
      </View>
    );
  }
}

export default TopUpHistoryScreen;
