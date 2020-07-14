import React, {Component} from 'react';
import {Image} from 'react-native';
import {
  Container,
  Item,
  Grid,
  Content,
  Row,
  Col,
  Textarea,
  Picker,
  Card,
  CardItem,
  H3,
  View,
  Toast,
} from 'native-base';
import BaseHeader from '../components/BaseHeader';
import {Button, Text, Icon, Input} from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import {inject, observer} from 'mobx-react';
import {observable, computed} from 'mobx';
import {colors} from '../../assets/colors';

@inject('authStore')
@inject('itemsStore')
@inject('detailsStore')
@observer
class AddItemScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pageCategory: this.props.pageCategory,
      imageDisplay: require('../../assets/placeholder.jpg'),
      nameError: '',
      descriptionError: '',
      priceError: '',
      stockError: '',
    };
  }

  // MobX
  @observable imagePath = '';
  @observable name = '';
  @observable category = '';
  @observable description = '';
  @observable unit = '';
  @observable price = '';
  @observable stock = '';
  @observable categories = this.props.itemsStore.itemCategories;

  @computed get formValid() {
    const {nameError, priceError, stockError} = this.state;

    if (nameError !== null || priceError !== null || stockError !== null) {
      return true;
    }

    return false;
  }

  componentDidMount() {
    const {pageCategory} = this.props.route.params;
    const {itemCategories} = this.props.itemsStore;
    this.category = pageCategory !== 'All' ? pageCategory : itemCategories[0];

    if (this.props.itemsStore.itemCategories.length <= 0) {
      this.props.navigation.goBack();
      Toast.show({
        text: `Please add a category before adding an item.`,
        buttonText: 'Okay',
        type: 'danger',
        style: {margin: 20, borderRadius: 16},
        duration: 0,
      });
    }
  }

  async onSubmit() {
    this.props.authStore.appReady = false;

    await this.props.itemsStore.addStoreItem(
      this.props.authStore.merchantId,
      this.imagePath,
      this.category,
      this.name,
      this.description,
      this.unit,
      Math.ceil(this.price),
      Number(Math.trunc(this.stock)),
    );

    this.props.authStore.appReady = true;
    this.props.navigation.goBack();
  }

  handleCategory(value) {
    this.category = value;
  }

  handleName(name) {
    const regexp = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
    const emptyRegexp = /^$|\s+/;
    this.name = name;

    if (emptyRegexp.test(this.name)) {
      this.setState({nameError: 'Item Name must not be empty'});
    } else if (regexp.test(this.name)) {
      this.setState({nameError: 'Item Name cannot include Emojis'});
    } else {
      this.setState({nameError: null});
    }
  }

  handleDescription(description) {
    const regexp = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

    this.description = description;

    if (regexp.test(this.description)) {
      this.setState({
        descriptionError: 'Item Description cannot include Emojis',
      });
    } else {
      this.setState({descriptionError: null});
    }
  }

  handlePrice(price) {
    const numberRegexp = /^[0-9]+$/;
    const emptyRegexp = /^$|\s+/;

    this.price = price;

    if (emptyRegexp.test(this.price)) {
      this.setState({
        priceError: 'Price must not be empty',
      });
    } else if (!numberRegexp.test(Number(price))) {
      this.setState({
        priceError: 'Price can only consist of numbers',
      });
    } else {
      this.setState({priceError: null});
    }
  }

  handleStock(stock) {
    const numberRegexp = /^[0-9]+$/;
    const emptyRegexp = /^$|\s+/;

    this.stock = stock;

    if (emptyRegexp.test(this.stock)) {
      this.setState({
        stockError: 'Initial Stock must not be empty',
      });
    } else if (!numberRegexp.test(Number(stock))) {
      this.setState({
        stockError: 'Initial Stock can only consist of numbers',
      });
    } else {
      this.setState({stockError: null});
    }
  }

  handleTakePhoto() {
    ImagePicker.openCamera({
      width: 400,
      height: 400,
      cropping: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        this.imagePath = image.path;
        this.setState({imageDisplay: {uri: image.path}});
      })
      .then(() => console.log('Image path successfully set!'))
      .catch((err) => console.log(err));
  }

  handleSelectImage() {
    ImagePicker.openPicker({
      width: 400,
      height: 400,
      cropping: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        this.imagePath = image.path;
        this.setState({imageDisplay: {uri: image.path}});
      })
      .then(() => console.log('Image path successfully set!'))
      .catch((err) => console.log(err));
  }

  render() {
    const {name} = this.props.route;
    const {navigation} = this.props;
    const {
      imageDisplay,
      nameError,
      stockError,
      priceError,
      descriptionError,
    } = this.state;

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={name} backButton navigation={navigation} />
        <Content>
          <Grid style={{padding: 18}}>
            <Row size={3} style={{marginBottom: 10}}>
              <Col style={{justifyContent: 'center'}}>
                <Image
                  source={imageDisplay}
                  style={{
                    alignSelf: 'flex-start',
                    borderColor: '#BDBDBD',
                    borderRadius: 10,
                    borderWidth: 1,
                    aspectRatio: 1,
                    height: '100%',
                    width: null,
                  }}
                />
              </Col>
              <Col
                style={{
                  justifyContent: 'center',
                  alignContent: 'center',
                  marginHorizontal: 12,
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
              </Col>
            </Row>
            <Row>
              <Card style={{borderRadius: 10, overflow: 'hidden'}}>
                <CardItem>
                  <Text note style={{textAlign: 'left'}}>
                    Tip: Uploading a photo makes customers more likely to buy
                    your product!
                  </Text>
                </CardItem>
              </Card>
            </Row>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                flexDirection: 'column',
                alignContent: 'center',
                marginTop: 18,
              }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                }}>
                <Text style={{fontSize: 16, fontFamily: 'ProductSans-Regular'}}>
                  Category:
                </Text>

                <Item style={{paddingHorizontal: 10, flex: 1}}>
                  <Picker
                    note={false}
                    placeholder="Select Item Category"
                    mode="dropdown"
                    selectedValue={this.category}
                    iosIcon={<Icon name="arrow-down" />}
                    onValueChange={this.handleCategory.bind(this)}>
                    {this.categories.map((cat, index) => {
                      return (
                        <Picker.Item key={index} label={cat} value={cat} />
                      );
                    })}
                  </Picker>
                </Item>
              </View>

              <View style={{marginTop: 18}}>
                <Input
                  errorMessage={nameError}
                  maxLength={80}
                  placeholder="Item Name"
                  value={this.name}
                  onChangeText={(value) => this.handleName(value)}
                />
                <Text
                  style={{
                    alignSelf: 'flex-end',
                    marginTop: -20,
                    marginRight: 16,
                    marginBottom: 20,
                  }}>
                  Character Limit: {this.name.length}/80
                </Text>

                <Input
                  errorMessage={descriptionError}
                  multiline
                  maxLength={150}
                  placeholder="Item Description"
                  value={this.description}
                  onChangeText={(value) => this.handleDescription(value)}
                />
                <Text
                  style={{
                    alignSelf: 'flex-end',
                    marginTop: -20,
                    marginRight: 16,
                    marginBottom: 20,
                  }}>
                  Character Limit: {this.description.length}/150
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flex: 1}}>
                    <Input
                      placeholder="Price"
                      keyboardType="number-pad"
                      errorMessage={priceError}
                      value={this.price}
                      onChangeText={(value) => this.handlePrice(value)}
                      inputStyle={{textAlign: 'right'}}
                      leftIcon={<Text style={{fontSize: 18}}>₱</Text>}
                    />
                  </View>

                  <Text
                    style={{
                      fontSize: 34,
                      textAlignVertical: 'center',
                      marginBottom: 15,
                    }}>
                    /
                  </Text>

                  <View style={{flex: 1}}>
                    <Input
                      placeholder="Unit"
                      autoCapitalize="none"
                      value={this.unit}
                      onChangeText={(value) => (this.unit = value)}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <Input
                      errorMessage={stockError}
                      keyboardType="number-pad"
                      placeholder="Initial Stock"
                      value={this.stock}
                      onChangeText={(value) => this.handleStock(value)}
                    />
                  </View>
                </View>
              </View>

              <Button
                title="Submit"
                titleStyle={{color: colors.icons}}
                buttonStyle={{backgroundColor: colors.primary, height: 50}}
                containerStyle={{marginTop: 20}}
                onPress={() => this.onSubmit()}
                disabled={this.formValid}
              />
            </View>
          </Grid>
        </Content>
      </Container>
    );
  }
}

export default AddItemScreen;
