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
    };
  }

  // MobX
  @observable imageDisplay = require('../../assets/placeholder.jpg');
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

  handleImageUpload() {
    ImagePicker.openCamera({
      width: 400,
      height: 400,
      cropping: true,
    })
      .then((image) => {
        this.imagePath = image.path;
        this.imageDisplay = {uri: image.path};
      })
      .then(() => console.log('Image path successfully set!'))
      .catch((err) => console.error(err));
  }

  render() {
    const {name} = this.props.route;
    const {navigation} = this.props;

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={name} backButton navigation={navigation} />
        <Content>
          <Grid style={{padding: 18}}>
            <Row size={2} style={{marginBottom: '2%'}}>
              <Col style={{justifyContent: 'center'}}>
                <Image
                  source={this.imageDisplay}
                  style={{
                    alignSelf: 'flex-start',
                    borderColor: '#5B0EB5',
                    borderRadius: 24,
                    borderWidth: 1,
                    aspectRatio: 1,
                    height: '100%',
                    width: '100%',
                  }}
                />
              </Col>
              <Col
                style={{
                  justifyContent: 'flex-end',
                  alignContent: 'center',
                  marginHorizontal: 12,
                }}>
                <Button
                  full
                  bordered
                  style={{borderRadius: 24}}
                  onPress={() => this.handleImageUpload()}>
                  <Text>Upload Image</Text>
                </Button>
              </Col>
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
                rowSpan={5}
                bordered
                placeholder="Item Description"
                value={this.description}
                onChangeText={(value) => (this.description = value)}
                style={{marginTop: 18, borderRadius: 24}}
              />
              <Item rounded style={{marginTop: 18}}>
                <Text style={{marginLeft: 15}}>₱</Text>
                <Input
                  placeholder="Price"
                  keyboardType="number-pad"
                  value={this.price}
                  onChangeText={(value) => (this.price = value)}
                />
              </Item>
              <Item rounded style={{marginTop: 18}}>
                <Input
                  placeholder="Unit"
                  value={this.unit}
                  onChangeText={(value) => (this.unit = value)}
                />
              </Item>
              <Item rounded style={{marginTop: 18}}>
                <Input
                  keyboardType="number-pad"
                  placeholder="Initial Stock"
                  value={this.stock}
                  onChangeText={(value) => (this.stock = value)}
                />
              </Item>
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
