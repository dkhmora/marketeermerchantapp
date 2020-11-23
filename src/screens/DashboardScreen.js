import React, {Component} from 'react';
import {
  ActivityIndicator,
  View,
  SafeAreaView,
  Image,
  Pressable,
} from 'react-native';
import {Card, CardItem} from 'native-base';
import BaseHeader from '../components/BaseHeader';
import {inject, observer} from 'mobx-react';
import {computed, when} from 'mobx';
import {Text, Icon, Button, CheckBox, Divider} from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import BaseOptionsMenu from '../components/BaseOptionsMenu';
import {colors} from '../../assets/colors';
import {ScrollView, Switch} from 'react-native-gesture-handler';
import StoreCard from '../components/StoreCard';
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
import FastImage from 'react-native-fast-image';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

const publicStorageBucket = firebase.app().storage('gs://marketeer-public');
@inject('detailsStore')
@inject('itemsStore')
@inject('authStore')
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
      gettingImages: false,
      displayImageWidth: null,
      coverImageWidth: null,
      deliveryDetailsEditMode: false,
      deliveryDetailsSaving: false,
      deliverySettingsIsValid: false,
      storeDetailsEditMode: false,
      storeDetailsSaving: false,
      storeDetailsIsValid: false,
      selectedDay: null,
      selectedDayPoint: null,
      selectedDayTime: null,
      imagesLoaded: false,
    };
  }

  componentDidMount() {
    crashlytics().log('DashboardScreen');

    when(
      () => Object.keys(this.props.detailsStore.storeDetails).length > 0,
      () => this.getImage(),
    );
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

    this.setState(
      {
        gettingImages: true,
      },
      async () => {
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

        this.setState({gettingImages: false});
      },
    );
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
        this.props.authStore.appReady = false;

        await this.props.detailsStore.updateStoreDetails(values).then(() => {
          this.setState({deliveryDetailsSaving: false}, () => {
            this.props.authStore.appReady = true;

            Toast({
              text: 'Delivery details successfully updated!',
              type: 'success',
              duration: 3000,
            });
          });
        });
      },
    );
  }

  handleEditStoreDetails(values) {
    this.setState(
      {storeDetailsSaving: true, storeDetailsEditMode: false},
      async () => {
        this.props.authStore.appReady = false;

        if (!values.displayImage) {
          delete values.displayImage;
        }

        if (!values.coverImage) {
          delete values.coverImage;
        }

        await this.props.detailsStore.updateStoreDetails(values).then(() => {
          this.setState({storeDetailsSaving: false}, () => {
            this.props.authStore.appReady = true;

            if (!values.displayImage) {
              this.setState({displayImageUrl: null});
            }

            if (!values.coverImage) {
              this.setState({coverImageUrl: null});
            }

            if (values.coverImage || values.displayImage) {
              this.getImage();
            }

            Toast({
              text: 'Store details successfully updated!',
              type: 'success',
              duration: 3000,
            });
          });
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
              key={`${item}${index}`}
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
      storeHours,
    } = this.props.detailsStore.storeDetails;

    const selectablePaymentMethods = availablePaymentMethods
      ? Object.keys(availablePaymentMethods)
      : [];

    const selectableDeliveryMethods = availableDeliveryMethods
      ? Object.keys(availableDeliveryMethods)
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
      selectedDay,
      selectedDayPoint,
      selectedDayTime,
    } = this.state;

    const {navigation} = this.props;

    const deliveryTypes = [
      'Same Day Delivery',
      'Next Day Delivery',
      'Scheduled Delivery',
    ];

    const daysList = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
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
          <ScrollView
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
                validationSchema={storeDetailsValidationSchema(daysList)}
                initialValues={{
                  displayImage: null,
                  coverImage: null,
                  storeDescription,
                  availablePaymentMethods,
                  vacationMode,
                  storeHours,
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
                  errors,
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

                        <DateTimePickerModal
                          isVisible={
                            selectedDay !== null &&
                            selectedDayPoint !== null &&
                            selectedDayTime !== null
                          }
                          mode="time"
                          onConfirm={(newDate) => {
                            setFieldValue(
                              `storeHours[${selectedDay}][${selectedDayPoint}]`,
                              moment(newDate).format('HH:MM'),
                            );
                            this.setState({
                              selectedDay: null,
                              selectedDayPoint: null,
                              selectedDayTime: null,
                            });
                          }}
                          onCancel={() =>
                            this.setState({
                              selectedDay: null,
                              selectedDayPoint: null,
                              selectedDayTime: null,
                            })
                          }
                          date={selectedDayTime ? selectedDayTime : new Date()}
                          locale={'en'}
                          modalTransparent={false}
                          animationType={'fade'}
                          androidMode={'default'}
                          placeHolderText={`Select time of ${selectedDayPoint} on ${selectedDay}`}
                          textStyle={{color: colors.primary}}
                          disabled={false}
                        />

                        <CardItem>
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
                                  <FastImage
                                    source={
                                      storeDetailsEditMode &&
                                      values.displayImage
                                        ? {uri: values.displayImage}
                                        : displayImageUrl
                                    }
                                    style={{
                                      flex: 1,
                                      aspectRatio: 1,
                                    }}
                                    onLoadStart={() =>
                                      this.setState({displayImageReady: false})
                                    }
                                    onLoad={() =>
                                      this.setState({displayImageReady: true})
                                    }
                                    resizeMode={FastImage.resizeMode.contain}
                                  />

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
                          </View>
                        </CardItem>

                        <Divider />

                        <CardItem>
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
                                  <FastImage
                                    source={
                                      storeDetailsEditMode && values.coverImage
                                        ? {uri: values.coverImage}
                                        : coverImageUrl
                                    }
                                    style={{
                                      aspectRatio: 1620 / 1080,
                                      flex: 1,
                                    }}
                                    onLoadStart={() =>
                                      this.setState({coverImageReady: false})
                                    }
                                    onLoad={() =>
                                      this.setState({coverImageReady: true})
                                    }
                                    resizeMode={FastImage.resizeMode.contain}
                                  />

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
                          </View>
                        </CardItem>

                        <Divider />

                        <CardItem>
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

                        <Divider />

                        <CardItem>
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

                        <Divider />

                        <CardItem>
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

                        <Divider />

                        <CardItem>
                          <View style={{width: '100%'}}>
                            <Text
                              style={{
                                flex: 1,
                                flexDirection: 'row',
                                fontSize: 16,
                                fontFamily: 'ProductSans-Bold',
                              }}>
                              Store Operating Days
                            </Text>

                            <Card
                              style={{
                                borderRadius: 10,
                                marginTop: 10,
                              }}>
                              {daysList.map((day, index) => {
                                const openingHours = moment(
                                  storeDetailsEditMode
                                    ? `${values.storeHours?.[day]?.start}`
                                    : `${storeHours?.[day]?.start}`,
                                  'hh:mm',
                                ).format('h:mm a');
                                const closingHours = moment(
                                  storeDetailsEditMode
                                    ? `${values.storeHours?.[day]?.end}`
                                    : `${storeHours?.[day]?.end}`,
                                  'hh:mm',
                                ).format('h:mm a');

                                return (
                                  <View key={`${day}${index}`}>
                                    <CardItem
                                      style={{
                                        borderRadius: 10,
                                        overflow: 'hidden',
                                      }}>
                                      <View
                                        style={{
                                          flex: 1,
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                        }}>
                                        <CheckBox
                                          title={day}
                                          checked={
                                            storeDetailsEditMode
                                              ? values?.storeHours?.[day]
                                                  ?.closed === false
                                              : storeHours?.[day]?.closed ===
                                                false
                                          }
                                          disabled={!storeDetailsEditMode}
                                          onPress={() =>
                                            setFieldValue(
                                              `storeHours[${day}].closed`,
                                              values?.storeHours?.[day]
                                                ?.closed !== undefined
                                                ? !values?.storeHours?.[day]
                                                    ?.closed
                                                : false,
                                            )
                                          }
                                          containerStyle={{
                                            elevation: 0,
                                            marginTop: 0,
                                            marginBottom: 0,
                                            flex: 1,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingLeft: 0,
                                          }}
                                        />

                                        <View
                                          style={{
                                            flex: 1,
                                            alignItems: 'flex-end',
                                            backgroundColor: colors.icons,
                                          }}>
                                          <Pressable
                                            style={({pressed}) => [
                                              {
                                                backgroundColor:
                                                  pressed &&
                                                  storeDetailsEditMode
                                                    ? colors.primary_lightOpacity
                                                    : colors.icons,
                                              },
                                              {
                                                padding: 3,
                                              },
                                            ]}
                                            onPress={() =>
                                              storeDetailsEditMode &&
                                              this.setState({
                                                selectedDay: day,
                                                selectedDayPoint: 'start',
                                                selectedDayTime: new Date().setTime(
                                                  moment(
                                                    openingHours,
                                                    'h:mm a',
                                                  ).format('x'),
                                                ),
                                              })
                                            }>
                                            <Text
                                              style={{
                                                color: storeDetailsEditMode
                                                  ? colors.accent
                                                  : colors.primary,
                                                fontSize: 16,
                                                fontFamily: 'ProductSans-Bold',
                                                textAlign: 'right',
                                              }}>
                                              {`Opening: ${
                                                storeHours?.[day]?.start !==
                                                undefined
                                                  ? openingHours
                                                  : 'Not Set'
                                              }`}
                                            </Text>
                                          </Pressable>

                                          <Pressable
                                            style={({pressed}) => [
                                              {
                                                backgroundColor:
                                                  pressed &&
                                                  storeDetailsEditMode
                                                    ? colors.primary_lightOpacity
                                                    : colors.icons,
                                              },
                                              {
                                                padding: 3,
                                              },
                                            ]}
                                            onPress={() =>
                                              storeDetailsEditMode &&
                                              this.setState({
                                                selectedDay: day,
                                                selectedDayPoint: 'end',
                                                selectedDayTime: new Date().setTime(
                                                  moment(
                                                    closingHours,
                                                    'h:mm a',
                                                  ).format('x'),
                                                ),
                                              })
                                            }>
                                            <Text
                                              style={{
                                                color: storeDetailsEditMode
                                                  ? colors.accent
                                                  : colors.primary,
                                                fontSize: 16,
                                                fontFamily: 'ProductSans-Bold',
                                                textAlign: 'right',
                                              }}>
                                              {`Closing: ${
                                                storeHours?.[day]?.end !==
                                                undefined
                                                  ? closingHours
                                                  : 'Not Set'
                                              }`}
                                            </Text>
                                          </Pressable>

                                          {storeDetailsEditMode &&
                                            errors?.test_storeHours?.[day] !==
                                              undefined && (
                                              <Text
                                                style={{
                                                  color: colors.danger,
                                                  fontSize: 12,
                                                  textAlign: 'right',
                                                }}>
                                                {errors?.test_storeHours?.[day]}
                                              </Text>
                                            )}
                                        </View>
                                      </View>
                                    </CardItem>

                                    <Divider style={{marginTop: 1}} />
                                  </View>
                                );
                              })}
                            </Card>
                          </View>
                        </CardItem>

                        <Divider />

                        <CardItem>
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
                                        key={`${paymentMethod}${index}`}
                                        title={paymentMethod}
                                        checked={
                                          values.availablePaymentMethods[
                                            paymentMethod
                                          ].activated
                                        }
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

                                  {storeDetailsEditMode &&
                                    errors?.testAvailablePaymentMethods && (
                                      <Text
                                        style={{
                                          color: colors.danger,
                                          fontSize: 12,
                                        }}>
                                        {errors?.testAvailablePaymentMethods}
                                      </Text>
                                    )}
                                </View>
                              ) : (
                                this.CategoryPills(this.selectedPaymentMethods)
                              )}
                            </View>
                          </View>
                        </CardItem>

                        <Divider />

                        <CardItem>
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

                        <Divider />

                        <CardItem>
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
                  errors,
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

                          {selectableDeliveryMethods.map(
                            (deliveryMethod, index) => (
                              <View key={`${deliveryMethod}${index}`}>
                                <CardItem>
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
                                        {deliveryMethod}
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
                                            `availableDeliveryMethods["${deliveryMethod}"].activated`,
                                            !values.availableDeliveryMethods[
                                              deliveryMethod
                                            ].activated,
                                          )
                                        }
                                        value={
                                          deliveryDetailsEditMode
                                            ? values.availableDeliveryMethods[
                                                deliveryMethod
                                              ].activated
                                            : availableDeliveryMethods[
                                                deliveryMethod
                                              ].activated
                                        }
                                        disabled={!deliveryDetailsEditMode}
                                      />
                                    </View>

                                    {errors?.testAvailableDeliveryMethods && (
                                      <Text
                                        style={{
                                          color: colors.danger,
                                          fontSize: 12,
                                        }}>
                                        {errors?.testAvailableDeliveryMethods}
                                      </Text>
                                    )}

                                    {deliveryMethod === 'Own Delivery' && (
                                      <Card
                                        style={{
                                          borderRadius: 10,
                                          marginTop: 10,
                                        }}>
                                        <CardItem
                                          style={{
                                            borderRadius: 10,
                                            overflow: 'hidden',
                                          }}>
                                          <View
                                            style={{
                                              flex: 1,
                                              flexDirection: 'row',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                            }}>
                                            <View
                                              style={{
                                                flex: 1,
                                                paddingright: 10,
                                              }}>
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
                                                    fontFamily:
                                                      'ProductSans-Bold',
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
                                    )}
                                  </View>
                                </CardItem>

                                <Divider />
                              </View>
                            ),
                          )}

                          {deliveryDiscount && (
                            <CardItem>
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
                                    marginTop: 10,
                                  }}>
                                  <CardItem
                                    style={{
                                      borderRadius: 10,
                                      overflow: 'hidden',
                                    }}>
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

                                  <Divider />

                                  <CardItem
                                    style={{
                                      borderRadius: 10,
                                      overflow: 'hidden',
                                    }}>
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

                          <Divider />

                          <CardItem>
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
            </SafeAreaView>
          </ScrollView>
        )}
      </View>
    );
  }
}

export default DashboardScreen;
