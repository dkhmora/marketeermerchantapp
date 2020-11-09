import {Field, Formik} from 'formik';
import React, {Component} from 'react';
import {View} from 'react-native';
import {Button, Card, CheckBox, Icon, Text} from 'react-native-elements';
import {colors} from '../../../../assets/colors';
import CustomInput from '../../CustomInput';
import Divider from '../../Divider';
import {foodItemOptionSelectionValidationSchema} from '../../../util/validationSchemas';
import {Picker} from '@react-native-community/picker';
import {Switch} from 'react-native-gesture-handler';

class CustomizationOptionsCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  OptionsList(props) {
    const {options, checkedIcon, uncheckedIcon, onDeleteSelection} = props;

    if (options) {
      return options
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title, 'en', {numeric: true}))
        .map((item, index) => {
          return (
            <View key={item.title}>
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
                          onPress={() => onDeleteSelection(index)}
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
    const {
      title,
      multipleSelection,
      options,
      onDeleteCustomizationOption,
      onDeleteSelection,
      onAddSelection,
      onChangeMultipleSelection,
    } = this.props;
    const checkedIcon = multipleSelection ? 'checked-square-o' : 'dot-circle-o';
    const uncheckedIcon = multipleSelection ? 'square-o' : 'circle-o';
    const {OptionsList} = this;

    return (
      <Card
        containerStyle={{
          paddingBottom: 0,
          paddingTop: 10,
          marginLeft: 0,
          marginRight: 0,
          borderRadius: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: 'ProductSans-Bold',
              marginBottom: 5,
              flex: 1,
            }}>
            {title}
          </Text>

          <View
            style={{
              flexDirection: 'row',
            }}>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.icons,
                borderRadius: 5,
                paddingVertical: 5,
                paddingHorizontal: 10,
                elevation: 2,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 16,
                }}>
                Multiple Select
              </Text>

              <Switch
                trackColor={{
                  false: '#767577',
                  true: colors.accent,
                }}
                thumbColor={'#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={onChangeMultipleSelection}
                value={multipleSelection}
              />
            </View>

            <Button
              type="clear"
              icon={<Icon name="x" color={colors.primary} size={22} />}
              onPress={() => onDeleteCustomizationOption()}
            />
          </View>
        </View>

        <OptionsList
          options={options}
          checkedIcon={checkedIcon}
          uncheckedIcon={uncheckedIcon}
          onDeleteSelection={(index) => onDeleteSelection(index)}
        />

        <Divider />

        <Formik
          innerRef={(formRef) => (this.addOptionForm = formRef)}
          validationSchema={foodItemOptionSelectionValidationSchema}
          initialValues={{
            title: '',
            price: 0,
          }}
          onSubmit={onAddSelection}>
          {({handleSubmit, isValid, values, setFieldValue}) => (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Field
                component={CustomInput}
                name="title"
                placeholder="Selection Name"
                leftIcon="plus"
                containerStyle={{flex: 2}}
              />

              <Field
                containerStyle={{flex: 1}}
                component={CustomInput}
                name="price"
                placeholder="Price"
                leftIcon={
                  <Text style={{color: colors.primary, fontSize: 25}}>₱</Text>
                }
              />

              <Button
                type="clear"
                title="Add"
                buttonStyle={{borderRadius: 30}}
                containerStyle={{borderRadius: 30, margin: 0}}
                onPress={handleSubmit}
              />
            </View>
          )}
        </Formik>
      </Card>
    );
  }
}

export default CustomizationOptionsCard;
