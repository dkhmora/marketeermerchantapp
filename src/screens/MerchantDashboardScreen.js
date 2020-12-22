import React, {Component} from 'react';
import {
  ActivityIndicator,
  View,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import {Card, CardItem} from 'native-base';
// Custom Components
import BaseHeader from '../components/BaseHeader';
// Mobx
import {inject, observer} from 'mobx-react';
import {Text, Icon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import moment from 'moment';
import crashlytics from '@react-native-firebase/crashlytics';
import CardItemHeader from '../components/CardItemHeader';
import {ScrollView} from 'react-native-gesture-handler';
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

    crashlytics().log('StoreDetailsScreen');
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
          paddingBottom: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <Text
            style={{
              fontSize: 16,
              color: colors.icons,
              borderBottomRightRadius: 10,
              padding: 5,
              backgroundColor: colors.primary,
              elevation: 3,
            }}>
            {startDate} to {endDate}
          </Text>

          <Text
            style={{
              flex: 1,
              color: colors.primary,
              fontSize: 18,
              textAlign: 'right',
              alignSelf: 'center',
              paddingHorizontal: 15,
            }}>
            {item.status}
          </Text>
        </View>

        <View style={{marginHorizontal: 5}}>
          {item.mrspeedy && (
            <Card
              style={{
                flex: 1,
                borderRadius: 10,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
              }}>
              <View style={{borderRadius: 10, overflow: 'hidden'}}>
                <CardItemHeader
                  style={{height: 25}}
                  title="Mr. Speedy COD Transactions"
                  titleStyle={{fontSize: 15}}
                />

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                  }}>
                  <View style={{flex: 1}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'ProductSans-Bold',
                          color: colors.text_primary,
                          textAlign: 'left',
                        }}>
                        {'Total Delivery Discount: '}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'ProductSans-Regular',
                          color: colors.text_primary,
                          textAlign: 'left',
                        }}>
                        -₱{item.mrspeedy.totalDeliveryDiscount}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontSize: 14,
                      }}>
                      {`${item.mrspeedy.transactionCount} `}
                      {item.mrspeedy.transactionCount < 2
                        ? 'transaction'
                        : 'transactions'}
                    </Text>

                    <Text style={{color: colors.text_secondary, paddingTop: 8}}>
                      Updated {timeStamp}
                    </Text>
                  </View>

                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.primary,
                      borderRadius: 10,
                      elevation: 3,
                      padding: 5,
                      width: '30%',
                    }}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={{
                        fontSize: 20,
                        flex: 1,
                        fontFamily: 'ProductSans-Bold',
                        color: colors.icons,
                        textAlign: 'center',
                        flexWrap: 'wrap',
                      }}>
                      ₱{item.mrspeedy.totalAmount.toFixed(2)}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={{
                        color: colors.icons,
                        textAlign: 'center',
                      }}>
                      Total Amount
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {item.onlineBanking && (
            <Card
              style={{
                flex: 1,
                borderRadius: 10,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
              }}>
              <View style={{borderRadius: 10, overflow: 'hidden'}}>
                <CardItemHeader
                  style={{height: 25}}
                  title="Online Banking Transactions"
                  titleStyle={{fontSize: 15}}
                />

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                  }}>
                  <View style={{flex: 1}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'ProductSans-Bold',
                          color: colors.text_primary,
                          textAlign: 'left',
                        }}>
                        {'Payment Gateway Fee: '}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'ProductSans-Regular',
                          color: colors.text_primary,
                          textAlign: 'left',
                        }}>
                        -₱{item.onlineBanking.totalPaymentGatewayFees}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontSize: 14,
                      }}>
                      {`${item.onlineBanking.transactionCount} `}
                      {item.onlineBanking.transactionCount < 2
                        ? 'transaction'
                        : 'transactions'}
                    </Text>

                    <Text style={{color: colors.text_secondary, paddingTop: 8}}>
                      Updated {timeStamp}
                    </Text>
                  </View>

                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.primary,
                      borderRadius: 10,
                      elevation: 3,
                      padding: 5,
                      width: '30%',
                    }}>
                    <Text
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      style={{
                        fontSize: 20,
                        flex: 1,
                        fontFamily: 'ProductSans-Bold',
                        color: colors.icons,
                        textAlign: 'center',
                        flexWrap: 'wrap',
                      }}>
                      ₱{item.onlineBanking.totalAmount.toFixed(2)}
                    </Text>
                    <Text
                      style={{
                        color: colors.icons,
                        textAlign: 'center',
                      }}>
                      Total Amount
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 10}}
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
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginLeft: 0,
                    marginRight: 0,
                  }}>
                  <View style={{borderRadius: 10, overflow: 'hidden'}}>
                    <CardItemHeader title="Markee Credits" />

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
                  </View>
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
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginLeft: 0,
                    marginRight: 0,
                  }}>
                  <View style={{borderRadius: 10, overflow: 'hidden'}}>
                    <CardItemHeader title="Disbursement Periods" />

                    <CardItem
                      style={{
                        paddingLeft: 0,
                        paddingRight: 0,
                        paddingTop: 0,
                      }}>
                      <FlatList
                        style={{flex: 1, height: 500}}
                        data={dataSource}
                        nestedScrollEnabled={true}
                        onTouchStart={() => {
                          this.setState({allowDragging: false});
                        }}
                        onTouchEnd={() => this.setState({allowDragging: true})}
                        onTouchCancel={() =>
                          this.setState({allowDragging: true})
                        }
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
                  </View>
                </Card>
              </View>
            </SafeAreaView>
          </ScrollView>
        )}
      </View>
    );
  }
}

export default StoreDetailsScreen;
