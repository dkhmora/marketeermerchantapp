import React, {Component} from 'react';
import {View} from 'react-native';
import {Button, Card, CheckBox, Icon, Text} from 'react-native-elements';
import {colors} from '../../../../assets/colors';
import Divider from '../../Divider';

class CustomizationOptionsCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  OptionsList(props) {
    const {options, checkedIcon, uncheckedIcon} = props;

    if (options) {
      return options.map((item, index) => {
        return (
          <View>
            {index !== 0 && <Divider />}

            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <CheckBox
                disabled
                center
                title={
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                    }}>
                    <Text style={{flex: 1}}>{item.title}</Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        marginRight: -10,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'ProductSans-Bold',
                          textAlign: 'center',
                        }}>
                        +₱{item.price.toFixed(2)}
                      </Text>

                      <Button
                        type="clear"
                        icon={
                          <Icon name="x" color={colors.primary} size={20} />
                        }
                      />
                    </View>
                  </View>
                }
                checkedIcon={checkedIcon}
                uncheckedIcon={uncheckedIcon}
                containerStyle={{
                  flex: 1,
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingBottom: 0,
                  paddingTop: 0,
                  borderRadius: 0,
                  backgroundColor: colors.icons,
                  elevation: 0,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                  paddingHorizontal: 5,
                  marginRight: 0,
                  marginLeft: 0,
                }}
              />
            </View>
          </View>
        );
      });
    }
  }

  render() {
    const {title, multipleSelection, options} = this.props;
    const checkedIcon = multipleSelection ? 'checked-square-o' : 'dot-circle-o';
    const uncheckedIcon = multipleSelection ? 'square-o' : 'circle-o';
    const {OptionsList} = this;

    return (
      <Card
        containerStyle={{paddingBottom: 0, paddingTop: 10, borderRadius: 10}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <View>
            <Text style={{fontSize: 20, marginBottom: 5}}>{title}</Text>

            {multipleSelection ? (
              <View
                style={{
                  borderRadius: 5,
                  backgroundColor: colors.primary,
                  padding: 3,
                  elevation: 2,
                }}>
                <Text style={{color: colors.icons}}>Not Required</Text>
              </View>
            ) : (
              <View
                style={{
                  borderRadius: 5,
                  backgroundColor: colors.accent,
                  padding: 3,
                  elevation: 2,
                }}>
                <Text style={{color: colors.icons}}>At least 1 Required</Text>
              </View>
            )}
          </View>

          <Button
            type="clear"
            icon={<Icon name="x" color={colors.primary} size={22} />}
          />
        </View>

        <OptionsList
          options={options}
          checkedIcon={checkedIcon}
          uncheckedIcon={uncheckedIcon}
        />

        <Divider />

        <Button
          type="clear"
          title="Add Selection"
          containerStyle={{marginVertical: 5}}
          icon={<Icon name="plus" color={colors.primary} size={20} />}
        />
      </Card>
    );
  }
}

export default CustomizationOptionsCard;
