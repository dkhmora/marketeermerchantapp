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
} from 'native-base';
// Custom Components
import BaseHeader from '../components/BaseHeader';
// Mobx
import {inject, observer} from 'mobx-react';
import {observable} from 'mobx';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';

@inject('detailsStore')
@inject('itemsStore')
@inject('authStore')
@observer
class StoreDetailsScreen extends Component {
  constructor(props) {
    super(props);
  }

  @observable displayUrl = null;
  @observable coverUrl = null;
  @observable displayPath = null;
  @observable coverPath = null;

  componentDidMount() {
    this.props.detailsStore.setStoreDetails(this.props.authStore.merchantId);
    this.props.itemsStore.setItemCategories(this.props.authStore.merchantId);
    this.getImage();
  }

  componentDidUpdate() {
    if (!this.displayUrl || !this.coverUrl) {
      this.getImage();
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

    ImagePicker.openCamera({
      width: 400,
      height: 400,
      cropping: true,
    })
      .then((image) => {
        this[`${type}Path`] = image.path;
      })
      .then(() => console.log('Image path successfully set!'))
      .then(() => uploadImage(merchantId, this[`${type}Path`], type))
      .then(() => (this[`${type}Path`] = null))
      .catch((err) => console.error(err));
  }

  handleSelectImage(type) {
    const {uploadImage} = this.props.detailsStore;
    const {merchantId} = this.props.authStore;

    ImagePicker.openPicker({
      width: 400,
      height: 400,
      cropping: true,
    })
      .then((image) => {
        this[`${type}Path`] = image.path;
      })
      .then(() => console.log('Image path successfully set!'))
      .then(() => uploadImage(merchantId, this[`${type}Path`], type))
      .then(() => (this[`${type}Path`] = null))
      .catch((err) => console.error(err));
  }

  render() {
    const {
      address,
      cities,
      deliveryDescription,
      itemCategories,
      storeDescription,
      displayImage,
      coverImage,
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
            <CardItem header bordered style={{backgroundColor: '#E91E63'}}>
              <Left>
                <Body>
                  <Text style={{color: '#fff'}}>Store Details</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem bordered>
              <Body>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text>Display Image:</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Button transparent>
                      <Icon
                        name="camera"
                        onPress={() => this.handleTakePhoto('display')}
                      />
                    </Button>
                    <Button transparent>
                      <Icon
                        name="image"
                        onPress={() => this.handleSelectImage('display')}
                      />
                    </Button>
                  </View>
                </View>
                <Image
                  source={{uri: this.displayUrl}}
                  style={{
                    height: 150,
                    width: 150,
                    flex: 1,
                    backgroundColor: '#e1e4e8',
                    alignSelf: 'center',
                    marginTop: 20,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: '#E91E63',
                  }}
                />
              </Body>
            </CardItem>
            <CardItem bordered>
              <Body>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text>Cover Image:</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Button
                      transparent
                      onPress={() => this.handleTakePhoto('cover').bind(this)}>
                      <Icon name="camera" />
                    </Button>
                    <Button
                      transparent
                      onPress={() =>
                        this.handleSelectImage('cover').bind(this)
                      }>
                      <Icon name="image" />
                    </Button>
                  </View>
                </View>
                <Image
                  source={{uri: this.coverUrl}}
                  style={{
                    height: 150,
                    width: 300,
                    flex: 1,
                    backgroundColor: '#e1e4e8',
                    alignSelf: 'center',
                    marginTop: 20,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: '#E91E63',
                  }}
                />
              </Body>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Display Name:</Text>
              </Left>
              <Right>
                <Text style={{color: '#E91E63', fontWeight: 'bold'}}>
                  {storeName}
                </Text>
              </Right>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Description:</Text>
              </Left>
              <Right>
                <Text style={{color: '#E91E63', fontWeight: 'bold'}}>
                  {storeDescription}
                </Text>
              </Right>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Delivery Description:</Text>
              </Left>
              <Right>
                <Text style={{color: '#E91E63', fontWeight: 'bold'}}>
                  {deliveryDescription}
                </Text>
              </Right>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Address:</Text>
              </Left>
              <Right>
                <Text
                  style={{
                    color: '#E91E63',
                    fontWeight: 'bold',
                    textAlign: 'right',
                  }}>
                  {address}
                </Text>
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
