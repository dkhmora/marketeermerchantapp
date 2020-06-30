import React, {Component, setState} from 'react';
import {StyleSheet, Image, ScrollView} from 'react-native';
import {
  Container,
  List,
  Grid,
  Row,
  Col,
  Content,
  Card,
  Body,
  CardItem,
  Left,
  Right,
  View,
  Item,
  Toast,
} from 'native-base';
// Custom Components
import BaseHeader from '../components/BaseHeader';
// Mobx
import {inject, observer} from 'mobx-react';
import {observable, action} from 'mobx';
import {Text, Input, Icon, Button} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import BaseOptionsMenu from '../components/BaseOptionsMenu';
import {colors} from '../../assets/colors';
import {Switch} from 'react-native-gesture-handler';

@inject('detailsStore')
@inject('itemsStore')
@inject('authStore')
@observer
class StoreDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.props.detailsStore.setStoreDetails(this.props.authStore.merchantId);
    this.props.itemsStore.setItemCategories(this.props.authStore.merchantId);
  }

  @observable displayUrl = null;
  @observable coverUrl = null;
  @observable displayPath = null;
  @observable coverPath = null;
  @observable editMode = false;
  @observable newStoreName = '';
  @observable newStoreDescription = '';
  @observable newDeliveryDescription = '';
  @observable newAddress = '';
  @observable newVacationMode = null;
  @observable storeDetailsHeaderColor = colors.primary;

  componentDidMount() {
    this.getImage();
  }

  componentDidUpdate() {
    if (!this.displayUrl || !this.coverUrl) {
      this.getImage();
    }
  }

  @action cancelEditing() {
    this.newAddress = '';
    this.newDeliveryDescription = '';
    this.newStoreDescription = '';
    this.newStoreName = '';
    this.newVacationMode = this.props.detailsStore.storeDetails.vacation;
    this.storeDetailsHeaderColor = colors.primary;
    this.editMode = !this.editMode;
  }

  @action toggleEditing() {
    const {
      address,
      deliveryDescription,
      storeDescription,
      storeName,
      vacationMode,
    } = this.props.detailsStore.storeDetails;

    if (this.editMode) {
      this.cancelEditing();
    } else {
      this.storeDetailsHeaderColor = colors.accent;
      this.newAddress = address;
      this.newDeliveryDescription = deliveryDescription;
      this.newStoreDescription = storeDescription;
      this.newStoreName = storeName;
      this.newVacationMode = vacationMode;
      this.editMode = !this.editMode;
    }
  }

  getImage = async () => {
    const {displayImage, coverImage} = this.props.detailsStore.storeDetails;

    if (displayImage) {
      const displayRef = storage().ref(displayImage);
      const displayLink = await displayRef.getDownloadURL();
      this.displayUrl = displayLink;
    }

    if (coverImage) {
      const coverRef = storage().ref(coverImage);
      const coverLink = await coverRef.getDownloadURL();
      this.coverUrl = coverLink;
    }
  };

  handleTakePhoto(type) {
    const {uploadImage} = this.props.detailsStore;
    const {merchantId} = this.props.authStore;
    const {displayImage, coverImage} = this.props.detailsStore.storeDetails;

    const currentImagePath = type === 'display' ? displayImage : coverImage;
    const width = type === 'display' ? 1080 : 1620;

    ImagePicker.openCamera({
      width,
      height: 1080,
      cropping: true,
    })
      .then((image) => {
        this[`${type}Path`] = image.path;
      })
      .then(() => console.log('Image path successfully set!'))
      .then(() =>
        uploadImage(merchantId, this[`${type}Path`], type, currentImagePath),
      )
      .then(() => {
        this[`${type}Path`] = null;
        this[`${type}Url`] = null;
      })
      .catch((err) => console.log(err));
  }

  handleSelectImage(type) {
    const {uploadImage} = this.props.detailsStore;
    const {merchantId} = this.props.authStore;
    const {displayImage, coverImage} = this.props.detailsStore.storeDetails;

    const currentImagePath = type === 'display' ? displayImage : coverImage;
    const width = type === 'display' ? 1080 : 1620;

    ImagePicker.openPicker({
      width,
      height: 1080,
      cropping: true,
    })
      .then((image) => {
        this[`${type}Path`] = image.path;
      })
      .then(() => console.log('Image path successfully set!'))
      .then(() =>
        uploadImage(merchantId, this[`${type}Path`], type, currentImagePath),
      )
      .then(() => {
        this[`${type}Path`] = null;
        this[`${type}Url`] = null;
      })
      .catch((err) => console.log(err));
  }

  handleConfirmDetails() {
    const {updateStoreDetails} = this.props.detailsStore;
    const {merchantId} = this.props.authStore;
    const {
      address,
      deliveryDescription,
      storeDescription,
      storeName,
      vacationMode,
    } = this.props.detailsStore.storeDetails;

    if (
      address !== this.newAddress ||
      deliveryDescription !== this.newDeliveryDescription ||
      storeDescription !== this.newStoreDescription ||
      storeName !== this.newStoreName ||
      vacationMode !== this.newVacationMode
    ) {
      updateStoreDetails(
        merchantId,
        this.newStoreName,
        this.newStoreDescription,
        this.newDeliveryDescription,
        this.newAddress,
        this.newVacationMode,
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
        text: 'No details were changed.',
        type: 'warning',
        style: {margin: 20, borderRadius: 16},
        duration: 3000,
      });
    }
    this.toggleEditing();
  }

  render() {
    const {
      address,
      cities,
      deliveryDescription,
      itemCategories,
      storeDescription,
      storeName,
      visibleToPublic,
      vacationMode,
    } = this.props.detailsStore.storeDetails;

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title={this.props.route.name}
          optionsButton
          navigation={this.props.navigation}
        />

        <ScrollView style={{paddingHorizontal: 10}}>
          <Card style={{borderRadius: 10, overflow: 'hidden'}}>
            <CardItem header bordered style={{backgroundColor: colors.primary}}>
              <Left>
                <Body>
                  <Text style={{color: colors.icons, fontSize: 20}}>
                    Store Card Preview
                  </Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem bordered></CardItem>
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
                backgroundColor: this.storeDetailsHeaderColor,
              }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 8,
                }}>
                <View>
                  <Text style={{color: colors.icons, fontSize: 20}}>
                    Store Details
                  </Text>
                </View>

                <View style={{alignItems: 'center'}}>
                  {this.editMode ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        height: 25,
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        padding: 0,
                      }}>
                      <Button
                        type="clear"
                        color={colors.icons}
                        icon={<Icon name="check" color={colors.icons} />}
                        iconRight
                        title="Confirm"
                        titleStyle={{color: colors.icons, paddingRight: 5}}
                        onPress={() => this.handleConfirmDetails()}
                        buttonStyle={{height: 25, paddingTop: 3}}
                        containerStyle={{
                          borderRadius: 24,
                          borderColor: colors.icons,
                          borderWidth: 1,
                          paddingHorizontal: -20,
                        }}
                      />
                      <Button
                        type="clear"
                        color={colors.icons}
                        icon={<Icon name="x" color={colors.icons} />}
                        onPress={() => this.cancelEditing()}
                        titleStyle={{color: colors.icons}}
                        buttonStyle={{
                          height: 25,
                        }}
                        containerStyle={{
                          borderRadius: 24,
                          paddingBottom: 3,
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
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                    Display Image
                  </Text>

                  {this.editMode && (
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <Button
                        type="clear"
                        titleStyle={colors.accent}
                        color={colors.icons}
                        onPress={() => this.handleTakePhoto('display')}
                        icon={<Icon name="camera" color={colors.accent} />}
                        containerStyle={{borderRadius: 24}}
                      />

                      <Button
                        type="clear"
                        titleStyle={colors.accent}
                        color={colors.icons}
                        onPress={() => this.handleSelectImage('display')}
                        icon={<Icon name="image" color={colors.accent} />}
                        containerStyle={{borderRadius: 24}}
                      />
                    </View>
                  )}
                </View>

                {this.displayUrl && (
                  <Image
                    source={{uri: this.displayUrl}}
                    style={{
                      height: 166.67,
                      width: 166.67,
                      backgroundColor: '#e1e4e8',
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: this.editMode
                        ? this.storeDetailsHeaderColor
                        : colors.primary,
                    }}
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
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                    Cover Image
                  </Text>

                  {this.editMode && (
                    <View style={{flexDirection: 'row'}}>
                      <Button
                        type="clear"
                        color={colors.icons}
                        titleStyle={colors.accent}
                        icon={<Icon name="camera" color={colors.accent} />}
                        onPress={() => this.handleTakePhoto('cover')}
                        containerStyle={{borderRadius: 24}}
                      />
                      <Button
                        type="clear"
                        color={colors.icons}
                        titleStyle={colors.accent}
                        icon={<Icon name="image" color={colors.accent} />}
                        onPress={() => this.handleSelectImage('cover')}
                        containerStyle={{borderRadius: 24}}
                      />
                    </View>
                  )}
                </View>

                {this.coverUrl && (
                  <Image
                    source={{uri: this.coverUrl}}
                    style={{
                      width: 250,
                      height: 166.67,
                      backgroundColor: '#e1e4e8',
                      alignSelf: 'center',
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: this.editMode
                        ? this.storeDetailsHeaderColor
                        : colors.primary,
                      resizeMode: 'cover',
                    }}
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
                <View style={{flex: 2, paddingright: 10}}>
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
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
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
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
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                    Delivery Description
                  </Text>
                </View>

                <View style={{flex: 3, alignItems: 'flex-end'}}>
                  {this.editMode ? (
                    <Input
                      multiline
                      maxLength={200}
                      value={this.newDeliveryDescription}
                      onChangeText={(value) =>
                        (this.newDeliveryDescription = value)
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
                      }}>
                      {deliveryDescription}
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
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                    Address
                  </Text>
                </View>

                <View style={{flex: 3, alignItems: 'flex-end'}}>
                  {this.editMode ? (
                    <Input
                      multiline
                      maxLength={200}
                      placeholder="Address"
                      value={this.newAddress}
                      onChangeText={(value) => (this.newAddress = value)}
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
                      }}>
                      {address}
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
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                    Vacation Mode
                  </Text>
                </View>

                <View style={{flex: 3, alignItems: 'flex-end'}}>
                  {this.editMode ? (
                    <Switch
                      trackColor={{false: '#767577', true: colors.dark_accent}}
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
          </Card>

          <Card
            style={{
              borderRadius: 10,
              overflow: 'hidden',
            }}>
            <CardItem header bordered style={{backgroundColor: colors.primary}}>
              <Left>
                <Body>
                  <Text style={{color: colors.icons, fontSize: 20}}>Sales</Text>
                </Body>
              </Left>
            </CardItem>

            <CardItem bordered></CardItem>
          </Card>
        </ScrollView>
      </View>
    );
  }
}

export default StoreDetailsScreen;
