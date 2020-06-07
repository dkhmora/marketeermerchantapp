import React, {Component, setState} from 'react';
import {StyleSheet, Image} from 'react-native';
import {
  Container,
  List,
  Grid,
  Row,
  Col,
  Content,
  Card,
  Body,
  Text,
  CardItem,
  Left,
  Right,
  Button,
  View,
  Icon,
  Item,
  Input,
  Toast,
  Textarea,
} from 'native-base';
// Custom Components
import BaseHeader from '../components/BaseHeader';
// Mobx
import {inject, observer} from 'mobx-react';
import {observable, action} from 'mobx';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import BaseOptionsMenu from '../components/BaseOptionsMenu';

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
  @observable storeDetailsHeaderColor = '#E91E63';

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
    this.storeDetailsHeaderColor = '#E91E63';
    this.editMode = !this.editMode;
  }

  @action toggleEditing() {
    const {
      address,
      deliveryDescription,
      storeDescription,
      storeName,
    } = this.props.detailsStore.storeDetails;

    if (this.editMode) {
      this.cancelEditing();
    } else {
      this.storeDetailsHeaderColor = '#f0ad4e';
      this.newAddress = address;
      this.newDeliveryDescription = deliveryDescription;
      this.newStoreDescription = storeDescription;
      this.newStoreName = storeName;
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
    } = this.props.detailsStore.storeDetails;

    if (
      address !== this.newAddress ||
      deliveryDescription !== this.newDeliveryDescription ||
      storeDescription !== this.newStoreDescription ||
      storeName !== this.newStoreName
    ) {
      updateStoreDetails(
        merchantId,
        this.newStoreName,
        this.newStoreDescription,
        this.newDeliveryDescription,
        this.newAddress,
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
    } = this.props.detailsStore.storeDetails;

    return (
      <Container style={{flex: 1}}>
        <BaseHeader
          title={this.props.route.name}
          optionsButton
          navigation={this.props.navigation}
        />

        <Content padder>
          <Card style={{borderRadius: 16, overflow: 'hidden'}}>
            <CardItem header bordered style={{backgroundColor: '#E91E63'}}>
              <Left>
                <Body>
                  <Text style={{color: '#fff'}}>Store Card Preview</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Test</Text>
              </Left>
              <Right>
                <Text>Text</Text>
              </Right>
            </CardItem>
          </Card>

          <Card style={{borderRadius: 16, overflow: 'hidden'}}>
            <CardItem
              header
              bordered
              style={{backgroundColor: this.storeDetailsHeaderColor}}>
              <Left style={{flex: 4}}>
                <Body>
                  <Text style={{color: '#fff'}}>Store Details</Text>
                </Body>
              </Left>
              <Body
                style={{
                  flex: 7,
                  alignItems: 'flex-end',
                  marginVertical: -3,
                }}>
                {this.editMode && (
                  <Button
                    iconRight
                    small
                    onPress={() => this.handleConfirmDetails()}
                    style={{
                      borderRadius: 24,
                      borderColor: '#fff',
                      borderWidth: 1,
                      backgroundColor: 'transparent',
                    }}>
                    <Text style={{color: '#fff'}}>Confirm</Text>
                    <Icon name="checkmark" style={{color: '#fff'}} />
                  </Button>
                )}
              </Body>
              <Right style={{flex: 1}}>
                {this.editMode ? (
                  <Button
                    transparent
                    onPress={() => this.cancelEditing()}
                    style={{marginVertical: -9.5}}>
                    <Icon name="close" style={{color: '#fff', fontSize: 25}} />
                  </Button>
                ) : (
                  <BaseOptionsMenu
                    iconStyle={{color: '#fff', fontSize: 25}}
                    options={['Toggle Editing']}
                    actions={[this.toggleEditing.bind(this)]}
                  />
                )}
              </Right>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Body>
                  <View
                    style={{
                      width: '100%',
                      height: 40,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{fontWeight: 'bold'}}>Display Image</Text>
                    {this.editMode && (
                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <Button transparent>
                          <Icon
                            name="camera"
                            onPress={() => this.handleTakePhoto('display')}
                            style={{color: '#f0ad4e'}}
                          />
                        </Button>
                        <Button transparent>
                          <Icon
                            name="image"
                            onPress={() => this.handleSelectImage('display')}
                            style={{color: '#f0ad4e'}}
                          />
                        </Button>
                      </View>
                    )}
                  </View>
                  {this.displayUrl && (
                    <Image
                      source={{uri: this.displayUrl}}
                      style={{
                        height: 150,
                        width: 150,
                        flex: 1,
                        backgroundColor: '#e1e4e8',
                        alignSelf: 'center',
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: '#E91E63',
                      }}
                    />
                  )}
                </Body>
              </Left>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Body>
                  <View
                    style={{
                      width: '100%',
                      height: 40,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{fontWeight: 'bold'}}>Cover Image</Text>
                    {this.editMode && (
                      <View style={{flexDirection: 'row'}}>
                        <Button
                          transparent
                          onPress={() => this.handleTakePhoto('cover')}>
                          <Icon name="camera" style={{color: '#f0ad4e'}} />
                        </Button>
                        <Button
                          transparent
                          onPress={() => this.handleSelectImage('cover')}>
                          <Icon name="image" style={{color: '#f0ad4e'}} />
                        </Button>
                      </View>
                    )}
                  </View>
                  {this.coverUrl && (
                    <Image
                      source={{uri: this.coverUrl}}
                      style={{
                        height: 200,
                        width: 300,
                        flex: 1,
                        backgroundColor: '#e1e4e8',
                        alignSelf: 'center',
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: '#E91E63',
                      }}
                    />
                  )}
                </Body>
              </Left>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text style={{fontWeight: 'bold'}}>Display Name</Text>
              </Left>
              <Right>
                {this.editMode ? (
                  <Item rounded>
                    <Input
                      value={this.newStoreName}
                      onChangeText={(value) => (this.newStoreName = value)}
                      style={{textAlign: 'right'}}
                    />
                  </Item>
                ) : (
                  <Text style={{color: '#E91E63', fontWeight: 'bold'}}>
                    {storeName}
                  </Text>
                )}
              </Right>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text style={{fontWeight: 'bold'}}>Description</Text>
              </Left>
              <Right>
                {this.editMode ? (
                  <Item rounded>
                    <Textarea
                      rowSpan={4}
                      maxLength={200}
                      value={this.newStoreDescription}
                      onChangeText={(value) =>
                        (this.newStoreDescription = value)
                      }
                      style={{textAlign: 'right'}}
                    />
                  </Item>
                ) : (
                  <Text style={{color: '#E91E63', fontWeight: 'bold'}}>
                    {storeDescription}
                  </Text>
                )}
              </Right>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text style={{fontWeight: 'bold'}}>Delivery Description</Text>
              </Left>
              <Right>
                {this.editMode ? (
                  <Item rounded>
                    <Textarea
                      rowSpan={4}
                      maxLength={200}
                      value={this.newDeliveryDescription}
                      onChangeText={(value) =>
                        (this.newDeliveryDescription = value)
                      }
                      style={{textAlign: 'right'}}
                    />
                  </Item>
                ) : (
                  <Text style={{color: '#E91E63', fontWeight: 'bold'}}>
                    {deliveryDescription}
                  </Text>
                )}
              </Right>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text style={{fontWeight: 'bold'}}>Address</Text>
              </Left>
              <Right>
                {this.editMode ? (
                  <Item rounded>
                    <Textarea
                      rowSpan={4}
                      maxLength={200}
                      placeholder="Address"
                      value={this.newAddress}
                      onChangeText={(value) => (this.newAddress = value)}
                      style={{textAlign: 'right'}}
                    />
                  </Item>
                ) : (
                  <Text
                    style={{
                      color: '#E91E63',
                      fontWeight: 'bold',
                      textAlign: 'right',
                    }}>
                    {address}
                  </Text>
                )}
              </Right>
            </CardItem>
          </Card>

          <Card style={{borderRadius: 16, overflow: 'hidden'}}>
            <CardItem header bordered style={{backgroundColor: '#E91E63'}}>
              <Left>
                <Body>
                  <Text style={{color: '#fff'}}>Delivery Bounds</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Test</Text>
              </Left>
              <Right>
                <Text>Text</Text>
              </Right>
            </CardItem>
          </Card>

          <Card style={{borderRadius: 16, overflow: 'hidden'}}>
            <CardItem header bordered style={{backgroundColor: '#E91E63'}}>
              <Left>
                <Body>
                  <Text style={{color: '#fff'}}>Sales</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Test</Text>
              </Left>
              <Right>
                <Text>Text</Text>
              </Right>
            </CardItem>
          </Card>
        </Content>
      </Container>
    );
  }
}

export default StoreDetailsScreen;
