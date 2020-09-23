import React, {PureComponent} from 'react';
import {Card, CardItem, Left, Body, Right} from 'native-base';
import {ActivityIndicator, View} from 'react-native';
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

    const buttonText =
      (tabName === 'Paid' && 'Ship') ||
      (tabName === 'Unpaid' &&
        order.paymentMethod === 'Online Payment' &&
        'Mark as Paid') ||
      (tabName === 'Pending' && 'Accept') ||
      (tabName === 'Shipped' && 'Complete');

    const CardHeader = () => {
      const optionsButton =
        tabName === 'Pending' || tabName === 'Unpaid' ? true : false;

      return (
        <CardItem
          header
          bordered
          button
          onPress={() =>
            navigation.navigate('Order Chat', {
              orderId: order.orderId,
            })
          }
          style={{backgroundColor: colors.primary}}>
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
                <Icon name="message-square" color={colors.icons} />

                {order.storeUnreadCount !== null &&
                  order.storeUnreadCount > 0 && (
                    <Badge
                      value={order.storeUnreadCount}
                      badgeStyle={{backgroundColor: colors.accent}}
                      containerStyle={{position: 'absolute', top: 0, right: 0}}
                    />
                  )}
              </View>
              <Text style={{color: colors.icons}}>Chat</Text>
            </View>

            <View
              style={{flex: 1, flexDirection: 'column', paddingHorizontal: 10}}>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'ProductSans-Regular',
                  fontSize: 18,
                }}>
                {order.userName}
              </Text>

              <Text style={{color: '#eee'}}>
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
              backgroundColor: '#F8BBD0',
              borderRadius: 16,
              paddingVertical: 10,
              paddingHorizontal: 5,
            }}>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: 'ProductSans-Black',
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                {order.transactionFee || order.transactionFee === 0
                  ? `₱${order.transactionFee.toPrecision(3)}`
                  : 'Unknown'}
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: colors.text_primary,
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
                  iconStyle={{color: '#fff', fontSize: 27}}
                  destructiveIndex={1}
                  options={['Cancel Order']}
                  actions={[
                    () => {
                      this.props.ordersStore.cancelOrderModal = true;
                      this.props.ordersStore.selectedCancelOrder = order;
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
        <CardItem footer bordered>
          <Left>
            <Text style={{color: colors.primary}}>{this.orderStatus}</Text>
            <Text> - {this.timeStamp}</Text>
          </Left>
          <Right>
            {buttonText && (
              <Button
                title={buttonText}
                titleStyle={{color: colors.icons}}
                loading={this.state.loading}
                loadingProps={{size: 'small', color: colors.icons}}
                buttonStyle={{backgroundColor: colors.accent}}
                containerStyle={{
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  width: '100%',
                }}
                onPress={() => this.setState({changeOrderStatusModal: true})}
              />
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
          <CardItem bordered>
            <Left>
              <Text style={{fontFamily: 'ProductSans-Regular', fontSize: 16}}>
                Delivery Address:
              </Text>
            </Left>
            <Right>
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: 'ProductSans-Black',
                  fontSize: 16,
                  textAlign: 'right',
                }}>
                {order.deliveryAddress}
              </Text>
            </Right>
          </CardItem>
          <CardItem bordered>
            <Left>
              <Text style={{fontFamily: 'ProductSans-Regular', fontSize: 16}}>
                Total Amount:
              </Text>
            </Left>
            <Right>
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: 'ProductSans-Black',
                  fontSize: 16,
                }}>
                ₱ {order.subTotal}
              </Text>
              <Text note>{order.quantity} items</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Body>
              <Button
                title="View Full Order"
                onPress={this.handleViewOrderItems.bind(this)}
                loading={this.state.loading}
                loadingProps={{size: 'small', color: colors.accent}}
                titleStyle={{color: colors.accent}}
                buttonStyle={{backgroundColor: colors.icons}}
                containerStyle={{
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  width: '100%',
                }}
              />
            </Body>
          </CardItem>
          <CardFooter />
        </Card>
      </View>
    );
  }
}

OrderCard.defaultProps = {
  editable: false,
};

export default OrderCard;
