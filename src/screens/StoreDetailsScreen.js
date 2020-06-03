import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
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
} from 'native-base';
// Custom Components
import BaseHeader from '../components/BaseHeader';
// Mobx
import {inject, observer} from 'mobx-react';

@inject('detailsStore')
@inject('authStore')
@observer
class StoreDetailsScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.detailsStore.setStoreDetails(this.props.authStore.merchantId);
  }

  render() {
    const {
      address,
      cities,
      deliveryDescription,
      itemCategories,
      storeDescription,
      storeImage,
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
                  <Text style={{color: '#fff'}}>Current Details</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Store Image:</Text>
              </Left>
              <Right>
                <Text>{storeImage}</Text>
              </Right>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Store Display Name:</Text>
              </Left>
              <Right>
                <Text>{storeName}</Text>
              </Right>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Store Description:</Text>
              </Left>
              <Right>
                <Text>{storeDescription}</Text>
              </Right>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Delivery Description:</Text>
              </Left>
              <Right>
                <Text>{deliveryDescription}</Text>
              </Right>
            </CardItem>
            <CardItem bordered>
              <Left>
                <Text>Store Address:</Text>
              </Left>
              <Right>
                <Text>{address}</Text>
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
        </Content>
      </Container>
    );
  }
}

export default StoreDetailsScreen;
