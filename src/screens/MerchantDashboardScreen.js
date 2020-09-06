import React, {Component} from 'react';
import {ActivityIndicator, View, SafeAreaView} from 'react-native';
import {Card, CardItem} from 'native-base';
// Custom Components
import BaseHeader from '../components/BaseHeader';
// Mobx
import {inject, observer} from 'mobx-react';
import {Text} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

@inject('detailsStore')
@inject('itemsStore')
@observer
class StoreDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {creditData} = this.props.detailsStore.merchantDetails;

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
            extraScrollHeight={20}>
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

                    {/* <Button
                      icon={<Icon name="plus" color={colors.icons} size={20} />}
                      iconRight
                      onPress={() => navigation.navigate('Top Up')}
                      title="Top Up"
                      titleStyle={{color: colors.icons}}
                      buttonStyle={{
                        backgroundColor: colors.accent,
                      }}
                    />*/}
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
            </SafeAreaView>
          </KeyboardAwareScrollView>
        )}
      </View>
    );
  }
}

export default StoreDetailsScreen;
