import React, {Component} from 'react';
import {ActivityIndicator, View, SafeAreaView, Image} from 'react-native';
import {Card, CardItem} from 'native-base';
// Custom Components
import BaseHeader from '../components/BaseHeader';
// Mobx
import {inject, observer} from 'mobx-react';
import {computed} from 'mobx';
import {Text, Icon, Button, CheckBox} from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import BaseOptionsMenu from '../components/BaseOptionsMenu';
import {colors} from '../../assets/colors';
import {Switch} from 'react-native-gesture-handler';
import StoreCard from '../components/StoreCard';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from '../components/Toast';
import crashlytics from '@react-native-firebase/crashlytics';
import CardItemHeader from '../components/CardItemHeader';
import {Fade, Placeholder, PlaceholderMedia} from 'rn-placeholder';
import firebase from '@react-native-firebase/app';
import {Field, Formik} from 'formik';
import {
  deliveryDetailsValidationSchema,
  storeDetailsValidationSchema,
} from '../util/validationSchemas';
import CustomInput from '../components/CustomInput';

const publicStorageBucket = firebase.app().storage('gs://marketeer-public');
@inject('detailsStore')
@inject('itemsStore')
@observer
class DashboardScreen extends Component {
  constructor(props) {
    super(props);

    this.props.detailsStore.setStoreDetails(
      this.props.detailsStore.storeDetails.storeId,
    );

    this.state = {
      displayImageUrl: null,
      coverImageUrl: null,
      displayImageReady: false,
      coverImageReady: false,
      displayImageWidth: null,
      coverImageWidth: null,
      deliveryDetailsEditMode: false,
      deliveryDetailsSaving: false,
      deliverySettingsIsValid: false,
      storeDetailsEditMode: false,
      storeDetailsSaving: false,
      storeDetailsIsValid: false,
    };
  }

  componentDidMount() {
    const {displayImageUrl, coverImageUrl} = this.state;

    if (!displayImageUrl || !coverImageUrl) {
      this.getImage();
    }

    crashlytics().log('DashboardScreen');
  }

  componentDidUpdate(prevProps, prevState) {
    const {displayImageUrl, coverImageUrl} = this.state;

    if (
      prevProps.detailsStore.storeDetails.updatedAt !==
        this.props.detailsStore.storeDetails.updatedAt ||
      !displayImageUrl ||
      !coverImageUrl
    ) {
      this.getImage();
    }
  }

  @computed get selectedPaymentMethods() {
    const {availablePaymentMethods} = this.props.detailsStore.storeDetails;

    if (availablePaymentMethods) {
      return Object.entries(availablePaymentMethods)
        .filter(([key, value]) => value.activated)
        .map(([key, value]) => key);
    }

    return [];
  }

  getImage = async () => {
    const {displayImage, coverImage} = this.props.detailsStore.storeDetails;

    if (displayImage) {
      const displayRef = publicStorageBucket.ref(displayImage);
      const displayLink = await displayRef.getDownloadURL().catch((err) => {
        Toast({text: err.message, type: 'danger'});
        return null;
      });

      if (displayLink) {
        this.setState({
          displayImageUrl: {uri: displayLink},
        });
      }
    }

    if (coverImage) {
      const coverRef = publicStorageBucket.ref(coverImage);
      const coverLink = await coverRef.getDownloadURL().catch((err) => {
        Toast({text: err.message, type: 'danger'});
        return null;
      });

      if (coverLink) {
        this.setState({coverImageUrl: {uri: coverLink}});
      }
    }
  };

  handleTakePhoto(type) {
    const height = type === 'display' ? 600 : 720;
    const width = type === 'display' ? 600 : 1080;

    return ImagePicker.openCamera({
      width,
      height,
      cropping: true,
      mediaType: 'photo',
      forceJpg: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        return image.path;
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  handleSelectImage(type) {
    const height = type === 'display' ? 600 : 720;
    const width = type === 'display' ? 600 : 1080;

    return ImagePicker.openPicker({
      width,
      height,
      cropping: true,
      mediaType: 'photo',
      forceJpg: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        return image.path;
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  handleEditDeliverySettings(values) {
    this.setState(
      {deliveryDetailsSaving: true, deliveryDetailsEditMode: false},
      async () => {
        await this.props.detailsStore.updateStoreDetails(values).then(() => {
          this.setState({deliveryDetailsSaving: false}, () =>
            Toast({
              text: 'Delivery details successfully updated!',
              type: 'success',
              duration: 3000,
            }),
          );
        });
      },
    );
  }

  handleEditStoreDetails(values) {
    this.setState(
      {storeDetailsSaving: true, storeDetailsEditMode: false},
      async () => {
        if (!values.displayImage) {
          delete values.displayImage;
        }

        if (!values.coverImage) {
          delete values.coverImage;
        }

        await this.props.detailsStore.updateStoreDetails(values).then(() => {
          this.setState({storeDetailsSaving: false}, () =>
            Toast({
              text: 'Store details successfully updated!',
              type: 'success',
              duration: 3000,
            }),
          );
        });
      },
    );
  }

  CategoryPills = (items) => {
    const pills = [];

    if (items) {
      if (items.length > 0) {
        items.map((item, index) => {
          pills.push(
            <View
              key={index}
              style={{
                borderRadius: 20,
                backgroundColor: colors.accent,
                marginTop: 5,
                padding: 3,
                paddingHorizontal: 10,
                marginRight: 2,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'ProductSans-Regular',
                  color: colors.icons,
                  textAlign: 'center',
                }}>
                {item}
              </Text>
            </View>,
          );
        });
      }
    }

    return pills;
  };

  render() {
    const {
      storeDescription,
      storeName,
      vacationMode,
      deliveryType,
      orderNumber,
      storeCategory,
      availableDeliveryMethods,
      availablePaymentMethods,
      deliveryDiscount,
    } = this.props.detailsStore.storeDetails;

    const selectablePaymentMethods = availablePaymentMethods
      ? Object.keys(availablePaymentMethods)
      : [];

    const {
      coverImageUrl,
      displayImageUrl,
      displayImageReady,
      coverImageReady,
      displayImageWidth,
      coverImageWidth,
      deliverySettingsIsValid,
      deliveryDetailsEditMode,
      deliveryDetailsSaving,
      storeDetailsEditMode,
      storeDetailsSaving,
      storeDetailsIsValid,
    } = this.state;

    const {navigation} = this.props;

    const deliveryTypes = [
      'Same Day Delivery',
      'Next Day Delivery',
      'Scheduled Delivery',
    ];

    return (
      <View style={{flex: 1}}>
        <BaseHeader title={this.props.route.name} navigation={navigation} />

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
                <Card style={{borderRadius: 10, overflow: 'hidden'}}>
                  <CardItemHeader title="Store Card Preview" />

                  <CardItem
                    bordered
                    style={{
                      flex: 1,
                      paddingLeft: 0,
                      paddingRight: 0,
                      paddingBottom: 0,
                      paddingTop: 0,
                    }}>
                    <StoreCard store={this.props.detailsStore.storeDetails} />
                  </CardItem>
                </Card>
              </View>

              <Formik
                validateOnMount
                validationSchema={storeDetailsValidationSchema}
                initialValues={{
                  displayImage: null,
                  coverImage: null,
                  storeDescription,
                  availablePaymentMethods,
                  vacationMode,
                }}
                onSubmit={(values) => {
                  this.handleEditStoreDetails(values);
                }}>
                {({
                  handleSubmit,
                  isValid,
                  values,
                  setFieldValue,
                  resetForm,
                }) => {
                  if (storeDetailsIsValid !== isValid) {
                    this.setState({storeDetailsIsValid: isValid});
                  }

                  return (
                    <Card
                      style={{
                        borderRadius: 10,
                      }}>
                      <View style={{borderRadius: 10, overflow: 'hidden'}}>
                        <CardItemHeader
                          title="Store Details"
                          titleStyle={
                            storeDetailsEditMode ? {color: colors.icons} : {}
                          }
                          style={
                            storeDetailsEditMode
                              ? {
                                  backgroundColor: colors.accent,
                                }
                              : {}
                          }
                          leftComponent={
                            storeDetailsEditMode && (
                              <Button
                                type="clear"
                                color={colors.icons}
                                icon={<Icon name="x" color={colors.icons} />}
                                onPress={() => {
                                  this.setState(
                                    {storeDetailsEditMode: false},
                                    () => resetForm(),
                                  );
                                }}
                                titleStyle={{color: colors.icons}}
                                containerStyle={{
                                  borderRadius: 24,
                                }}
                              />
                            )
                          }
                          rightComponent={
                            storeDetailsEditMode ? (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'flex-end',
                                  justifyContent: 'space-between',
                                }}>
                                <Button
                                  type="clear"
                                  title="Save"
                                  titleStyle={{color: colors.icons}}
                                  loading={storeDetailsSaving}
                                  loadingProps={{color: colors.icons}}
                                  onPress={() => handleSubmit()}
                                  disabled={!storeDetailsIsValid}
                                  disabledTitleStyle={{
                                    color: colors.text_disabled,
                                  }}
                                />
                              </View>
                            ) : (
                              <BaseOptionsMenu
                                iconColor={
                                  storeDetailsEditMode
                                    ? colors.icons
                                    : colors.primary
                                }
                                options={['Edit Store Details']}
                                actions={[
                                  () =>
                                    this.setState({
                                      storeDetailsEditMode: true,
                                    }),
                                ]}
                              />
                            )
                          }
                        />

                        <CardItem bordered>
                          <View
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}>
                            <View style={{paddingRight: 10}}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Display Image
                              </Text>

                              {storeDetailsEditMode && (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                  }}>
                                  <Button
                                    type="clear"
                                    titleStyle={{color: colors.accent}}
                                    color={colors.icons}
                                    onPress={() =>
                                      this.handleTakePhoto(
                                        'display',
                                      ).then((imagePath) =>
                                        setFieldValue(
                                          'displayImage',
                                          imagePath,
                                        ),
                                      )
                                    }
                                    icon={
                                      <Icon
                                        name="camera"
                                        color={colors.accent}
                                      />
                                    }
                                    containerStyle={{borderRadius: 24}}
                                  />

                                  <Button
                                    type="clear"
                                    titleStyle={{color: colors.accent}}
                                    color={colors.icons}
                                    onPress={() =>
                                      this.handleSelectImage(
                                        'display',
                                      ).then((imagePath) =>
                                        setFieldValue(
                                          'displayImage',
                                          imagePath,
                                        ),
                                      )
                                    }
                                    icon={
                                      <Icon
                                        name="image"
                                        color={colors.accent}
                                      />
                                    }
                                    containerStyle={{borderRadius: 24}}
                                  />
                                </View>
                              )}
                            </View>

                            <View
                              style={{
                                flex: 1,
                                alignSelf: 'flex-start',
                                alignItems: 'flex-end',
                              }}>
                              <View
                                onLayout={(event) =>
                                  this.setState({
                                    displayImageWidth:
                                      event.nativeEvent.layout.width,
                                  })
                                }>
                                <View
                                  style={{
                                    width: '70%',
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: storeDetailsEditMode
                                      ? colors.accent
                                      : colors.primary,
                                    overflow: 'hidden',
                                  }}>
                                  <Image
                                    source={
                                      storeDetailsEditMode &&
                                      values.displayImage
                                        ? {uri: values.displayImage}
                                        : displayImageUrl
                                    }
                                    style={{
                                      width: '100%',
                                      aspectRatio: 1,
                                      resizeMode: 'contain',
                                    }}
                                    onLoadStart={() =>
                                      this.setState({displayImageReady: false})
                                    }
                                    onLoad={() =>
                                      this.setState({displayImageReady: true})
                                    }
                                  />
                                </View>

                                {!displayImageReady && (
                                  <View
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                    }}>
                                    <Placeholder Animation={Fade}>
                                      <PlaceholderMedia
                                        style={{
                                          backgroundColor: colors.primary,
                                          borderRadius: 10,
                                          width: displayImageWidth
                                            ? displayImageWidth
                                            : 0,
                                          height: displayImageWidth
                                            ? displayImageWidth
                                            : 0,
                                        }}
                                      />
                                    </Placeholder>
                                  </View>
                                )}
                              </View>
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
                            }}>
                            <View style={{paddingRight: 10}}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Cover Image
                              </Text>

                              {storeDetailsEditMode && (
                                <View style={{flexDirection: 'row'}}>
                                  <Button
                                    type="clear"
                                    color={colors.icons}
                                    titleStyle={{color: colors.accent}}
                                    icon={
                                      <Icon
                                        name="camera"
                                        color={colors.accent}
                                      />
                                    }
                                    onPress={() =>
                                      this.handleTakePhoto(
                                        'cover',
                                      ).then((imagePath) =>
                                        setFieldValue('coverImage', imagePath),
                                      )
                                    }
                                    containerStyle={{borderRadius: 24}}
                                  />
                                  <Button
                                    type="clear"
                                    color={colors.icons}
                                    titleStyle={{color: colors.accent}}
                                    icon={
                                      <Icon
                                        name="image"
                                        color={colors.accent}
                                      />
                                    }
                                    onPress={() =>
                                      this.handleSelectImage(
                                        'cover',
                                      ).then((imagePath) =>
                                        setFieldValue('coverImage', imagePath),
                                      )
                                    }
                                    containerStyle={{borderRadius: 24}}
                                  />
                                </View>
                              )}
                            </View>

                            <View
                              style={{
                                flex: 1,
                                alignSelf: 'flex-start',
                                alignItems: 'flex-end',
                              }}>
                              <View
                                onLayout={(event) =>
                                  this.setState({
                                    coverImageWidth:
                                      event.nativeEvent.layout.width,
                                  })
                                }>
                                <View
                                  style={{
                                    width: '100%',
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: storeDetailsEditMode
                                      ? colors.accent
                                      : colors.primary,
                                    overflow: 'hidden',
                                  }}>
                                  <Image
                                    source={
                                      storeDetailsEditMode && values.coverImage
                                        ? {uri: values.coverImage}
                                        : coverImageUrl
                                    }
                                    style={{
                                      width: '100%',
                                      aspectRatio: 1620 / 1080,
                                      resizeMode: 'contain',
                                    }}
                                    onLoadStart={() =>
                                      this.setState({coverImageReady: false})
                                    }
                                    onLoad={() =>
                                      this.setState({coverImageReady: true})
                                    }
                                  />
                                </View>

                                {!coverImageReady && (
                                  <View
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                    }}>
                                    <Placeholder Animation={Fade}>
                                      <PlaceholderMedia
                                        style={{
                                          backgroundColor: colors.primary,
                                          borderRadius: 10,
                                          width: coverImageWidth
                                            ? coverImageWidth
                                            : 0,
                                          height: coverImageWidth
                                            ? coverImageWidth
                                            : 0,
                                        }}
                                      />
                                    </Placeholder>
                                  </View>
                                )}
                              </View>
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
                            }}>
                            <View style={{flex: 1, paddingright: 10}}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Store Name
                              </Text>
                            </View>

                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                              <Text
                                style={{
                                  color: colors.primary,
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                  textAlign: 'right',
                                }}>
                                {storeName}
                              </Text>
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
                            }}>
                            <View style={{flex: 1, paddingright: 10}}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Store Description
                              </Text>
                            </View>

                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                              {storeDetailsEditMode ? (
                                <Field
                                  component={CustomInput}
                                  name="storeDescription"
                                  leftIcon="align-justify"
                                  placeholder="Store Description"
                                  maxLength={200}
                                  numberOfLines={3}
                                  multiline
                                  inputStyle={{textAlignVertical: 'top'}}
                                  autoCapitalize="sentences"
                                />
                              ) : (
                                <Text
                                  style={{
                                    color: colors.primary,
                                    fontSize: 16,
                                    fontFamily: 'ProductSans-Bold',
                                    textAlign: 'right',
                                  }}>
                                  {storeDescription}
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
                            }}>
                            <View style={{flex: 1, paddingright: 10}}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Store Category
                              </Text>
                            </View>

                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                              <Text
                                style={{
                                  color: colors.primary,
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                  textAlign: 'right',
                                }}>
                                {storeCategory}
                              </Text>
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
                            }}>
                            <View style={{flex: 1, paddingright: 10}}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Payment Methods
                              </Text>
                            </View>

                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                              {storeDetailsEditMode ? (
                                <View>
                                  {selectablePaymentMethods.map(
                                    (paymentMethod, index) => (
                                      <CheckBox
                                        title={paymentMethod}
                                        checked={
                                          values.availablePaymentMethods[
                                            paymentMethod
                                          ].activated
                                        }
                                        key={`${paymentMethod}${index}`}
                                        onPress={() =>
                                          setFieldValue(
                                            `availablePaymentMethods["${paymentMethod}"].activated`,
                                            !values.availablePaymentMethods[
                                              paymentMethod
                                            ].activated,
                                          )
                                        }
                                      />
                                    ),
                                  )}
                                </View>
                              ) : (
                                this.CategoryPills(this.selectedPaymentMethods)
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
                            }}>
                            <View style={{flex: 1, paddingright: 10}}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Number of Orders
                              </Text>
                            </View>

                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                              <Text
                                style={{
                                  color: colors.primary,
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                  textAlign: 'right',
                                }}>
                                {orderNumber ? orderNumber : 0}
                              </Text>
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
                            }}>
                            <View style={{flex: 1, paddingright: 10}}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Vacation Mode
                              </Text>
                            </View>

                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                              <Switch
                                trackColor={{
                                  false: '#767577',
                                  true: storeDetailsEditMode
                                    ? colors.accent
                                    : colors.primary,
                                }}
                                thumbColor={'#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={() =>
                                  setFieldValue(
                                    'vacationMode',
                                    !values.vacationMode,
                                  )
                                }
                                value={
                                  storeDetailsEditMode
                                    ? values.vacationMode
                                    : vacationMode
                                }
                                disabled={!storeDetailsEditMode}
                              />
                            </View>
                          </View>
                        </CardItem>
                      </View>
                    </Card>
                  );
                }}
              </Formik>

              <Formik
                innerRef={(formRef) => (this.formikRef = formRef)}
                validateOnMount
                validationSchema={deliveryDetailsValidationSchema}
                initialValues={{
                  availableDeliveryMethods,
                  deliveryDiscount,
                  deliveryType,
                }}
                onSubmit={(values) => {
                  this.handleEditDeliverySettings(values);
                }}>
                {({
                  handleSubmit,
                  isValid,
                  values,
                  setFieldValue,
                  resetForm,
                }) => {
                  if (deliverySettingsIsValid !== isValid) {
                    this.setState({deliverySettingsIsValid: isValid});
                  }

                  return (
                    <>
                      <Card
                        style={{
                          borderRadius: 10,
                        }}>
                        <View style={{borderRadius: 10, overflow: 'hidden'}}>
                          <CardItemHeader
                            title="Delivery Settings"
                            titleStyle={
                              deliveryDetailsEditMode
                                ? {color: colors.icons}
                                : {}
                            }
                            style={
                              deliveryDetailsEditMode
                                ? {
                                    backgroundColor: colors.accent,
                                  }
                                : {}
                            }
                            leftComponent={
                              deliveryDetailsEditMode && (
                                <Button
                                  type="clear"
                                  color={colors.icons}
                                  icon={<Icon name="x" color={colors.icons} />}
                                  onPress={() => {
                                    this.setState(
                                      {deliveryDetailsEditMode: false},
                                      () => resetForm(),
                                    );
                                  }}
                                  titleStyle={{color: colors.icons}}
                                  containerStyle={{
                                    borderRadius: 24,
                                  }}
                                />
                              )
                            }
                            rightComponent={
                              deliveryDetailsEditMode ? (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between',
                                  }}>
                                  <Button
                                    type="clear"
                                    title="Save"
                                    titleStyle={{color: colors.icons}}
                                    loading={deliveryDetailsSaving}
                                    loadingProps={{color: colors.icons}}
                                    onPress={() => handleSubmit()}
                                    disabled={!deliverySettingsIsValid}
                                    disabledTitleStyle={{
                                      color: colors.text_disabled,
                                    }}
                                  />
                                </View>
                              ) : (
                                <BaseOptionsMenu
                                  iconColor={
                                    deliveryDetailsEditMode
                                      ? colors.icons
                                      : colors.primary
                                  }
                                  options={['Edit Delivery Settings']}
                                  actions={[
                                    () =>
                                      this.setState({
                                        deliveryDetailsEditMode: true,
                                      }),
                                  ]}
                                />
                              )
                            }
                          />

                          {availableDeliveryMethods['Mr. Speedy'] && (
                            <CardItem bordered>
                              <View style={{width: '100%'}}>
                                <View
                                  style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontFamily: 'ProductSans-Bold',
                                    }}>
                                    Mr. Speedy
                                  </Text>

                                  <Switch
                                    trackColor={{
                                      false: '#767577',
                                      true: deliveryDetailsEditMode
                                        ? colors.accent
                                        : colors.primary,
                                    }}
                                    thumbColor={'#f4f3f4'}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={() =>
                                      setFieldValue(
                                        'availableDeliveryMethods["Mr. Speedy"].activated',
                                        !values.availableDeliveryMethods[
                                          'Mr. Speedy'
                                        ].activated,
                                      )
                                    }
                                    value={
                                      deliveryDetailsEditMode
                                        ? values.availableDeliveryMethods[
                                            'Mr. Speedy'
                                          ].activated
                                        : availableDeliveryMethods['Mr. Speedy']
                                            .activated
                                    }
                                    disabled={!deliveryDetailsEditMode}
                                  />
                                </View>
                              </View>
                            </CardItem>
                          )}

                          {availableDeliveryMethods['Own Delivery'] && (
                            <CardItem bordered>
                              <View style={{width: '100%'}}>
                                <View
                                  style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontFamily: 'ProductSans-Bold',
                                    }}>
                                    Own Delivery
                                  </Text>

                                  <Switch
                                    trackColor={{
                                      false: '#767577',
                                      true: deliveryDetailsEditMode
                                        ? colors.accent
                                        : colors.primary,
                                    }}
                                    thumbColor={'#f4f3f4'}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={() =>
                                      setFieldValue(
                                        'availableDeliveryMethods["Own Delivery"].activated',
                                        !values.availableDeliveryMethods[
                                          'Own Delivery'
                                        ].activated,
                                      )
                                    }
                                    value={
                                      deliveryDetailsEditMode
                                        ? values.availableDeliveryMethods[
                                            'Own Delivery'
                                          ].activated
                                        : availableDeliveryMethods[
                                            'Own Delivery'
                                          ].activated
                                    }
                                    disabled={!deliveryDetailsEditMode}
                                  />
                                </View>

                                <Card
                                  style={{
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                    marginTop: 10,
                                  }}>
                                  <CardItem bordered>
                                    <View
                                      style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                      }}>
                                      <View style={{flex: 1, paddingright: 10}}>
                                        <Text
                                          style={{
                                            fontSize: 16,
                                          }}>
                                          Delivery Price
                                        </Text>
                                      </View>

                                      <View
                                        style={{
                                          flex: 1,
                                          alignItems: 'flex-end',
                                        }}>
                                        {deliveryDetailsEditMode ? (
                                          <Field
                                            component={CustomInput}
                                            name="availableDeliveryMethods.Own Delivery.deliveryPrice"
                                            placeholder="Delivery Price"
                                            leftIcon={
                                              <Text
                                                style={{
                                                  color: colors.primary,
                                                  fontSize: 25,
                                                }}>
                                                ₱
                                              </Text>
                                            }
                                            containerStyle={{flex: 1}}
                                            maxLength={10}
                                            keyboardType="numeric"
                                            autoCapitalize="none"
                                            type="number"
                                          />
                                        ) : (
                                          <Text
                                            style={{
                                              color: colors.primary,
                                              fontSize: 16,
                                              fontFamily: 'ProductSans-Bold',
                                              textAlign: 'right',
                                            }}>
                                            {availableDeliveryMethods[
                                              'Own Delivery'
                                            ].deliveryPrice
                                              ? `₱${availableDeliveryMethods['Own Delivery'].deliveryPrice}`
                                              : 'Not Set'}
                                          </Text>
                                        )}
                                      </View>
                                    </View>
                                  </CardItem>
                                </Card>
                              </View>
                            </CardItem>
                          )}

                          {deliveryDiscount && (
                            <CardItem bordered>
                              <View
                                style={{
                                  width: '100%',
                                }}>
                                <View
                                  style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontFamily: 'ProductSans-Bold',
                                    }}>
                                    Delivery Fee Discount
                                  </Text>

                                  <Switch
                                    trackColor={{
                                      false: '#767577',
                                      true: deliveryDetailsEditMode
                                        ? colors.accent
                                        : colors.primary,
                                    }}
                                    thumbColor={'#f4f3f4'}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={() =>
                                      setFieldValue(
                                        'deliveryDiscount.activated',
                                        !values.deliveryDiscount.activated,
                                      )
                                    }
                                    value={values.deliveryDiscount.activated}
                                    disabled={!deliveryDetailsEditMode}
                                  />
                                </View>

                                <Card
                                  style={{
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                    marginTop: 10,
                                  }}>
                                  <CardItem bordered>
                                    <View
                                      style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                      }}>
                                      <View style={{flex: 1, paddingright: 10}}>
                                        <Text
                                          style={{
                                            fontSize: 16,
                                          }}>
                                          Discount Amount
                                        </Text>
                                      </View>

                                      <View
                                        style={{
                                          flex: 1,
                                          alignItems: 'flex-end',
                                        }}>
                                        {deliveryDetailsEditMode ? (
                                          <Field
                                            component={CustomInput}
                                            name="deliveryDiscount.discountAmount"
                                            placeholder="Delivery Discount Amount"
                                            leftIcon={
                                              <Text
                                                style={{
                                                  color: colors.primary,
                                                  fontSize: 25,
                                                }}>
                                                ₱
                                              </Text>
                                            }
                                            containerStyle={{flex: 1}}
                                            maxLength={10}
                                            keyboardType="numeric"
                                            autoCapitalize="none"
                                            type="number"
                                          />
                                        ) : (
                                          <Text
                                            style={{
                                              color: colors.primary,
                                              fontSize: 16,
                                              fontFamily: 'ProductSans-Bold',
                                              textAlign: 'right',
                                            }}>
                                            {deliveryDiscount.discountAmount
                                              ? `₱${deliveryDiscount.discountAmount}`
                                              : 'Not Set'}
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
                                      }}>
                                      <View style={{flex: 1, paddingright: 10}}>
                                        <Text
                                          style={{
                                            fontSize: 16,
                                          }}>
                                          Minimum Order Amount
                                        </Text>
                                      </View>

                                      <View
                                        style={{
                                          flex: 1,
                                          alignItems: 'flex-end',
                                        }}>
                                        {deliveryDetailsEditMode ? (
                                          <Field
                                            component={CustomInput}
                                            name="deliveryDiscount.minimumOrderAmount"
                                            placeholder="Minimum Order Amount"
                                            leftIcon={
                                              <Text
                                                style={{
                                                  color: colors.primary,
                                                  fontSize: 25,
                                                }}>
                                                ₱
                                              </Text>
                                            }
                                            containerStyle={{flex: 1}}
                                            maxLength={10}
                                            keyboardType="numeric"
                                            autoCapitalize="none"
                                            type="number"
                                          />
                                        ) : (
                                          <Text
                                            style={{
                                              color: colors.primary,
                                              fontSize: 16,
                                              fontFamily: 'ProductSans-Bold',
                                              textAlign: 'right',
                                            }}>
                                            {deliveryDiscount.minimumOrderAmount
                                              ? `₱${deliveryDiscount.minimumOrderAmount}`
                                              : 'Not Set'}
                                          </Text>
                                        )}
                                      </View>
                                    </View>
                                  </CardItem>
                                </Card>
                              </View>
                            </CardItem>
                          )}

                          <CardItem bordered>
                            <View
                              style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}>
                              <View style={{flex: 1, paddingright: 10}}>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontFamily: 'ProductSans-Bold',
                                  }}>
                                  Delivery Period
                                </Text>
                              </View>

                              <View style={{flex: 1, alignItems: 'flex-end'}}>
                                {deliveryDetailsEditMode ? (
                                  <View>
                                    {deliveryTypes.map(
                                      (deliveryTypeName, index) => (
                                        <CheckBox
                                          key={`${deliveryTypeName}${index}`}
                                          title={deliveryTypeName}
                                          checked={
                                            values.deliveryType ===
                                            deliveryTypeName
                                          }
                                          checkedIcon="dot-circle-o"
                                          uncheckedIcon="circle-o"
                                          onPress={() =>
                                            setFieldValue(
                                              'deliveryType',
                                              deliveryTypeName,
                                            )
                                          }
                                        />
                                      ),
                                    )}
                                  </View>
                                ) : (
                                  <Text
                                    style={{
                                      color: colors.primary,
                                      fontSize: 16,
                                      fontFamily: 'ProductSans-Bold',
                                      textAlign: 'right',
                                    }}>
                                    {deliveryType}
                                  </Text>
                                )}
                              </View>
                            </View>
                          </CardItem>
                        </View>
                      </Card>
                    </>
                  );
                }}
              </Formik>

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
                  <CardItemHeader title="Sales" />

                  <CardItem bordered>
                    <Text style={{textAlign: 'center', width: '100%'}}>
                      Coming Soon! View your sales summary here in the future.
                    </Text>
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

export default DashboardScreen;
