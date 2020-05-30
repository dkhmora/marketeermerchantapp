import React, {useEffect} from 'react';
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
} from 'native-base';
import BaseHeader from '../components/BaseHeader';
import {addStoreItem} from '../../firebase/store';

export default function AddItemScreen({navigation, route}) {
  const {merchantId, pageCategory} = route.params;

  const [category, setCategory] = React.useState('');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [unit, setUnit] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [stock, setStock] = React.useState('');

  function onSubmit() {
    addStoreItem(merchantId, category, name, description, unit, price, stock);
    console.log(merchantId, category, name, description, unit, price, stock);
  }

  useEffect(() => {
    setCategory(pageCategory);
  }, [pageCategory]);

  return (
    <Container style={{flex: 1}}>
      <BaseHeader
        title={route.name}
        backButton
        optionsButton
        navigation={navigation}
      />
      <Content>
        <Grid style={{padding: 18}}>
          <Row size={2} style={{marginBottom: '2%'}}>
            <Col style={{justifyContent: 'center'}}>
              <Image
                source={require('../../assets/placeholder.jpg')}
                style={{
                  alignSelf: 'flex-start',
                  borderColor: '#5B0EB5',
                  borderRadius: 24,
                  borderWidth: 1,
                  height: '80%',
                  aspectRatio: 1,
                }}
              />
            </Col>
            <Col
              style={{
                justifyContent: 'flex-end',
                alignContent: 'center',
                marginBottom: '5%',
              }}>
              <Button full bordered style={{borderRadius: 24}}>
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
            <Item rounded style={{marginTop: 18}}>
              <Picker
                note={false}
                placeholder="Select Item Category"
                selectedValue={category}
                mode="dropdown"
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={{borderRadius: 24, borderWidth: 2, borderColor: 'blue'}}>
                <Picker.Item label="Fruit" value="Fruit" />
                <Picker.Item label="Vegetable" value="Vegetable" />
              </Picker>
            </Item>
            <Item rounded style={{marginTop: 18}}>
              <Input
                placeholder="Item Name"
                value={name}
                onChangeText={(value) => setName(value)}
              />
            </Item>
            <Textarea
              rowSpan={5}
              bordered
              placeholder="Item Description"
              value={description}
              onChangeText={(value) => setDescription(value)}
              style={{marginTop: 18, borderRadius: 24}}
            />
            <Item rounded style={{marginTop: 18}}>
              <Input
                placeholder="Price"
                keyboardType="number-pad"
                value={price}
                onChangeText={(value) => setPrice(value)}
              />
            </Item>
            <Item rounded style={{marginTop: 18}}>
              <Input
                placeholder="Unit"
                value={unit}
                onChangeText={(value) => setUnit(value)}
              />
            </Item>
            <Item rounded style={{marginTop: 18}}>
              <Input
                placeholder="Initial Stock"
                value={stock}
                onChangeText={(value) => setStock(value)}
              />
            </Item>
            <Button
              full
              style={{marginTop: 30, borderRadius: 24}}
              onPress={() => onSubmit()}>
              <Text>Submit</Text>
            </Button>
          </Row>
        </Grid>
      </Content>
    </Container>
  );
}
