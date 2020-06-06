import React, {Component} from 'react';
import {Image} from 'react-native';
import {
  Container,
  Input,
  Button,
  Item,
  Grid,
  Content,
  Row,
  Text,
  Col,
  Textarea,
  Picker,
  Icon,
  Card,
  CardItem,
  H3,
  View,
} from 'native-base';
import BaseHeader from '../components/BaseHeader';
import ImagePicker from 'react-native-image-crop-picker';
import {inject, observer} from 'mobx-react';
import {observable} from 'mobx';

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
    };
  }

  // MobX
  @observable imagePath = '';
  @observable name = '';
  @observable category = '';
  @observable description = '';
  @observable unit = '';
  @observable price = '';
  @observable stock = 0;
  @observable categories = this.props.itemsStore.itemCategories;

  componentDidMount() {
    this.category = this.props.route.params.pageCategory;
  }

  onSubmit() {
    this.props.itemsStore
      .addStoreItem(
        this.props.authStore.merchantId,
        this.imagePath,
        this.category,
        this.name,
        this.description,
        this.unit,
        this.price,
        this.stock,
      )
      .then(() => {
        this.props.navigation.goBack();
      });
  }

  onValueChange(value) {
    this.category = value;
  }

  handleTakePhoto() {
    ImagePicker.openCamera({
      width: 400,
      height: 400,
      cropping: true,
    })
      .then((image) => {
        this.imagePath = image.path;
        this.setState({imageDisplay: {uri: image.path}});
      })
      .then(() => console.log('Image path successfully set!'))
      .catch((err) => console.error(err));
  }

  handleSelectImage() {
    ImagePicker.openPicker({
      width: 400,
      height: 400,
      cropping: true,
    })
      .then((image) => {
        this.imagePath = image.path;
        this.setState({imageDisplay: {uri: image.path}});
      })
      .then(() => console.log('Image path successfully set!'))
      .catch((err) => console.error(err));
  }

  render() {
    const {name} = this.props.route;
    const {navigation} = this.props;
    const {imageDisplay} = this.state;

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={name} backButton navigation={navigation} />
        <Content>
          <Grid style={{padding: 18}}>
            <Row size={3} style={{marginBottom: '2%'}}>
              <Col style={{justifyContent: 'center'}}>
                <Image
                  source={imageDisplay}
                  style={{
                    alignSelf: 'flex-start',
                    borderColor: '#BDBDBD',
                    borderRadius: 24,
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
                  full
                  bordered
                  iconLeft
                  style={{borderRadius: 24}}
                  onPress={() => this.handleSelectImage()}>
                  <Icon name="images" />
                  <Text>Select Image</Text>
                </Button>
                <Text style={{textAlign: 'center', marginVertical: 12}}>
                  or
                </Text>
                <Button
                  full
                  bordered
                  iconLeft
                  style={{borderRadius: 24}}
                  onPress={() => this.handleTakePhoto()}>
                  <Icon name="camera" />
                  <Text>Take Photo</Text>
                </Button>
              </Col>
            </Row>
            <Row>
              <Card style={{borderRadius: 16, overflow: 'hidden'}}>
                <CardItem>
                  <Text note style={{textAlign: 'left'}}>
                    Tip: Uploading a photo makes customers more likely to buy
                    your product!
                  </Text>
                </CardItem>
              </Card>
            </Row>
            <Row
              size={1}
              style={{
                justifyContent: 'center',
                flexDirection: 'column',
                alignContent: 'center',
              }}>
              <Item
                rounded
                style={{
                  marginTop: 18,
                  flexDirection: 'column',
                  alignItems: 'stretch',
                }}>
                <Picker
                  note={false}
                  placeholder="Select Item Category"
                  mode="dropdown"
                  selectedValue={this.category}
                  iosIcon={<Icon name="arrow-down" />}
                  onValueChange={this.onValueChange.bind(this)}>
                  {this.categories.map((cat, index) => {
                    return <Picker.Item key={index} label={cat} value={cat} />;
                  })}
                </Picker>
              </Item>
              <Item rounded style={{marginTop: 18}}>
                <Input
                  placeholder="Item Name"
                  value={this.name}
                  onChangeText={(value) => (this.name = value)}
                />
              </Item>
              <Textarea
                rowSpan={4}
                maxLength={150}
                bordered
                placeholder="Item Description"
                value={this.description}
                onChangeText={(value) => (this.description = value)}
                style={{marginTop: 18, borderRadius: 24}}
              />
              <Text note style={{alignSelf: 'flex-end', marginRight: 16}}>
                Character Limit: {this.description.length}/150
              </Text>
              <View style={{flex: 1, flexDirection: 'row', marginTop: 18}}>
                <Item rounded style={{flex: 1, marginRight: 12}}>
                  <Text style={{marginLeft: 15}}>₱</Text>
                  <Input
                    placeholder="Price"
                    keyboardType="number-pad"
                    value={this.price}
                    onChangeText={(value) => (this.price = value)}
                    style={{textAlign: 'right'}}
                  />
                  <H3>/</H3>
                  <Input
                    placeholder="Unit"
                    autoCapitalize="none"
                    value={this.unit}
                    onChangeText={(value) => (this.unit = value)}
                  />
                </Item>
                <Item rounded style={{flex: 1}}>
                  <Input
                    keyboardType="number-pad"
                    placeholder="Initial Stock"
                    value={this.stock}
                    onChangeText={(value) => (this.stock = value)}
                  />
                </Item>
              </View>
              <Button
                full
                style={{marginTop: 30, borderRadius: 24}}
                onPress={() => this.onSubmit()}>
                <Text>Submit</Text>
              </Button>
            </Row>
          </Grid>
        </Content>
      </Container>
    );
  }
}

export default AddItemScreen;
