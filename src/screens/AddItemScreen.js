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
      nameError: null,
      descriptionError: null,
      priceError: null,
      stockError: null,
      discountedPriceError: null,
    };
  }

  // MobX
  @observable imagePath = '';
  @observable name = '';
  @observable category = '';
  @observable description = '';
  @observable unit = '';
  @observable price = '';
  @observable discountedPrice = '';
  @observable stock = '';
  @observable categories = this.props.detailsStore.storeDetails.itemCategories;

  @computed get formValid() {
    const {
      nameError,
      priceError,
      stockError,
      descriptionError,
      discountedPriceError,
    } = this.state;

    if (
      nameError === null ||
      priceError === null ||
      stockError === null ||
      nameError !== '' ||
      priceError !== '' ||
      stockError !== '' ||
      descriptionError ||
      discountedPriceError
    ) {
      return false;
    }

    return true;
  }

  componentDidMount() {
    const {pageCategory} = this.props.route.params;
    const {itemCategories} = this.props.detailsStore.storeDetails;
    this.category = pageCategory !== 'All' ? pageCategory : itemCategories[0];

    if (this.props.detailsStore.storeDetails.itemCategories.length <= 0) {
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

    const item = {
      category: this.category,
      name: this.name,
      description: this.description,
      unit: this.unit,
      price: Number(Math.ceil(this.price)),
      discountedPrice: this.discountedPrice
        ? Number(Math.ceil(this.discountedPrice))
        : null,
      stock: Number(Math.trunc(this.stock)),
      sales: 0,
    };

    await this.props.itemsStore.addStoreItem(
      this.props.detailsStore.storeDetails.merchantId,
      item,
      this.imagePath,
    );

    this.props.authStore.appReady = true;
    this.props.navigation.goBack();
  }

  handleCategory(value) {
    this.category = value;
  }

  handleName(name) {
    const regexp = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
    this.name = name;

    if (this.name === '') {
      this.setState({nameError: 'Item Name must not be empty'});
    } else if (regexp.test(this.name)) {
      this.setState({nameError: 'Item Name cannot include Emojis'});
    } else {
      this.setState({nameError: ''});
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
    this.price = price;

    if (this.price === '') {
      this.setState({
        priceError: 'Price must not be empty',
      });
    } else if (!numberRegexp.test(Number(price))) {
      this.setState({
        priceError: 'Price can only consist of numbers',
      });
    } else if (Number(this.discountedPrice) >= Number(price)) {
      this.setState({
        discountedPriceError: 'Normal Price must be more than Discounted Price',
      });
    } else {
      this.setState({priceError: ''});

      if (
        Number(this.discountedPrice) <= Number(price) &&
        this.state.priceError ===
          'Discounted Price must be less than Normal Price'
      ) {
        this.setState({
          discountedPriceError: null,
        });
      }
    }
  }

  handleDiscountedPrice(discountedPrice) {
    const numberRegexp = /^[0-9]+$/;
    this.discountedPrice = discountedPrice;

    if (!numberRegexp.test(Number(discountedPrice))) {
      this.setState({
        discountedPriceError: 'Discounted Price can only consist of numbers',
      });
    } else if (Number(discountedPrice) >= Number(this.price)) {
      this.setState({
        discountedPriceError: 'Discounted Price must be less than Normal Price',
      });
    } else {
      this.setState({discountedPriceError: null});

      if (
        Number(discountedPrice) <= Number(this.price) &&
        this.state.priceError ===
          'Normal Price must be more than Discounted Price'
      ) {
        this.setState({priceError: ''});
      }
    }
  }

  handleStock(stock) {
    const numberRegexp = /^[0-9]+$/;

    this.stock = stock;

    if (this.stock === '') {
      this.setState({
        stockError: 'Initial Stock must not be empty',
      });
    } else if (!numberRegexp.test(Number(stock))) {
      this.setState({
        stockError: 'Initial Stock can only consist of numbers',
      });
    } else {
      this.setState({stockError: ''});
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
      discountedPriceError,
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
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'ProductSans-Regular',
                  }}>
                  Category:
                </Text>

                <Picker
                  note={false}
                  placeholder="Select Item Category"
                  mode="dropdown"
                  selectedValue={this.category}
                  iosIcon={<Icon name="chevron-down" />}
                  onValueChange={this.handleCategory.bind(this)}>
                  {this.categories.map((cat, index) => {
                    return <Picker.Item key={index} label={cat} value={cat} />;
                  })}
                </Picker>
              </View>

              <View style={{marginTop: 18}}>
                <Input
                  errorMessage={nameError}
                  maxLength={80}
                  autoCapitalize="words"
                  placeholder="Item Name"
                  placeholderTextColor={colors.text_secondary}
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
                  placeholderTextColor={colors.text_secondary}
                  value={this.description}
                  autoCapitalize="sentences"
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
                      placeholderTextColor={colors.text_secondary}
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
                      placeholderTextColor={colors.text_secondary}
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
                      placeholderTextColor={colors.text_secondary}
                      value={this.stock}
                      onChangeText={(value) => this.handleStock(value)}
                    />
                  </View>
                </View>
              </View>

              <Input
                placeholder="Discounted Price"
                placeholderTextColor={colors.text_secondary}
                keyboardType="number-pad"
                errorMessage={discountedPriceError}
                value={this.discountedPrice}
                onChangeText={(value) => this.handleDiscountedPrice(value)}
                leftIcon={<Text style={{fontSize: 18}}>₱</Text>}
              />

              <Button
                title="Submit"
                titleStyle={{color: colors.icons}}
                buttonStyle={{backgroundColor: colors.primary, height: 50}}
                containerStyle={{marginTop: 20}}
                onPress={() => this.onSubmit()}
                disabled={!this.formValid}
              />
            </View>
          </Grid>
        </Content>
      </Container>
    );
  }
}

export default AddItemScreen;
