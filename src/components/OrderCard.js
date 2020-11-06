import React, {PureComponent} from 'react';
import {Card, CardItem, Left, Right} from 'native-base';
import {ActivityIndicator, TouchableWithoutFeedback, View} from 'react-native';
import moment from 'moment';
import {observer, inject} from 'mobx-react';
import {Icon, Button, Text, Badge} from 'react-native-elements';
import {computed} from 'mobx';
import BaseOptionsMenu from './BaseOptionsMenu';
import {colors} from '../../assets/colors';
import Toast from './Toast';
import ConfirmationModal from './ConfirmationModal';

@inject('ordersStore')
@inject('detailsStore')
@observer
class OrderCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      changeOrderStatusModal: false,
    };
  }

  @computed get orderStatus() {
    const {order} = this.props;

    const statusLabel = Object.entries(order.orderStatus).map(
      ([key, value]) => {
        if (value.status) {
          return key.toUpperCase();
        }

        return;
      },
    );

    return statusLabel.filter((item) => item != null);
  }

  @computed get timeStamp() {
    if (this.orderStatus) {
      return moment(
        this.props.order.orderStatus[this.orderStatus[0].toLowerCase()]
          .updatedAt,
        'x',
      ).fromNow();
    }

    return null;
  }

  @computed get footerText() {
    const {order, tabName} = this.props;
    const {mrspeedyOrderStatus} = this;

    if (
      order.deliveryMethod === 'Mr. Speedy' &&
      order.orderStatus.shipped.status
    ) {
      return mrspeedyOrderStatus;
    }

    if (tabName === 'Unpaid' && order.paymentMethod === 'Online Banking') {
      return 'Order will be ready to ship after the customer pays';
    }
  }

  @computed get buttonText() {
    const {order, tabName} = this.props;

    return (
      (tabName === 'Paid' && 'Ship') ||
      (tabName === 'Unpaid' &&
        order.paymentMethod === 'Online Payment' &&
        'Mark as Paid') ||
      (tabName === 'Pending' && 'Accept') ||
      (tabName === 'Shipped' && 'Complete')
    );
  }

  @computed get mrspeedyOrderStatus() {
    const {order} = this.props;

    if (order.mrspeedyBookingData && order.mrspeedyBookingData.order) {
      const {status} = order.mrspeedyBookingData.order;

      switch (status) {
        case 'new':
          return "Newly created order, waiting for verification from Mr. Speedy's dispatchers.";
        case 'available':
          return 'Order was verified and is available for couriers.';
        case 'active':
          return 'A courier was assigned and is working on the order.';
        case 'completed':
          return 'Order is completed.';
        case 'canceled':
          return 'Order was canceled.';
        case 'delayed':
          return 'Order execution was delayed by a dispatcher.';
        case 'reactivated':
          return 'Order was reactivated and is again available for couriers.';

        default:
          return status.toUpperCase();
      }
    }

    return null;
  }

  handleChangeOrderStatus() {
    const {storeDetails} = this.props.detailsStore;
    const {order} = this.props;

    this.setState({loading: true});

    this.props.ordersStore
      .setOrderStatus(order.orderId, order.storeId, storeDetails.merchantId)
      .then((response) => {
        if (response.data.s === 200) {
          return Toast({
            text: response.data.m,
            type: 'success',
            duration: 3500,
          });
        }

        return Toast({
          text: response.data.m,
          type: 'danger',
          duration: 3500,
        });
      })
      .then(() => {
        this.setState({loading: false});
      });
  }

  handleViewOrderItems() {
    const {navigation, order} = this.props;

    navigation.navigate('Order Details', {
      orderId: order.orderId,
    });
  }

  render() {
    const {order, tabName, navigation, ...otherProps} = this.props;
    const {orderStatus, footerText, buttonText} = this;

    const CardHeader = () => {
      const optionsButton =
        orderStatus[0] === 'PENDING' ||
        orderStatus[0] === 'UNPAID' ||
        (orderStatus[0] === 'PAID' && order.paymentMethod === 'COD') ||
        (orderStatus[0] === 'SHIPPED' &&
          (order.deliveryMethod === 'Own Delivery' ||
            (order.deliveryMethod === 'Mr. Speedy' &&
              order.mrspeedyBookingData.order.status === 'canceled')));

      return (
        <CardItem
          header
          bordered
          button
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('Order Chat', {
              orderId: order.orderId,
            })
          }
          style={{
            backgroundColor: colors.icons,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 5,
            paddingBottom: 5,
            elevation: 1,
          }}>
          <View
            style={{
              flex: 2,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View style={{alignItems: 'center'}}>
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 5,
                  paddingTop: 5,
                }}>
                <Icon name="message-square" color={colors.primary} />

                {order.storeUnreadCount !== null &&
                  order.storeUnreadCount > 0 && (
                    <Badge
                      value={order.storeUnreadCount}
                      badgeStyle={{backgroundColor: colors.accent}}
                      containerStyle={{position: 'absolute', top: 0, right: 0}}
                    />
                  )}
              </View>
              <Text style={{color: colors.primary}}>Chat</Text>
            </View>

            <View
              style={{flex: 1, flexDirection: 'column', paddingHorizontal: 10}}>
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: 'ProductSans-Regular',
                  fontSize: 18,
                }}>
                {order.userName}
              </Text>

              <Text style={{color: colors.text_secondary}}>
                Order # {order.storeOrderNumber}
              </Text>

              <View
                style={{
                  borderRadius: 20,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  paddingVertical: 3,
                  paddingHorizontal: 7,
                  marginRight: 2,
                  alignSelf: 'flex-start',
                }}>
                <Text
                  adjustsFontSizeToFit
                  style={{
                    fontSize: 16,
                    color: '#fff',
                    textAlign: 'center',
                  }}>
                  {order.paymentMethod}
                </Text>
              </View>
            </View>
          </View>

          <Card
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingVertical: 10,
            }}>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: colors.icons,
                  fontFamily: 'ProductSans-Black',
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                {order.transactionFee || order.transactionFee === 0
                  ? `₱${order.transactionFee.toFixed(2)}`
                  : 'Unknown'}
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: colors.icons,
                  textAlign: 'center',
                }}>
                Transaction Fee
              </Text>
            </View>
          </Card>

          {optionsButton && (
            <View>
              {this.state.loading ? (
                <ActivityIndicator size="small" color={colors.icons} />
              ) : (
                <BaseOptionsMenu
                  iconStyle={{fontSize: 27}}
                  iconColor={colors.primary}
                  destructiveIndex={1}
                  options={['Cancel Order']}
                  actions={[
                    () => {
                      this.props.ordersStore.selectedCancelOrder = order;
                      this.props.ordersStore.cancelOrderModal = true;
                    },
                  ]}
                />
              )}
            </View>
          )}
        </CardItem>
      );
    };

    const CardFooter = () => {
      return (
        <CardItem footer style={{paddingTop: 0, paddingBottom: 10}}>
          <Left>
            <Text style={{color: colors.primary}}>{this.orderStatus}</Text>
            <Text> - {this.timeStamp}</Text>
          </Left>
          <Right>
            {buttonText &&
            !(
              buttonText === 'Complete' && order.deliveryMethod === 'Mr. Speedy'
            ) ? (
              <Button
                title={buttonText}
                titleStyle={{color: colors.icons}}
                loading={this.state.loading}
                loadingProps={{size: 'small', color: colors.icons}}
                buttonStyle={{backgroundColor: colors.accent, elevation: 5}}
                containerStyle={{
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  width: '100%',
                }}
                onPress={() => {
                  if (
                    (order.deliveryMethod === 'Mr. Speedy' &&
                      order.paymentMethod === 'COD' &&
                      order.orderStatus.paid.status) ||
                    (order.deliveryMethod === 'Mr. Speedy' &&
                      order.paymentMethod === 'Online Banking' &&
                      order.orderStatus.pending.status)
                  ) {
                    this.props.ordersStore.order = order;

                    if (this.props.ordersStore.mrspeedyBottomSheet) {
                      this.props.ordersStore.mrspeedyBottomSheet.getMrspeedyOrderPriceEstimate();
                      this.props.ordersStore.mrspeedyBottomSheet.bottomSheet.snapTo(
                        1,
                      );
                    }
                  } else {
                    this.setState({changeOrderStatusModal: true});
                  }
                }}
                //onPress={() => this.setState({changeOrderStatusModal: true})}
              />
            ) : (
              <Text style={{textAlign: 'right', color: colors.text_secondary}}>
                {footerText}
              </Text>
            )}
          </Right>
        </CardItem>
      );
    };

    return (
      <View
        style={{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
        }}>
        <ConfirmationModal
          isVisible={this.state.changeOrderStatusModal}
          title={`${buttonText} Order # ${order.storeOrderNumber}?`}
          body={`Are you sure you want to ${buttonText} Order # ${order.storeOrderNumber}?`}
          onConfirm={() => {
            this.setState({changeOrderStatusModal: false}, () => {
              this.handleChangeOrderStatus();
            });
          }}
          closeModal={() => this.setState({changeOrderStatusModal: false})}
        />

        <Card {...otherProps} style={{borderRadius: 10, overflow: 'hidden'}}>
          <CardHeader />

          <TouchableWithoutFeedback
            onPress={this.handleViewOrderItems.bind(this)}>
            <View>
              <CardItem style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 16,
                      fontFamily: 'ProductSans-Bold',
                      flexWrap: 'wrap',
                    }}>
                    {order.deliveryAddress}
                  </Text>
                  <Text style={{fontSize: 14}}>{order.deliveryMethod}</Text>
                </View>

                <View
                  style={{
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    marginLeft: 10,
                  }}>
                  <View style={{alignItems: 'center'}}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: colors.primary,
                        fontFamily: 'ProductSans-Bold',
                      }}>{`₱${order.subTotal}`}</Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.text_secondary,
                      }}>
                      {`${order.quantity} Items`}
                    </Text>
                  </View>
                </View>
              </CardItem>

              <CardFooter />
            </View>
          </TouchableWithoutFeedback>
        </Card>
      </View>
    );
  }
}

OrderCard.defaultProps = {
  editable: false,
};

export default OrderCard;
