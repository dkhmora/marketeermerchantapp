import React, {Component} from 'react';
import {
  ActivityIndicator,
  View,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Linking,
} from 'react-native';
import {Card, CardItem} from 'native-base';
// Custom Components
import BaseHeader from '../components/BaseHeader';
// Mobx
import {inject, observer} from 'mobx-react';
import {Text, Icon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';
import storage from '@react-native-firebase/storage';
@inject('detailsStore')
@inject('itemsStore')
@observer
class StoreDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {refreshing: false, allowDragging: true};
  }

  componentDidMount() {
    this.getDisbursementPeriods();
  }

  async getDisbursementPeriods() {
    this.setState(
      {
        refreshing: true,
      },
      async () => {
        await this.props.detailsStore.setDisbursementPeriods().then(() => {
          this.setState({refreshing: false});
        });
      },
    );
  }

  async downloadPdf() {
    const ref = storage().ref(
      'Fresh Market Solutions Inc - FMSI-ChKK5i1-0905202009112020-DI.pdf',
    );
    const link = await ref.getDownloadURL();

    Linking.openURL(link);
  }

  onRefresh() {
    this.getDisbursementPeriods();
  }

  DisbursementPeriod({item}) {
    const timeStamp = moment(item.updatedAt, 'x').fromNow();
    const startDate = moment(item.startDate, 'MM-DD-YYYY').format(
      'MMM DD, YYYY',
    );
    const endDate = moment(item.endDate, 'MM-DD-YYYY').format('MMM DD, YYYY');

    return (
      <View
        style={{
          flex: 1,
          borderBottomColor: colors.divider,
          borderBottomWidth: 1,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
            <Text
              style={{
                fontSize: 17,
                color: colors.icons,
                borderBottomRightRadius: 10,
                padding: 5,
                backgroundColor: colors.primary,
                elevation: 3,
              }}>
              {startDate} to {endDate}
            </Text>

            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 10,
                flexDirection: 'column',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'ProductSans-Bold',
                    color: colors.text_primary,
                    textAlign: 'justify',
                  }}>
                  Payment Gateway Fee:{' '}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'ProductSans-Regular',
                    color: colors.text_primary,
                    textAlign: 'justify',
                  }}>
                  -₱{item.totalPaymentGatewayFees}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 16,
                }}>
                {item.successfulTransactionCount}{' '}
                {item.successfulTransactionCount < 2
                  ? 'transaction'
                  : 'transactions'}
              </Text>

              <View style={{paddingTop: 8}}>
                <Text style={{color: colors.text_secondary}}>
                  Updated {timeStamp}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              borderColor: colors.primary,
              borderWidth: 1,
              elevation: 3,
              backgroundColor: colors.icons,
              padding: 5,
              marginRight: 10,
            }}>
            <Text
              style={{
                fontSize: 18,
                paddingBottom: 10,
                fontFamily: 'ProductSans-Bold',
                color: colors.primary,
                textAlign: 'justify',
              }}>
              ₱{item.totalAmount}
            </Text>

            <Text style={{color: colors.primary, fontSize: 17}}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  render() {
    const {refreshing, allowDragging} = this.state;
    const {disbursementPeriods, merchantDetails} = this.props.detailsStore;
    const {creditData} = merchantDetails;

    const dataSource = disbursementPeriods.slice();

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title={this.props.route.name}
          navigation={this.props.navigation}
          backButton
        />

        {Object.keys(this.props.detailsStore.storeDetails).length <= 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary,
            }}>
            <ActivityIndicator size="large" color={colors.icons} />
          </View>
        ) : (
          <KeyboardAwareScrollView
            style={{paddingHorizontal: 10}}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            keyboardOpeningTime={20}
            extraScrollHeight={20}
            scrollEnabled={allowDragging}>
            <SafeAreaView>
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
                <Card
                  style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}>
                  <CardItem
                    header
                    bordered
                    style={{
                      backgroundColor: colors.primary,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      height: 55,
                      paddingBottom: 0,
                      paddingTop: 0,
                    }}>
                    <Text style={{color: colors.icons, fontSize: 20}}>
                      Markee Credits
                    </Text>

                    <Button
                      icon={<Icon name="plus" color={colors.icons} size={20} />}
                      iconRight
                      onPress={() => this.props.navigation.navigate('Top Up')}
                      title="Top Up"
                      titleStyle={{color: colors.icons}}
                      buttonStyle={{
                        backgroundColor: colors.accent,
                      }}
                    />
                  </CardItem>

                  <CardItem bordered>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 8,
                      }}>
                      <View style={{flex: 2, paddingright: 10}}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Bold',
                          }}>
                          Markee Credits
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
                        {creditData && (
                          <Text
                            style={{
                              color: colors.primary,
                              fontSize: 16,
                              fontFamily: 'ProductSans-Bold',
                              textAlign: 'right',
                            }}>
                            ₱{creditData.credits.toFixed(2)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </CardItem>

                  <CardItem bordered>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 8,
                      }}>
                      <View style={{flex: 2, paddingright: 10}}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Bold',
                          }}>
                          Markee Credit Threshold
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
                        {creditData && (
                          <Text
                            style={{
                              color: colors.primary,
                              fontSize: 16,
                              fontFamily: 'ProductSans-Bold',
                              textAlign: 'right',
                            }}>
                            ₱{creditData.creditThreshold}
                          </Text>
                        )}
                      </View>
                    </View>
                  </CardItem>
                </Card>
              </View>

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
                <Card
                  style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}>
                  <CardItem
                    header
                    bordered
                    style={{
                      backgroundColor: colors.primary,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      height: 55,
                      paddingBottom: 0,
                      paddingTop: 0,
                      elevation: 1,
                    }}>
                    <Text style={{color: colors.icons, fontSize: 20}}>
                      Disbursement Invoices
                    </Text>
                  </CardItem>

                  <CardItem
                    style={{
                      paddingLeft: 0,
                      paddingRight: 0,
                      paddingTop: 0,
                      paddingLeft: 0,
                    }}>
                    <FlatList
                      style={{flex: 1, height: 500}}
                      data={dataSource}
                      nestedScrollEnabled={true}
                      onTouchStart={() => {
                        this.setState({allowDragging: false});
                      }}
                      onTouchEnd={() => this.setState({allowDragging: true})}
                      onTouchCancel={() => this.setState({allowDragging: true})}
                      onMomentumScrollEnd={() => {
                        this.setState({allowDragging: true});
                      }}
                      onScrollEndDrag={() => {
                        this.setState({allowDragging: true});
                      }}
                      initialNumToRender={10}
                      renderItem={({item, index}) => (
                        <this.DisbursementPeriod
                          item={item}
                          key={`${item.startDate}-${item.endDate}`}
                        />
                      )}
                      refreshControl={
                        <RefreshControl
                          colors={[colors.primary, colors.dark]}
                          refreshing={refreshing}
                          onRefresh={this.onRefresh.bind(this)}
                        />
                      }
                      keyExtractor={(item) =>
                        `${item.startDate}-${item.endDate}`
                      }
                      showsVerticalScrollIndicator={false}
                    />
                  </CardItem>
                </Card>
              </View>
            </SafeAreaView>
          </KeyboardAwareScrollView>
        )}
      </View>
    );
  }
}

export default StoreDetailsScreen;
