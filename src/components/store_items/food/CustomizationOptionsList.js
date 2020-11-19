import {CardItem} from 'native-base';
import React, {PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Icon, Text} from 'react-native-elements';
import {colors} from '../../../../assets/colors';
import CardItemHeader from '../../CardItemHeader';

class CustomizationOptionsList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {
      props: {selectedOptions, specialInstructions},
    } = this;

    console.log(selectedOptions);

    return (
      <View>
        {selectedOptions && (
          <View>
            <View style={{borderRadius: 2, overflow: 'hidden'}}>
              {Object.entries(selectedOptions).map(
                ([optionTitle, selectedSelections]) => (
                  <View key={`${optionTitle}${selectedSelections.toString()}`}>
                    <View>
                      <View>
                        <CardItemHeader
                          title={optionTitle}
                          style={{
                            height: 24,
                            borderWidth: StyleSheet.hairlineWidth,
                          }}
                          titleStyle={{
                            fontSize: 14,
                            color: colors.text_primary,
                          }}
                        />

                        {Object.entries(selectedSelections).map(
                          ([selectionTitle, selectionPrice]) => (
                            <CardItem key={`${selectionTitle}`}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  flex: 1,
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <View style={{flexDirection: 'row'}}>
                                  <Icon
                                    name="chevron-right"
                                    color={colors.text_primary}
                                    size={16}
                                  />

                                  <Text
                                    style={{
                                      fontFamily: 'ProductSans-Regular',
                                      textAlignVertical: 'center',
                                      marginHorizontal: 5,
                                    }}>
                                    {selectionTitle}
                                  </Text>
                                </View>

                                <View style={{flexDirection: 'row'}}>
                                  <Text
                                    style={{fontFamily: 'ProductSans-Bold'}}>
                                    +₱{selectionPrice.toFixed(2)}
                                  </Text>
                                </View>
                              </View>
                            </CardItem>
                          ),
                        )}
                      </View>
                    </View>
                  </View>
                ),
              )}

              {specialInstructions && (
                <View>
                  <CardItemHeader
                    title="Special Instructions"
                    style={{
                      height: 24,
                      borderWidth: StyleSheet.hairlineWidth,
                    }}
                    titleStyle={{
                      fontSize: 14,
                      color: colors.text_primary,
                    }}
                  />

                  <CardItem>
                    <Text style={{fontFamily: 'ProductSans-Regular'}}>
                      {specialInstructions}
                    </Text>
                  </CardItem>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }
}

export default CustomizationOptionsList;
