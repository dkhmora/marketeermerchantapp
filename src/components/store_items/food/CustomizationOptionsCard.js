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

  render() {
    const {title, multipleSelection, options} = this.props;
    const checkedIcon = multipleSelection ? 'checked-square-o' : 'dot-circle-o';
    const uncheckedIcon = multipleSelection ? 'square-o' : 'circle-o';

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

        <View style={{paddingBottom: 10}}>
          {options &&
            options.map((item) => {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <CheckBox
                    disabled
                    center
                    title={item.title}
                    checkedIcon={checkedIcon}
                    uncheckedIcon={uncheckedIcon}
                    containerStyle={{
                      flex: 1,
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                    }}
                    textStyle={{
                      flex: 1,
                    }}
                  />

                  <View
                    style={{
                      width: 70,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={{fontFamily: 'ProductSans-Bold'}}>
                      +₱{item.price.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>

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
