import React, {Component} from 'react';
import {
  Overlay,
  Text,
  Button,
  Icon,
  Input,
  ButtonGroup,
  Card,
} from 'react-native-elements';
import {
  SafeAreaView,
  StatusBar,
  Platform,
  StyleSheet,
  Dimensions,
  View,
  KeyboardAvoidingView,
  findNodeHandle,
} from 'react-native';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import {inject, observer} from 'mobx-react';
import Toast from '../components/Toast';
import {computed, when} from 'mobx';
import ImagePicker from 'react-native-image-crop-picker';
import {CardItem, Picker, Item} from 'native-base';
import FastImage from 'react-native-fast-image';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ConfirmationModal from '../components/ConfirmationModal';
import {Fade, Placeholder, PlaceholderMedia} from 'rn-placeholder';
import Divider from '../components/Divider';
import CustomizationOptionsCard from '../components/store_items/food/CustomizationOptionsCard';
import BaseHeader from '../components/BaseHeader';
import {Formik, Field} from 'formik';
import {
  itemOptionValidationSchema,
  foodItemValidationSchema,
} from '../util/validationSchemas';
import CustomInput from '../components/CustomInput';
import {ScrollView} from 'react-native-gesture-handler';

const SCREEN_HEIGHT = Dimensions.get('window').height;
@inject('detailsStore')
@inject('itemsStore')
@inject('authStore')
@observer
class EditItemScreen extends Component {
  constructor(props) {
    super(props);

    const {item} = this.props.route.params;

    this.state = {
      loading: false,
      newImagePath: null,
      imageReady: false,
      imageDisplay:
        item && item.image
          ? {uri: `https://cdn.marketeer.ph${item.image}`}
          : require('../../assets/placeholder.jpg'),
      editItemConfirmModal: false,
      selectedOptionTitle: null,
      selectedStockNumberSignIndex: 1,
      itemOptions: item && item.options ? item.options : {},
    };
  }

  @computed get categories() {
    return this.props.detailsStore.storeDetails.itemCategories;
  }

  handleTakePhoto() {
    ImagePicker.openCamera({
      width: 400,
      height: 400,
      forceJpg: true,
      mediaType: 'photo',
      cropping: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        this.setState({
          newImagePath: image.path,
          imageDisplay: {uri: image.path},
        });
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  handleSelectImage() {
    ImagePicker.openPicker({
      width: 400,
      height: 400,
      forceJpg: true,
      mediaType: 'photo',
      cropping: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        this.setState({
          newImagePath: image.path,
          imageDisplay: {uri: image.path},
        });
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  handleEditItem(values) {
    const {storeId, itemCategories} = this.props.detailsStore.storeDetails;
    const {navigation} = this.props;
    const {item} = this.props.route.params;
    const {
      newImagePath,
      selectedStockNumberSignIndex,
      itemOptions,
    } = this.state;
    const newItem = {
      ...item,
      name: values.name,
      description: values.description,
      unit: values.unit,
      price: Number(values.price),
      discountedPrice: values.discountedPrice
        ? Number(values.discountedPrice)
        : 0,
      category: values.category,
    };
    const sign = selectedStockNumberSignIndex === 0 ? '-' : '+';

    this.setState({loading: true}, () => {
      this.props.authStore.appReady = false;
      this.props.itemsStore
        .editItem(
          storeId,
          newItem,
          Number(`${sign}${values.additionalStock}`),
          itemOptions,
          newImagePath,
        )
        .then(() => {
          this.setState({loading: false}, () => {
            this.props.authStore.appReady = true;
            navigation.goBack();
            Toast({
              text: `Item ${item.name} successfully edited!`,
              type: 'success',
              duration: 3500,
              style: {margin: 20, borderRadius: 16},
            });
          });
        });
    });
  }

  async handleAddItem(values) {
    const {navigation} = this.props;
    const {newImagePath, itemOptions} = this.state;
    const {storeId} = this.props.detailsStore.storeDetails;

    this.setState({loading: true}, () => {
      this.props.authStore.appReady = false;

      const newItem = {
        category: values.category,
        name: values.name,
        description: values.description,
        unit: values.unit,
        price: Number(values.price),
        discountedPrice: values.discountedPrice
          ? Number(values.discountedPrice)
          : null,
        stock: Number(values.additionalStock),
        sales: 0,
      };

      this.props.itemsStore
        .addStoreItem(storeId, newItem, itemOptions, newImagePath)
        .then(() => {
          this.setState({loading: false}, () => {
            navigation.goBack();
            this.props.authStore.appReady = true;
            Toast({
              text: `Item ${values.name} successfully added!`,
              type: 'success',
              duration: 3500,
              style: {margin: 20, borderRadius: 16},
            });
          });
        });
    });
  }

  handleAddOption(values, {setSubmitting, setErrors, setStatus, resetForm}) {
    this.setState(
      (prevState) => ({
        itemOptions: {
          ...prevState.itemOptions,
          [values.name]: {multipleSelection: false, selection: []},
        },
      }),
      () => resetForm({}),
    );
  }

  handleDeleteOption(optionTitle) {
    const newItemOptions = {
      ...this.state.itemOptions,
    };

    delete newItemOptions[optionTitle];

    this.setState({itemOptions: newItemOptions, selectedOptionTitle: null});
  }

  handleDeleteSelection(optionTitle, selectionIndex) {
    let newItemOptions = {
      ...this.state.itemOptions,
    };

    newItemOptions[optionTitle].selection.splice(selectionIndex, 1);

    this.setState({itemOptions: newItemOptions});
  }

  handleAddSelection(optionTitle, values, {resetForm}) {
    let newItemOptions = {
      ...this.state.itemOptions,
    };

    newItemOptions[optionTitle].selection.push({
      price: Number(values.price),
      title: values.title,
    });

    this.setState({itemOptions: newItemOptions}, () => resetForm({}));
  }

  render() {
    const {
      imageDisplay,
      imageReady,
      loading,
      editItemConfirmModal,
      selectedStockNumberSignIndex,
      itemOptions,
      selectedOptionTitle,
    } = this.state;
    const {item, itemCategory} = this.props.route.params;
    const {navigation} = this.props;
    const {storeType} = this.props.detailsStore.storeDetails;
    const sign = selectedStockNumberSignIndex === 0 ? '-' : '+';

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title={item ? `Edit ${item.name}` : 'Add Item'}
          leftComponent={
            <Button
              type="clear"
              icon={<Icon name="x" color={colors.icons} />}
              titleStyle={{color: colors.icons}}
              containerStyle={{
                borderRadius: 30,
              }}
              onPress={() => navigation.goBack()}
            />
          }
          rightComponent={
            <Button
              title="Save"
              type="clear"
              disabled={loading}
              loading={loading}
              loadingProps={{size: 'small', color: colors.primary}}
              titleStyle={{color: colors.icons}}
              containerStyle={{
                borderRadius: 30,
              }}
              onPress={() => this.setState({editItemConfirmModal: true})}
            />
          }
        />
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          keyboardOpeningTime={20}
          innerRef={(ref) => {
            this.scroll = ref;
          }}
          contentContainerStyle={{paddingBottom: 20, flexGrow: 1}}
          style={{
            paddingHorizontal: 15,
            paddingTop: 15,
          }}>
          <View style={{flex: 1}}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingBottom: 10,
              }}>
              <View style={{flex: 1, height: 150}}>
                {imageDisplay && (
                  <FastImage
                    source={imageDisplay}
                    style={{
                      alignSelf: 'flex-start',
                      borderColor: '#BDBDBD',
                      borderRadius: 10,
                      borderWidth: 1,
                      height: 150,
                      width: 150,
                    }}
                    onLoad={() => this.setState({imageReady: true})}
                  />
                )}

                {!imageReady && (
                  <View style={{position: 'absolute'}}>
                    <Placeholder Animation={Fade}>
                      <PlaceholderMedia
                        style={{
                          alignSelf: 'flex-start',
                          backgroundColor: colors.primary,
                          borderColor: '#BDBDBD',
                          borderRadius: 10,
                          borderWidth: 1,
                          height: 150,
                          width: 150,
                        }}
                      />
                    </Placeholder>
                  </View>
                )}
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  paddingHorizontal: 15,
                }}>
                <Button
                  title="Select Photo"
                  titleStyle={{color: colors.icons, marginLeft: 5}}
                  icon={<Icon name="image" color={colors.icons} />}
                  iconLeft
                  buttonStyle={{backgroundColor: colors.primary}}
                  onPress={() => this.handleSelectImage()}
                />

                <Text style={{textAlign: 'center', marginVertical: 12}}>
                  or
                </Text>

                <Button
                  title="Take Photo"
                  titleStyle={{color: colors.icons, marginLeft: 5}}
                  icon={<Icon name="camera" color={colors.icons} />}
                  iconLeft
                  buttonStyle={{backgroundColor: colors.primary}}
                  onPress={() => this.handleTakePhoto()}
                />
              </View>
            </View>

            <Card
              containerStyle={{
                marginRight: 0,
                marginLeft: 0,
                marginTop: 0,
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              <Text note style={{textAlign: 'left'}}>
                Tip: Uploading a photo makes customers more likely to buy your
                product!
              </Text>
            </Card>

            <Formik
              innerRef={(formRef) => (this.formikRef = formRef)}
              validationSchema={foodItemValidationSchema}
              initialValues={
                item
                  ? {
                      name: item.name,
                      description: item.description,
                      unit: item.unit,
                      price: String(item.price),
                      discountedPrice: String(item.discountedPrice),
                      additionalStock: 0,
                      category: item.category,
                    }
                  : {
                      name: '',
                      description: '',
                      unit: '',
                      price: null,
                      discountedPrice: null,
                      additionalStock: null,
                      category: itemCategory,
                    }
              }
              onSubmit={(values) => {
                this.setState({editItemConfirmModal: false}, () => {
                  item
                    ? this.handleEditItem(values)
                    : this.handleAddItem(values);
                });
              }}>
              {({handleSubmit, isValid, values, setFieldValue}) => (
                <View>
                  <ConfirmationModal
                    isVisible={editItemConfirmModal}
                    title={
                      item
                        ? `Edit Item "${item.name}"`
                        : `Add Item "${values.name}"`
                    }
                    body={
                      item
                        ? `Are you sure you want to edit "${item.name}"? Buyers will immediately see changes.`
                        : `Are you sure you want to add the item "${values.name}"? Buyers will immediately see changes.`
                    }
                    onConfirm={() => {
                      handleSubmit();
                    }}
                    closeModal={() =>
                      this.setState({editItemConfirmModal: false})
                    }
                  />

                  <ConfirmationModal
                    isVisible={selectedOptionTitle !== null}
                    title={
                      selectedOptionTitle
                        ? `Remove Option ${selectedOptionTitle}`
                        : ''
                    }
                    body={
                      selectedOptionTitle
                        ? `Are you sure you want to remove the customization option ${selectedOptionTitle}? This will also remove all selections within the option.`
                        : ''
                    }
                    onConfirm={() => {
                      this.handleDeleteOption(selectedOptionTitle);
                    }}
                    closeModal={() =>
                      this.setState({selectedOptionTitle: null})
                    }
                  />

                  <View style={styles.action}>
                    <Item
                      style={{
                        paddingHorizontal: 10,
                        flex: 1,
                        borderBottomWidth: 0,
                      }}>
                      <View style={[styles.icon_container, {flex: 1}]}>
                        <Icon name="folder" color={colors.primary} size={20} />
                      </View>
                      <Picker
                        note={false}
                        placeholder="Select Item Category"
                        mode="dropdown"
                        selectedValue={values.category}
                        iosIcon={<Icon name="chevron-down" />}
                        itemTextStyle={{textAlign: 'right'}}
                        onValueChange={(value) =>
                          setFieldValue('category', value)
                        }>
                        {this.categories &&
                          this.categories.map((cat, index) => {
                            return (
                              <Picker.Item
                                key={index}
                                label={cat}
                                value={cat}
                              />
                            );
                          })}
                      </Picker>
                    </Item>
                  </View>

                  <Field
                    component={CustomInput}
                    name="name"
                    placeholder={item ? `${item.name}'s Name` : 'Item Name'}
                    leftIcon="type"
                  />

                  <Field
                    component={CustomInput}
                    name="description"
                    leftIcon="align-justify"
                    placeholder={
                      item ? `${item.name}'s Description` : 'Item Description'
                    }
                    maxLength={150}
                    numberOfLines={3}
                    multiline
                    inputStyle={{textAlignVertical: 'top'}}
                    autoCapitalize="sentences"
                  />

                  <View style={{flexDirection: 'row'}}>
                    <Field
                      component={CustomInput}
                      name="price"
                      placeholder={item ? `${item.name}'s Price` : 'Item Price'}
                      leftIcon={
                        <Text style={{color: colors.primary, fontSize: 25}}>
                          ₱
                        </Text>
                      }
                      containerStyle={{flex: 1}}
                      maxLength={10}
                      keyboardType="numeric"
                      autoCapitalize="none"
                    />

                    <Text
                      style={{
                        fontSize: 34,
                        textAlignVertical: 'center',
                        marginBottom: 15,
                      }}>
                      /
                    </Text>

                    <Field
                      component={CustomInput}
                      name="unit"
                      placeholder={item ? `${item.name}'s Unit` : 'Item Unit'}
                      maxLength={10}
                      containerStyle={{flex: 1}}
                      autoCapitalize="none"
                    />
                  </View>

                  <Field
                    component={CustomInput}
                    name="discountedPrice"
                    placeholder={
                      item
                        ? `${item.name}'s Discounted Price`
                        : 'Item Discounted Price'
                    }
                    maxLength={10}
                    containerStyle={{flex: 1}}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    leftIcon={
                      <Text style={{color: colors.primary, fontSize: 25}}>
                        ₱
                      </Text>
                    }
                  />

                  {storeType === 'basic' && (
                    <View>
                      {item && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignSelf: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.icons,
                            elevation: 2,
                            borderRadius: 10,
                            paddingHorizontal: 5,
                            paddingVertical: 2,
                          }}>
                          <Text>{'Current Stock/New Stock: '}</Text>

                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'ProductSans-Bold',
                            }}>{`${item.stock} | `}</Text>

                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'ProductSans-Bold',
                              color: colors.accent,
                            }}>{`${
                            values.additionalStock
                              ? Math.max(
                                  0,
                                  Number(`${sign}${values.additionalStock}`) +
                                    item.stock,
                                )
                              : item.stock
                          }`}</Text>
                        </View>
                      )}

                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        {item && (
                          <ButtonGroup
                            onPress={(index) =>
                              this.setState({
                                selectedStockNumberSignIndex: index,
                              })
                            }
                            selectedIndex={selectedStockNumberSignIndex}
                            buttons={['-', '+']}
                            activeOpacity={0.7}
                            buttonStyle={{
                              borderRadius: 40,
                            }}
                            buttonContainerStyle={{
                              borderRadius: 40,
                            }}
                            innerBorderStyle={{color: 'transparent', width: 10}}
                            containerStyle={{
                              height: 40,
                              width: 100,
                              borderRadius: 40,
                              elevation: 2,
                              shadowColor: '#000',
                              shadowOffset: {
                                width: 0,
                                height: 1,
                              },
                              shadowOpacity: 0.2,
                              shadowRadius: 1.41,
                            }}
                            textStyle={{textAlign: 'center'}}
                            selectedButtonStyle={{
                              backgroundColor: colors.icons,
                              borderColor: colors.primary,
                              borderWidth: 1,
                            }}
                            selectedTextStyle={{
                              color: colors.primary,
                            }}
                          />
                        )}

                        <Field
                          component={CustomInput}
                          name="additionalStock"
                          placeholder={
                            item
                              ? `${
                                  selectedStockNumberSignIndex === 0
                                    ? 'Decrease'
                                    : 'Increase'
                                } ${item.name} Stock`
                              : 'Item Initial Stock'
                          }
                          placeholderStyle={{color: colors.primary}}
                          maxLength={10}
                          containerStyle={{flex: 1}}
                          keyboardType="numeric"
                          autoCapitalize="none"
                          leftIcon="hash"
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </Formik>

            {storeType === 'food' && (
              <View>
                <Divider />

                <View
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                  }}>
                  <Text style={{fontSize: 24}}>Customization</Text>

                  {Object.entries(itemOptions).map(
                    ([optionTitle, optionData], index) => {
                      const {multipleSelection, selection} = optionData;

                      return (
                        <CustomizationOptionsCard
                          key={optionTitle}
                          title={optionTitle}
                          multipleSelection={multipleSelection}
                          options={selection}
                          onDeleteCustomizationOption={() =>
                            this.setState({selectedOptionTitle: optionTitle})
                          }
                          onDeleteSelection={(selectionIndex) =>
                            this.handleDeleteSelection(
                              optionTitle,
                              selectionIndex,
                            )
                          }
                          onAddSelection={(values, {resetForm}) =>
                            this.handleAddSelection(optionTitle, values, {
                              resetForm,
                            })
                          }
                        />
                      );
                    },
                  )}
                </View>

                <Divider />

                <Formik
                  innerRef={(formRef) => (this.addOptionForm = formRef)}
                  validationSchema={itemOptionValidationSchema}
                  initialValues={{
                    name: '',
                  }}
                  onSubmit={this.handleAddOption.bind(this)}>
                  {({handleSubmit, isValid, values, setFieldValue}) => (
                    <View>
                      <Card
                        containerStyle={{
                          paddingBottom: 0,
                          paddingTop: 10,
                          marginTop: 10,
                          borderRadius: 10,
                          marginLeft: 0,
                          marginRight: 0,
                        }}>
                        <Field
                          component={CustomInput}
                          name="name"
                          placeholder="Add Customization Option"
                          leftIcon="plus"
                          rightIcon={
                            <Button
                              type="clear"
                              title="Add"
                              containerStyle={{marginVertical: 5}}
                              onPress={handleSubmit}
                            />
                          }
                        />
                      </Card>
                    </View>
                  )}
                </Formik>
              </View>
            )}
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

export default EditItemScreen;
