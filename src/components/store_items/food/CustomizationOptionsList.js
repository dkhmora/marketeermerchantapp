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
          <Card
            containerStyle={{
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingTop: 0,
              marginLeft: 0,
              marginRight: 0,
              borderRadius: 10,
            }}>
            <View style={{borderRadius: 10, overflow: 'hidden'}}>
              <CardItemHeader
                title="Options"
                style={{height: 30, paddingLeft: 5, paddingRight: 0}}
                titleStyle={{fontSize: 18}}
              />
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
            </View>
          </Card>
        )}

        {specialInstructions && (
          <Card
            containerStyle={{
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingTop: 0,
              marginLeft: 0,
              marginRight: 0,
              borderRadius: 10,
            }}>
            <View style={{borderRadius: 10, overflow: 'hidden'}}>
              <CardItemHeader
                title="Special Instructions"
                style={{height: 30, paddingLeft: 5, paddingRight: 0}}
                titleStyle={{fontSize: 18}}
              />

              <CardItem>
                <Text style={{fontFamily: 'ProductSans-Regular'}}>
                  {specialInstructions}
                </Text>
              </CardItem>
            </View>
          </Card>
        )}
      </View>
    );
  }
}

export default CustomizationOptionsList;
