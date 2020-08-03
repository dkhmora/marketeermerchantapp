import React, {PureComponent} from 'react';
import {
  Card,
  CardItem,
  Left,
  Body,
  Right,
  View,
  Item,
  H3,
  Textarea,
} from 'native-base';
import {ActionSheetIOS, Platform, ActivityIndicator} from 'react-native';
import moment, {ISO_8601} from 'moment';
import {observer, inject} from 'mobx-react';
import Modal from 'react-native-modal';
import {Icon, Button, Text} from 'react-native-elements';
import {observable, action, computed} from 'mobx';
import BaseOptionsMenu from './BaseOptionsMenu';
import {colors} from '../../assets/colors';
import CancelOrderModal from './CancelOrderModal';
import Toast from './Toast';

@inject('ordersStore')
@observer
class OrderCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
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
    return moment(this.props.order.updatedAt, 'x').fromNow();
  }

  handleChangeOrderStatus() {
    const {order} = this.props;
    const orderFetchLimit = 5;

    this.setState({loading: true});

    this.props.ordersStore
      .setOrderStatus(order.orderId, order.merchantId, orderFetchLimit)
      .then(() => {
        Toast({
          text: `Successfully changed Order # ${order.merchantOrderNumber} status!`,
          type: 'success',
          duration: 3500,
        });
      })
      .then(() => {
        this.setState({loading: false});
      });
  }

  handleViewOrderItems() {
    const {navigation, order} = this.props;

    navigation.dangerouslyGetParent().navigate('Order Details', {
      order,
    });
  }

  render() {
    const {order, tabName, navigation, ...otherProps} = this.props;

    const buttonText =
      (tabName === 'Paid' && 'Ship') ||
      (tabName === 'Pending' && 'Accept') ||
      (tabName === 'Shipped' && 'Complete');

    const CardHeader = () => {
      const optionsButton = tabName === 'Pending' ? true : false;

      return (
        <CardItem
          header
          bordered
          button
          onPress={() =>
            navigation.navigate('Order Chat', {
              order,
              orderStatus: this.orderStatus,
            })
          }
          style={{backgroundColor: colors.primary}}>
          <View
            style={{
              flex: 2,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View>
              <Icon name="message-square" color={colors.icons} />
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
                Order # {order.merchantOrderNumber}
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
                ₱{(order.totalAmount * 0.05).toPrecision(3)}
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
                      this.props.ordersStore.selectedOrder = order;
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
      const footerStatus = `Order ${tabName}`;

      return (
        <CardItem footer bordered>
          <Left>
            <Text note>{this.timeStamp}</Text>
          </Left>
          <Right>
            {footerStatus && !buttonText ? (
              <Text style={{textAlign: 'right'}}>{footerStatus}</Text>
            ) : (
              <Button
                title={buttonText}
                titleStyle={{color: colors.icons}}
                loading={this.state.loading}
                loadingProps={{size: 'small', color: colors.accent}}
                buttonStyle={{backgroundColor: colors.accent}}
                containerStyle={{
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  width: '100%',
                }}
                onPress={this.handleChangeOrderStatus.bind(this)}
              />
            )}
          </Right>
        </CardItem>
      );
    };

    return (
      <View>
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
                ₱ {order.totalAmount}
              </Text>
              <Text note>{order.quantity} items</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Body>
              <Button
                title="View Full Order"
                onPress={this.handleViewOrderItems.bind(this)}
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
