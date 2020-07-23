import React, {Component, setState} from 'react';
import {
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  View,
} from 'react-native';
import {Card, Body, CardItem, Left, Toast} from 'native-base';
// Custom Components
import BaseHeader from '../components/BaseHeader';
// Mobx
import {inject, observer} from 'mobx-react';
import {observable, action} from 'mobx';
import {Text, Input, Icon, Button, CheckBox} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import BaseOptionsMenu from '../components/BaseOptionsMenu';
import {colors} from '../../assets/colors';
import {Switch} from 'react-native-gesture-handler';
import StoreCard from '../components/StoreCard';
import FastImage from 'react-native-fast-image';

@inject('detailsStore')
@inject('itemsStore')
@observer
class StoreDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.props.detailsStore.setStoreDetails(
      this.props.detailsStore.storeDetails.merchantId,
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
      displayImageUrl: null,
      coverImageUrl: null,
      oldDisplayImageUrl: null,
      oldCoverImageUrl: null,
    };
  }

  @observable editMode = false;
  @observable newStoreName = '';
  @observable newStoreDescription = '';
  @observable newFreeDelivery = '';
  @observable newVacationMode = null;
  @observable newPaymentMethods = [];
  @observable newShippingMethods = [];
  @observable newDeliveryType = '';
  @observable newOwnDeliveryServiceFee = 0;
  @observable storeDetailsHeaderColor = colors.primary;

  componentDidMount() {
    const {displayImageUrl, coverImageUrl} = this.state;

    if (!displayImageUrl || !coverImageUrl) {
      this.getImage();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {merchantId} = this.props.detailsStore.storeDetails;

    if (
      prevProps.detailsStore.storeDetails !==
      this.props.detailsStore.storeDetails
    ) {
      console.log('yes');
      this.getImage();
    }

    !this.props.itemsStore.unsubscribeSetStoreItems &&
      this.props.itemsStore.setStoreItems(merchantId);
  }

  @action cancelEditing() {
    this.newFreeDelivery = '';
    this.newStoreDescription = '';
    this.newStoreName = '';
    this.newVacationMode = this.props.detailsStore.storeDetails.vacation;
    this.newPaymentMethods = [];
    this.newShippingMethods = [];
    this.newOwnDeliveryServiceFee = '0';
    this.storeDetailsHeaderColor = colors.primary;

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
      storeName,
      vacationMode,
      deliveryType,
      paymentMethods,
      shippingMethods,
      deliveryServiceFee,
    } = this.props.detailsStore.storeDetails;

    if (this.editMode) {
      this.cancelEditing();
    } else {
      this.storeDetailsHeaderColor = colors.accent;
      this.newFreeDelivery = freeDelivery;
      this.newStoreDescription = storeDescription;
      this.newStoreName = storeName;
      this.newVacationMode = vacationMode;
      this.newDeliveryType = deliveryType;
      this.newPaymentMethods = [...paymentMethods];
      this.newShippingMethods = [...shippingMethods];
      this.newOwnDeliveryServiceFee = deliveryServiceFee
        ? deliveryServiceFee
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
      const displayLink = await displayRef.getDownloadURL();

      this.setState({displayImageUrl: {uri: displayLink}});
    }

    if (this.props.detailsStore.storeDetails.coverImage) {
      const coverRef = storage().ref(
        this.props.detailsStore.storeDetails.coverImage,
      );
      const coverLink = await coverRef.getDownloadURL();

      this.setState({coverImageUrl: {uri: coverLink}});
    }
  };

  handleTakePhoto(type) {
    const width = type === 'display' ? 1080 : 1620;

    ImagePicker.openCamera({
      width,
      height: 1080,
      cropping: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        if (type === 'display') {
          this.setState({displayImageUrl: {uri: image.path}});
        } else {
          this.setState({coverImageUrl: {uri: image.path}});
        }
      })
      .then(() => console.log('Image path successfully set!'))
      .catch((err) => console.log(err));
  }

  handleSelectImage(type) {
    const width = type === 'display' ? 1080 : 1620;

    ImagePicker.openPicker({
      width,
      height: 1080,
      cropping: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        if (type === 'display') {
          this.setState({displayImageUrl: {uri: image.path}});
        } else {
          this.setState({coverImageUrl: {uri: image.path}});
        }
      })
      .then(() => console.log('Image path successfully set!'))
      .catch((err) => console.log(err));
  }

  handlePaymentMethods(paymentMethod) {
    const {newPaymentMethods} = this;

    if (newPaymentMethods.includes(paymentMethod)) {
      this.newPaymentMethods = newPaymentMethods.filter(
        (item) => item !== paymentMethod,
      );
    } else {
      newPaymentMethods.push(paymentMethod);
    }
  }

  handleShippingMethods(shippingMethod) {
    const {newShippingMethods} = this;

    if (newShippingMethods.includes(shippingMethod)) {
      this.newShippingMethods = newShippingMethods.filter(
        (item) => item !== shippingMethod,
      );
    } else {
      newShippingMethods.push(shippingMethod);
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

  async handleConfirmDetails() {
    const {
      displayImageUrl,
      coverImageUrl,
      oldDisplayImageUrl,
      oldCoverImageUrl,
    } = this.state;
    const {
      freeDelivery,
      storeDescription,
      storeName,
      vacationMode,
      paymentMethods,
      shippingMethods,
      deliveryType,
      ownDeliveryServiceFee,
    } = this.props.detailsStore.storeDetails;

    this.setState({loading: true});

    if (coverImageUrl !== oldCoverImageUrl) {
      await this.props.detailsStore
        .uploadImage(coverImageUrl.uri, 'cover', oldCoverImageUrl)
        .then(() => {
          this.setState({oldCoverImageUrl: coverImageUrl});
        });
    }

    if (displayImageUrl !== oldDisplayImageUrl) {
      await this.props.detailsStore
        .uploadImage(displayImageUrl.uri, 'display', oldDisplayImageUrl)
        .then(() => {
          this.setState({oldDisplayImageUrl: displayImageUrl});
        });
    }

    const validStoreName = this.newStoreName.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      '',
    );

    if (
      freeDelivery !== this.newFreeDelivery ||
      storeDescription !== this.newStoreDescription ||
      storeName !== validStoreName ||
      vacationMode !== this.newVacationMode ||
      paymentMethods !== this.newPaymentMethods ||
      shippingMethods !== this.newShippingMethods ||
      deliveryType !== this.newDeliveryType ||
      ownDeliveryServiceFee !== this.newOwnDeliveryServiceFee
    ) {
      await this.props.detailsStore
        .updateStoreDetails(
          validStoreName,
          this.newStoreDescription,
          this.newFreeDelivery,
          this.newVacationMode,
          this.newPaymentMethods,
          this.newShippingMethods,
          this.newDeliveryType,
          Number(this.newOwnDeliveryServiceFee),
        )
        .then(() => {
          Toast.show({
            text: 'Store details successfully updated!',
            type: 'success',
            style: {margin: 20, borderRadius: 16},
            duration: 3000,
          });
        });
    } else {
      Toast.show({
        text: 'Store details successfully updated!',
        type: 'success',
        style: {margin: 20, borderRadius: 16},
        duration: 3000,
      });
    }
    this.toggleEditing();
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
      paymentMethods,
      shippingMethods,
      deliveryType,
      creditData,
      orderNumber,
      storeCategory,
      ownDeliveryServiceFee,
    } = this.props.detailsStore.storeDetails;

    const {
      coverImageUrl,
      displayImageUrl,
      loading,
      newOwnDeliveryServiceFeeError,
    } = this.state;

    const {editMode, newPaymentMethods, newShippingMethods} = this;

    if (Object.keys(this.props.detailsStore.storeDetails).length > 0) {
      return (
        <View style={{flex: 1}}>
          <BaseHeader
            title={this.props.route.name}
            navigation={this.props.navigation}
            rightComponent={
              editMode && (
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: -10,
                  }}>
                  <Button
                    type="clear"
                    title="Confirm"
                    titleStyle={{color: colors.icons}}
                    loading={loading}
                    loadingProps={{color: colors.icons}}
                    onPress={() => this.handleConfirmDetails()}
                  />
                </View>
              )
            }
          />

          <ScrollView style={{paddingHorizontal: 10}}>
            <Card style={{borderRadius: 10, overflow: 'hidden'}}>
              <CardItem
                header
                bordered
                style={{backgroundColor: colors.primary}}>
                <Left>
                  <Body>
                    <Text style={{color: colors.icons, fontSize: 20}}>
                      Store Card Preview
                    </Text>
                  </Body>
                </Left>
              </CardItem>
              <CardItem bordered style={{flex: 1}}>
                <StoreCard store={this.props.detailsStore.storeDetails} />
              </CardItem>
            </Card>

            <Card
              style={{
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              <CardItem
                header
                bordered
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: this.storeDetailsHeaderColor,
                  paddingLeft: 25,
                  paddingBottom: 0,
                  paddingTop: 0,
                }}>
                <Text
                  style={{
                    color: colors.icons,
                    fontSize: 20,
                    paddingVertical: 16,
                  }}>
                  Store Details
                </Text>

                <View>
                  {this.editMode ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                      }}>
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
                      iconStyle={{color: colors.icons, fontSize: 25}}
                      options={['Toggle Editing']}
                      actions={[this.toggleEditing.bind(this)]}
                    />
                  )}
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
                      Display Image
                    </Text>

                    {this.editMode && (
                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <Button
                          type="clear"
                          titleStyle={{color: colors.accent}}
                          color={colors.icons}
                          onPress={() => this.handleTakePhoto('display')}
                          icon={<Icon name="camera" color={colors.accent} />}
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
                        borderColor: this.editMode
                          ? this.storeDetailsHeaderColor
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

                    {this.editMode && (
                      <View style={{flexDirection: 'row'}}>
                        <Button
                          type="clear"
                          color={colors.icons}
                          titleStyle={{color: colors.accent}}
                          icon={<Icon name="camera" color={colors.accent} />}
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
                        borderColor: this.editMode
                          ? this.storeDetailsHeaderColor
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
                      Display Name
                    </Text>
                  </View>

                  <View style={{flex: 3, alignItems: 'flex-end'}}>
                    {this.editMode ? (
                      <Input
                        maxLength={50}
                        value={this.newStoreName}
                        onChangeText={(value) => (this.newStoreName = value)}
                        inputStyle={{
                          textAlign: 'right',
                        }}
                        containerStyle={{
                          borderColor: this.storeDetailsHeaderColor,
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
                        {storeName}
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
                      Description
                    </Text>
                  </View>

                  <View style={{flex: 3, alignItems: 'flex-end'}}>
                    {this.editMode ? (
                      <Input
                        multiline
                        maxLength={200}
                        value={this.newStoreDescription}
                        onChangeText={(value) =>
                          (this.newStoreDescription = value)
                        }
                        inputStyle={{textAlign: 'right'}}
                        containerStyle={{
                          borderColor: this.storeDetailsHeaderColor,
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
                      Free Delivery
                    </Text>
                  </View>

                  <View style={{flex: 3, alignItems: 'flex-end'}}>
                    <Switch
                      trackColor={{
                        false: '#767577',
                        true: this.editMode ? colors.accent : colors.primary,
                      }}
                      thumbColor={'#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() =>
                        (this.newFreeDelivery = !this.newFreeDelivery)
                      }
                      value={
                        this.editMode ? this.newFreeDelivery : freeDelivery
                      }
                      disabled={!this.editMode}
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
                      Delivery Type
                    </Text>
                  </View>

                  <View style={{flex: 3, alignItems: 'flex-end'}}>
                    {this.editMode ? (
                      <View>
                        <CheckBox
                          title="Same Day Delivery"
                          checked={this.newDeliveryType === 'Same Day Delivery'}
                          checkedIcon="dot-circle-o"
                          uncheckedIcon="circle-o"
                          onPress={() =>
                            (this.newDeliveryType = 'Same Day Delivery')
                          }
                        />
                        <CheckBox
                          title="Next Day Delivery"
                          checked={this.newDeliveryType === 'Next Day Delivery'}
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
                      Vacation Mode
                    </Text>
                  </View>

                  <View style={{flex: 3, alignItems: 'flex-end'}}>
                    <Switch
                      trackColor={{
                        false: '#767577',
                        true: this.editMode ? colors.accent : colors.primary,
                      }}
                      thumbColor={'#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() =>
                        (this.newVacationMode = !this.newVacationMode)
                      }
                      value={
                        this.editMode ? this.newVacationMode : vacationMode
                      }
                      disabled={!this.editMode}
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
                      Payment Methods
                    </Text>
                  </View>

                  <View style={{flex: 3, alignItems: 'flex-end'}}>
                    {this.editMode ? (
                      <View>
                        <CheckBox
                          title="COD"
                          checked={newPaymentMethods.includes('COD')}
                          onPress={() => this.handlePaymentMethods('COD')}
                        />
                        <CheckBox
                          title="Online Banking"
                          checked={newPaymentMethods.includes('Online Banking')}
                          onPress={() =>
                            this.handlePaymentMethods('Online Banking')
                          }
                        />
                      </View>
                    ) : (
                      this.CategoryPills(paymentMethods)
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
                      Shipping Methods
                    </Text>
                  </View>

                  <View style={{flex: 3, alignItems: 'flex-end'}}>
                    {this.editMode ? (
                      <View>
                        <CheckBox
                          title="Grab Express"
                          checked={newShippingMethods.includes('Grab Express')}
                          onPress={() =>
                            this.handleShippingMethods('Grab Express')
                          }
                        />
                        <CheckBox
                          title="Lalamove"
                          checked={newShippingMethods.includes('Lalamove')}
                          onPress={() => this.handleShippingMethods('Lalamove')}
                        />
                        <CheckBox
                          title="Mr. Speedy"
                          checked={newShippingMethods.includes('Mr. Speedy')}
                          onPress={() =>
                            this.handleShippingMethods('Mr. Speedy')
                          }
                        />
                        <CheckBox
                          title="Angkas Padala"
                          checked={newShippingMethods.includes('Angkas Padala')}
                          onPress={() =>
                            this.handleShippingMethods('Angkas Padala')
                          }
                        />
                        <CheckBox
                          title="Own Delivery"
                          checked={newShippingMethods.includes('Own Delivery')}
                          onPress={() =>
                            this.handleShippingMethods('Own Delivery')
                          }
                        />
                      </View>
                    ) : (
                      this.CategoryPills(shippingMethods)
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
                    {this.editMode ? (
                      <Input
                        multiline
                        maxLength={200}
                        value={this.newOwnDeliveryServiceFee}
                        errorMessage={
                          newOwnDeliveryServiceFeeError &&
                          newOwnDeliveryServiceFeeError
                        }
                        onChangeText={(value) =>
                          this.handleOwnDeliveryServiceFee(value)
                        }
                        inputStyle={{textAlign: 'right'}}
                        containerStyle={{
                          borderColor: this.storeDetailsHeaderColor,
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
                        {ownDeliveryServiceFee}
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
                        ₱ {creditData.credits.toFixed(2)}
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
                        ₱ {creditData.creditThreshold}
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
            </Card>

            <Card
              style={{
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              <CardItem
                header
                bordered
                style={{backgroundColor: colors.primary}}>
                <Left>
                  <Body>
                    <Text style={{color: colors.icons, fontSize: 20}}>
                      Sales
                    </Text>
                  </Body>
                </Left>
              </CardItem>

              <CardItem bordered>
                <Text style={{textAlign: 'center', width: '100%'}}>
                  Coming Soon! View your sales summary here in the future.
                </Text>
              </CardItem>
            </Card>
          </ScrollView>
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
}

export default StoreDetailsScreen;
