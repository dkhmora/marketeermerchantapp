import React, {Component} from 'react';
import {ActivityIndicator, View, SafeAreaView, Platform} from 'react-native';
import {Card, CardItem} from 'native-base';
// Custom Components
import BaseHeader from '../components/BaseHeader';
// Mobx
import {inject, observer} from 'mobx-react';
import {observable, action, computed} from 'mobx';
import {Text, Input, Icon, Button, CheckBox} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import BaseOptionsMenu from '../components/BaseOptionsMenu';
import {colors} from '../../assets/colors';
import {Switch} from 'react-native-gesture-handler';
import StoreCard from '../components/StoreCard';
import FastImage from 'react-native-fast-image';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from '../components/Toast';
import crashlytics from '@react-native-firebase/crashlytics';
import CardItemHeader from '../components/CardItemHeader';

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
      loading: false,
      CODCheckbox: false,
      onlineBankingCheckbox: false,
      grabExpressCheckbox: false,
      lalamoveCheckbox: false,
      mrSpeedyCheckbox: false,
      ownServiceCheckbox: false,
      sameDayDeliveryCheckbox: false,
      newOwnDeliveryServiceFeeError: null,
      newFreeDeliveryMinimumError: null,
      displayImageUrl: null,
      coverImageUrl: null,
      oldDisplayImageUrl: null,
      oldCoverImageUrl: null,
    };
  }

  @observable editMode = false;
  @observable newStoreDescription = '';
  @observable newFreeDelivery = null;
  @observable newVacationMode = null;
  @observable newAvailablePaymentMethods = {};
  @observable newAvailableDeliveryMethods = {};
  @observable newDeliveryType = '';
  @observable newOwnDeliveryServiceFee = '0';
  @observable newFreeDeliveryMinimum = '0';
  @observable editModeHeaderColor = colors.primary;

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
      prevProps.detailsStore.storeDetails !==
        this.props.detailsStore.storeDetails ||
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

  @computed get selectedDeliveryMethods() {
    const {availableDeliveryMethods} = this.props.detailsStore.storeDetails;

    if (availableDeliveryMethods) {
      return Object.entries(availableDeliveryMethods)
        .filter(([key, value]) => value.activated)
        .map(([key, value]) => key);
    }

    return [];
  }

  @action cancelEditing() {
    this.newFreeDelivery = null;
    this.newStoreDescription = '';
    this.newVacationMode = this.props.detailsStore.storeDetails.vacation;
    this.newAvailablePaymentMethods = {};
    this.newAvailableDeliveryMethods = {};
    this.newOwnDeliveryServiceFee = '0';
    this.newFreeDeliveryMinimum = '0';
    this.editModeHeaderColor = colors.primary;

    this.setState({
      displayImageUrl: this.state.oldDisplayImageUrl,
      coverImageUrl: this.state.oldCoverImageUrl,
    });

    this.editMode = !this.editMode;
  }

  @action toggleEditing() {
    const {
      freeDelivery,
      storeDescription,
      vacationMode,
      deliveryType,
      ownDeliveryServiceFee,
      freeDeliveryMinimum,
      availableDeliveryMethods,
      availablePaymentMethods,
    } = this.props.detailsStore.storeDetails;

    const {selectedDeliveryMethods, selectedPaymentMethods} = this;

    if (this.editMode) {
      this.cancelEditing();
    } else {
      this.editModeHeaderColor = colors.accent;
      this.newFreeDelivery = freeDelivery;
      this.newStoreDescription = storeDescription;
      this.newVacationMode = vacationMode;
      this.newDeliveryType = deliveryType;
      this.newAvailablePaymentMethods = {...availablePaymentMethods};
      this.newAvailableDeliveryMethods = {...availableDeliveryMethods};
      this.newOwnDeliveryServiceFee = ownDeliveryServiceFee
        ? String(ownDeliveryServiceFee)
        : '0';
      this.newFreeDeliveryMinimum = freeDeliveryMinimum
        ? String(freeDeliveryMinimum)
        : '0';

      this.setState({
        oldDisplayImageUrl: this.state.displayImageUrl,
        oldCoverImageUrl: this.state.coverImageUrl,
      });
      this.editMode = !this.editMode;
    }

    this.setState({loading: false});
  }

  getImage = async () => {
    if (this.props.detailsStore.storeDetails.displayImage) {
      const displayRef = storage().ref(
        this.props.detailsStore.storeDetails.displayImage,
      );
      const displayLink = await displayRef.getDownloadURL().catch((err) => {
        Toast({text: err.message, type: 'danger'});
        return null;
      });

      if (displayLink) {
        this.setState({displayImageUrl: {uri: displayLink}});
      }
    }

    if (this.props.detailsStore.storeDetails.coverImage) {
      const coverRef = storage().ref(
        this.props.detailsStore.storeDetails.coverImage,
      );
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

    ImagePicker.openCamera({
      width,
      height,
      cropping: true,
      mediaType: 'photo',
      forceJpg: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        if (type === 'display') {
          this.setState({displayImageUrl: {uri: image.path}});
        } else {
          this.setState({coverImageUrl: {uri: image.path}});
        }
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  handleSelectImage(type) {
    const height = type === 'display' ? 600 : 720;
    const width = type === 'display' ? 600 : 1080;

    ImagePicker.openPicker({
      width,
      height,
      cropping: true,
      mediaType: 'photo',
      forceJpg: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        if (type === 'display') {
          this.setState({displayImageUrl: {uri: image.path}});
        } else {
          this.setState({coverImageUrl: {uri: image.path}});
        }
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  handlePaymentMethods(paymentMethod) {
    const {newAvailablePaymentMethods} = this;

    if (newAvailablePaymentMethods.includes(paymentMethod)) {
      this.newAvailablePaymentMethods = newAvailablePaymentMethods.filter(
        (item) => item !== paymentMethod,
      );
    } else {
      newAvailablePaymentMethods.push(paymentMethod);
    }
  }

  handledeliveryMethods(deliveryMethod) {
    const {newAvailableDeliveryMethods} = this;

    if (newAvailableDeliveryMethods.includes(deliveryMethod)) {
      this.newAvailableDeliveryMethods = newAvailableDeliveryMethods.filter(
        (item) => item !== deliveryMethod,
      );
    } else {
      newAvailableDeliveryMethods.push(deliveryMethod);
    }
  }

  handleOwnDeliveryServiceFee(ownDeliveryServiceFee) {
    const numberRegexp = /^[0-9]+$/;

    this.newOwnDeliveryServiceFee = ownDeliveryServiceFee;

    if (ownDeliveryServiceFee === '') {
      this.setState({
        newOwnDeliveryServiceFeeError: 'Price must not be empty',
      });
    } else if (!numberRegexp.test(Number(ownDeliveryServiceFee))) {
      this.setState({
        newOwnDeliveryServiceFeeError: 'Price can only consist of numbers',
      });
    } else {
      this.setState({newOwnDeliveryServiceFeeError: null});
    }
  }

  handleFreeDeliveryMinimum(freeDeliveryMinimum) {
    const numberRegexp = /^[0-9]+$/;

    this.newFreeDeliveryMinimum = freeDeliveryMinimum;

    if (!numberRegexp.test(Number(freeDeliveryMinimum))) {
      this.setState({
        newFreeDeliveryMinimumError: 'Price can only consist of numbers',
      });
    } else {
      this.setState({newFreeDeliveryMinimumError: null});
    }
  }

  handleConfirmDetails() {
    this.setState({loading: true}, async () => {
      const {
        displayImageUrl,
        coverImageUrl,
        oldDisplayImageUrl,
        oldCoverImageUrl,
      } = this.state;
      const {
        freeDelivery,
        storeDescription,
        vacationMode,
        deliveryType,
        ownDeliveryServiceFee,
        freeDeliveryMinimum,
        availableDeliveryMethods,
        availablePaymentMethods,
      } = this.props.detailsStore.storeDetails;

      if (coverImageUrl !== oldCoverImageUrl) {
        await this.props.detailsStore
          .uploadImage(coverImageUrl.uri, 'cover')
          .then(() => {
            this.setState({oldCoverImageUrl: coverImageUrl});
          });
      }

      if (displayImageUrl !== oldDisplayImageUrl) {
        await this.props.detailsStore
          .uploadImage(displayImageUrl.uri, 'display')
          .then(() => {
            this.setState({oldDisplayImageUrl: displayImageUrl});
          });
      }

      if (
        freeDelivery !== this.newFreeDelivery ||
        storeDescription !== this.newStoreDescription ||
        vacationMode !== this.newVacationMode ||
        availablePaymentMethods !== this.newAvailablePaymentMethods ||
        availableDeliveryMethods !== this.newAvailableDeliveryMethods ||
        deliveryType !== this.newDeliveryType ||
        ownDeliveryServiceFee !== this.newOwnDeliveryServiceFee ||
        freeDeliveryMinimum !== this.newFreeDeliveryMinimum
      ) {
        await this.props.detailsStore
          .updateStoreDetails(
            this.newStoreDescription,
            this.newFreeDelivery,
            this.newVacationMode,
            this.newAvailablePaymentMethods,
            this.newAvailableDeliveryMethods,
            this.newDeliveryType,
            Number(this.newOwnDeliveryServiceFee),
            Number(this.newFreeDeliveryMinimum),
          )
          .then(() => {
            Toast({
              text: 'Store details successfully updated!',
              type: 'success',
              duration: 3000,
            });
          });
      } else {
        Toast({
          text: 'Store details successfully updated!',
          type: 'success',
          duration: 3000,
        });
      }
      this.toggleEditing();
    });
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
      freeDelivery,
      storeDescription,
      storeName,
      vacationMode,
      deliveryType,
      orderNumber,
      storeCategory,
      ownDeliveryServiceFee,
      freeDeliveryMinimum,
      availableDeliveryMethods,
      availablePaymentMethods,
    } = this.props.detailsStore.storeDetails;

    const selectableDeliveryMethods = availableDeliveryMethods
      ? Object.keys(availableDeliveryMethods)
      : [];
    const selectablePaymentMethods = availablePaymentMethods
      ? Object.keys(availablePaymentMethods)
      : [];

    const {
      coverImageUrl,
      displayImageUrl,
      loading,
      newOwnDeliveryServiceFeeError,
      newFreeDeliveryMinimumError,
    } = this.state;

    const {navigation} = this.props;

    const {
      editMode,
      newAvailablePaymentMethods,
      newAvailableDeliveryMethods,
    } = this;

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title={this.props.route.name}
          navigation={navigation}
          rightComponent={
            editMode ? (
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
                  loading={loading}
                  loadingProps={{color: colors.icons}}
                  onPress={() => this.handleConfirmDetails()}
                />

                <Button
                  type="clear"
                  color={colors.icons}
                  icon={<Icon name="x" color={colors.icons} />}
                  onPress={() => this.cancelEditing()}
                  titleStyle={{color: colors.icons}}
                  containerStyle={{
                    borderRadius: 24,
                  }}
                />
              </View>
            ) : (
              <BaseOptionsMenu
                iconStyle={{
                  color: colors.icons,
                  fontSize: 25,
                  marginRight: Platform.OS === 'android' ? 10 : 0,
                }}
                options={['Edit Details']}
                actions={[this.toggleEditing.bind(this)]}
              />
            )
          }
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
                  <CardItemHeader title="Store Details" />

                  <CardItem bordered>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 8,
                      }}>
                      <View style={{paddingRight: 10}}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Bold',
                          }}>
                          Display Image
                        </Text>

                        {editMode && (
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Button
                              type="clear"
                              titleStyle={{color: colors.accent}}
                              color={colors.icons}
                              onPress={() => this.handleTakePhoto('display')}
                              icon={
                                <Icon name="camera" color={colors.accent} />
                              }
                              containerStyle={{borderRadius: 24}}
                            />

                            <Button
                              type="clear"
                              titleStyle={{color: colors.accent}}
                              color={colors.icons}
                              onPress={() => this.handleSelectImage('display')}
                              icon={<Icon name="image" color={colors.accent} />}
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
                        <FastImage
                          source={displayImageUrl}
                          style={{
                            width: '70%',
                            aspectRatio: 1,
                            backgroundColor: '#e1e4e8',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: editMode
                              ? this.editModeHeaderColor
                              : colors.primary,
                          }}
                        />
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
                      <View style={{paddingRight: 10}}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Bold',
                          }}>
                          Cover Image
                        </Text>

                        {editMode && (
                          <View style={{flexDirection: 'row'}}>
                            <Button
                              type="clear"
                              color={colors.icons}
                              titleStyle={{color: colors.accent}}
                              icon={
                                <Icon name="camera" color={colors.accent} />
                              }
                              onPress={() => this.handleTakePhoto('cover')}
                              containerStyle={{borderRadius: 24}}
                            />
                            <Button
                              type="clear"
                              color={colors.icons}
                              titleStyle={{color: colors.accent}}
                              icon={<Icon name="image" color={colors.accent} />}
                              onPress={() => this.handleSelectImage('cover')}
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
                        <FastImage
                          source={coverImageUrl}
                          style={{
                            width: '100%',
                            aspectRatio: 1620 / 1080,
                            backgroundColor: '#e1e4e8',
                            alignSelf: 'center',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: editMode
                              ? this.editModeHeaderColor
                              : colors.primary,
                            resizeMode: 'cover',
                          }}
                        />
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
                          Store Name
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
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
                        paddingHorizontal: 8,
                      }}>
                      <View style={{flex: 2, paddingright: 10}}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Bold',
                          }}>
                          Store Description
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
                        {editMode ? (
                          <Input
                            multiline
                            maxLength={200}
                            value={this.newStoreDescription}
                            onChangeText={(value) =>
                              (this.newStoreDescription = value)
                            }
                            inputStyle={{textAlign: 'right'}}
                            containerStyle={{
                              borderColor: this.editModeHeaderColor,
                            }}
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
                        paddingHorizontal: 8,
                      }}>
                      <View style={{flex: 2, paddingright: 10}}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Bold',
                          }}>
                          Store Category
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
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
                        paddingHorizontal: 8,
                      }}>
                      <View style={{flex: 2, paddingright: 10}}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Bold',
                          }}>
                          Payment Methods
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
                        {editMode ? (
                          <View>
                            {Object.keys(newAvailablePaymentMethods).length >
                              0 &&
                              selectablePaymentMethods.map((paymentMethod) => (
                                <CheckBox
                                  title={paymentMethod}
                                  checked={
                                    newAvailablePaymentMethods[paymentMethod]
                                      .activated
                                  }
                                  key={paymentMethod}
                                  onPress={() =>
                                    (newAvailablePaymentMethods[
                                      paymentMethod
                                    ].activated = !newAvailablePaymentMethods[
                                      paymentMethod
                                    ].activated)
                                  }
                                />
                              ))}
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
                        paddingHorizontal: 8,
                      }}>
                      <View style={{flex: 2, paddingright: 10}}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Bold',
                          }}>
                          Number of Orders
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
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
                        paddingHorizontal: 8,
                      }}>
                      <View style={{flex: 2, paddingright: 10}}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Bold',
                          }}>
                          Vacation Mode
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
                        <Switch
                          trackColor={{
                            false: '#767577',
                            true: editMode ? colors.accent : colors.primary,
                          }}
                          thumbColor={'#f4f3f4'}
                          ios_backgroundColor="#3e3e3e"
                          onValueChange={() =>
                            (this.newVacationMode = !this.newVacationMode)
                          }
                          value={editMode ? this.newVacationMode : vacationMode}
                          disabled={!editMode}
                        />
                      </View>
                    </View>
                  </CardItem>
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
                    overflow: 'hidden',
                  }}>
                  <CardItemHeader title="Delivery Settings" />

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
                          Delivery Methods
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
                        {editMode ? (
                          <View>
                            {Object.keys(newAvailableDeliveryMethods).length >
                              0 &&
                              selectableDeliveryMethods.map(
                                (deliveryMethod, index) => (
                                  <CheckBox
                                    title={deliveryMethod}
                                    checked={
                                      newAvailableDeliveryMethods[
                                        deliveryMethod
                                      ].activated
                                    }
                                    key={deliveryMethod}
                                    onPress={() =>
                                      (newAvailableDeliveryMethods[
                                        deliveryMethod
                                      ].activated = !newAvailableDeliveryMethods[
                                        deliveryMethod
                                      ].activated)
                                    }
                                  />
                                ),
                              )}
                          </View>
                        ) : (
                          this.CategoryPills(this.selectedDeliveryMethods)
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
                          Own Delivery Service Fee
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
                        {editMode ? (
                          <Input
                            value={this.newOwnDeliveryServiceFee}
                            leftIcon={<Text style={{fontSize: 18}}>₱</Text>}
                            keyboardType="number-pad"
                            errorMessage={
                              newOwnDeliveryServiceFeeError &&
                              newOwnDeliveryServiceFeeError
                            }
                            onChangeText={(value) =>
                              this.handleOwnDeliveryServiceFee(value)
                            }
                            inputStyle={{textAlign: 'right'}}
                            containerStyle={{
                              borderColor: this.editModeHeaderColor,
                            }}
                          />
                        ) : (
                          <Text
                            style={{
                              color: colors.primary,
                              fontSize: 16,
                              fontFamily: 'ProductSans-Bold',
                              textAlign: 'right',
                            }}>
                            ₱{ownDeliveryServiceFee}
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
                          Delivery Type
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
                        {editMode ? (
                          <View>
                            <CheckBox
                              title="Same Day Delivery"
                              checked={
                                this.newDeliveryType === 'Same Day Delivery'
                              }
                              checkedIcon="dot-circle-o"
                              uncheckedIcon="circle-o"
                              onPress={() =>
                                (this.newDeliveryType = 'Same Day Delivery')
                              }
                            />
                            <CheckBox
                              title="Next Day Delivery"
                              checked={
                                this.newDeliveryType === 'Next Day Delivery'
                              }
                              checkedIcon="dot-circle-o"
                              uncheckedIcon="circle-o"
                              onPress={() =>
                                (this.newDeliveryType = 'Next Day Delivery')
                              }
                            />
                            <CheckBox
                              title="Scheduled Delivery"
                              checked={
                                this.newDeliveryType === 'Scheduled Delivery'
                              }
                              checkedIcon="dot-circle-o"
                              uncheckedIcon="circle-o"
                              onPress={() =>
                                (this.newDeliveryType = 'Scheduled Delivery')
                              }
                            />
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
                          Free Delivery
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
                        <Switch
                          trackColor={{
                            false: '#767577',
                            true: editMode ? colors.accent : colors.primary,
                          }}
                          thumbColor={'#f4f3f4'}
                          ios_backgroundColor="#3e3e3e"
                          onValueChange={() =>
                            (this.newFreeDelivery = !this.newFreeDelivery)
                          }
                          value={editMode ? this.newFreeDelivery : freeDelivery}
                          disabled={!editMode}
                        />
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
                          Free Delivery Minimum Order Amount
                        </Text>
                      </View>

                      <View style={{flex: 3, alignItems: 'flex-end'}}>
                        {editMode ? (
                          <Input
                            value={this.newFreeDeliveryMinimum}
                            leftIcon={<Text style={{fontSize: 18}}>₱</Text>}
                            keyboardType="number-pad"
                            errorMessage={
                              newFreeDeliveryMinimumError &&
                              newFreeDeliveryMinimumError
                            }
                            onChangeText={(value) =>
                              this.handleFreeDeliveryMinimum(value)
                            }
                            inputStyle={{textAlign: 'right'}}
                            containerStyle={{
                              borderColor: this.editModeHeaderColor,
                            }}
                          />
                        ) : (
                          <Text
                            style={{
                              color: colors.primary,
                              fontSize: 16,
                              fontFamily: 'ProductSans-Bold',
                              textAlign: 'right',
                            }}>
                            ₱{freeDeliveryMinimum ? freeDeliveryMinimum : 0}
                          </Text>
                        )}
                      </View>
                    </View>
                  </CardItem>
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
