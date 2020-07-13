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
@inject('authStore')
@observer
class StoreDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.props.detailsStore.setStoreDetails(this.props.authStore.merchantId);
    this.props.itemsStore.setItemCategories(this.props.authStore.merchantId);

    this.state = {
      loading: false,
      CODCheckbox: false,
      onlineBankingCheckbox: false,
      grabExpressCheckbox: false,
      lalamoveCheckbox: false,
      mrSpeedyCheckbox: false,
      ownServiceCheckbox: false,
      sameDayDeliveryCheckbox: false,
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
  @observable storeDetailsHeaderColor = colors.primary;

  componentDidMount() {
    this.getImage();
  }

  componentDidUpdate() {
    const {displayImageUrl, coverImageUrl} = this.state;

    if (!displayImageUrl || !coverImageUrl) {
      this.getImage();
    }
  }

  @action cancelEditing() {
    this.newFreeDelivery = '';
    this.newStoreDescription = '';
    this.newStoreName = '';
    this.newVacationMode = this.props.detailsStore.storeDetails.vacation;
    this.newPaymentMethods = [];
    this.newShippingMethods = [];
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

      this.setState({
        oldDisplayImageUrl: this.state.displayImageUrl,
        oldCoverImageUrl: this.state.coverImageUrl,
      });
      this.editMode = !this.editMode;
    }

    this.setState({loading: false});
  }

  getImage = async () => {
    const {displayImage, coverImage} = this.props.detailsStore.storeDetails;

    if (displayImage) {
      const displayRef = storage().ref(displayImage);
      const displayLink = await displayRef.getDownloadURL();

      this.setState({displayImageUrl: {uri: displayLink}});
    }

    if (coverImage) {
      const coverRef = storage().ref(coverImage);
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

  handleCheckBoxes() {
    this.state.CODCheckbox && this.newPaymentMethods.push('COD');
    this.state.onlineBankingCheckbox &&
      this.newPaymentMethods.push('Online Banking');
    this.state.grabExpressCheckbox &&
      this.newShippingMethods.push('Grab Express');
    this.state.lalamoveCheckbox && this.newShippingMethods.push('Lalamove');
    this.state.mrSpeedyCheckbox && this.newShippingMethods.push('Mr. Speedy');
    this.state.ownServiceCheckbox &&
      this.newShippingMethods.push('Own Service');
  }

  handleEditCheckBoxes() {
    const {
      paymentMethods,
      shippingMethods,
    } = this.props.detailsStore.storeDetails;

    if (paymentMethods) {
      paymentMethods.includes('Online Banking')
        ? this.setState({onlineBankingCheckbox: true})
        : this.setState({onlineBankingCheckbox: false});
      paymentMethods.includes('COD')
        ? this.setState({CODCheckbox: true})
        : this.setState({CODCheckbox: false});
    }

    if (shippingMethods) {
      shippingMethods.includes('Grab Express')
        ? this.setState({grabExpressCheckbox: true})
        : this.setState({grabExpressCheckbox: false});
      shippingMethods.includes('Lalamove')
        ? this.setState({lalamoveCheckbox: true})
        : this.setState({lalamoveCheckbox: false});
      shippingMethods.includes('Mr. Speedy')
        ? this.setState({mrSpeedyCheckbox: true})
        : this.setState({mrSpeedyCheckbox: false});
      shippingMethods.includes('Own Service')
        ? this.setState({ownServiceCheckbox: true})
        : this.setState({ownServiceCheckbox: false});
    }
  }

  async handleConfirmDetails() {
    const {updateStoreDetails, uploadImage} = this.props.detailsStore;
    const {merchantId} = this.props.authStore;
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
    } = this.props.detailsStore.storeDetails;

    this.setState({loading: true});

    if (coverImageUrl !== oldCoverImageUrl) {
      await uploadImage(
        merchantId,
        coverImageUrl.uri,
        'cover',
        oldCoverImageUrl,
      ).then(() => {
        this.setState({oldCoverImageUrl: coverImageUrl});
      });
    }

    if (displayImageUrl !== oldDisplayImageUrl) {
      await uploadImage(
        merchantId,
        displayImageUrl.uri,
        'display',
        oldDisplayImageUrl,
      ).then(() => {
        this.setState({oldDisplayImageUrl: displayImageUrl});
      });
    }

    if (
      freeDelivery !== this.newFreeDelivery ||
      storeDescription !== this.newStoreDescription ||
      storeName !== this.newStoreName ||
      vacationMode !== this.newVacationMode ||
      paymentMethods !== this.newPaymentMethods ||
      shippingMethods !== this.newShippingMethods ||
      deliveryType !== this.newDeliveryType
    ) {
      await updateStoreDetails(
        merchantId,
        this.newStoreName,
        this.newStoreDescription,
        this.newFreeDelivery,
        this.newVacationMode,
        this.newPaymentMethods,
        this.newShippingMethods,
        this.newDeliveryType,
      ).then(() => {
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
    } = this.props.detailsStore.storeDetails;

    const {coverImageUrl, displayImageUrl, loading} = this.state;

    const {editMode} = this;

    if (Object.keys(this.props.detailsStore.storeDetails).length > 0) {
      return (
        <View style={{flex: 1}}>
          <BaseHeader
            title={this.props.route.name}
            navigation={this.props.navigation}
            rightComponent={
              editMode && (
                <View style={{flexDirection: 'row'}}>
                  <Button
                    type="clear"
                    title="Cancel"
                    titleStyle={{color: colors.icons}}
                    onPress={() => this.cancelEditing()}
                  />

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
              <CardItem bordered>
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
                    {this.editMode ? (
                      <Switch
                        trackColor={{
                          false: '#767577',
                          true: colors.dark_accent,
                        }}
                        thumbColor={
                          this.newFreeDelivery ? colors.accent : '#f4f3f4'
                        }
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() =>
                          (this.newFreeDelivery = !this.newFreeDelivery)
                        }
                        value={this.newFreeDelivery}
                      />
                    ) : (
                      <Switch
                        trackColor={{false: '#767577', true: colors.dark}}
                        thumbColor={freeDelivery ? colors.primary : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        value={freeDelivery}
                        disabled
                      />
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
                    {this.editMode ? (
                      <Switch
                        trackColor={{
                          false: '#767577',
                          true: colors.dark_accent,
                        }}
                        thumbColor={
                          this.newVacationMode ? colors.accent : '#f4f3f4'
                        }
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() =>
                          (this.newVacationMode = !this.newVacationMode)
                        }
                        value={this.newVacationMode}
                      />
                    ) : (
                      <Switch
                        trackColor={{false: '#767577', true: colors.dark}}
                        thumbColor={vacationMode ? colors.primary : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        value={vacationMode}
                        disabled
                      />
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
                      Payment Methods
                    </Text>
                  </View>

                  <View style={{flex: 3, alignItems: 'flex-end'}}>
                    {this.editMode ? (
                      <View>
                        <CheckBox
                          title="COD"
                          checked={this.state.CODCheckbox}
                          onPress={() =>
                            this.setState({
                              CODCheckbox: !this.state.CODCheckbox,
                            })
                          }
                        />
                        <CheckBox
                          title="Online Banking"
                          checked={this.state.onlineBankingCheckbox}
                          onPress={() =>
                            this.setState({
                              onlineBankingCheckbox: !this.state
                                .onlineBankingCheckbox,
                            })
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
                          checked={this.state.grabExpressCheckbox}
                          onPress={() =>
                            this.setState({
                              grabExpressCheckbox: !this.state
                                .grabExpressCheckbox,
                            })
                          }
                        />
                        <CheckBox
                          title="Lalamove"
                          checked={this.state.lalamoveCheckbox}
                          onPress={() =>
                            this.setState({
                              lalamoveCheckbox: !this.state.lalamoveCheckbox,
                            })
                          }
                        />
                        <CheckBox
                          title="Mr. Speedy"
                          checked={this.state.mrSpeedyCheckbox}
                          onPress={() =>
                            this.setState({
                              mrSpeedyCheckbox: !this.state.mrSpeedyCheckbox,
                            })
                          }
                        />
                        <CheckBox
                          title="Own Service"
                          checked={this.state.ownServiceCheckbox}
                          onPress={() =>
                            this.setState({
                              ownServiceCheckbox: !this.state
                                .ownServiceCheckbox,
                            })
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
                      Credits
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
                        ₱ {creditData.credits}
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
                      Credit Threshold
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
