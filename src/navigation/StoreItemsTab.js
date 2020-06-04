import React, {Component} from 'react';
import {
  Container,
  View,
  Text,
  Card,
  CardItem,
  Input,
  Item,
  Right,
  Button,
  Left,
  Body,
  H3,
  Toast,
} from 'native-base';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ItemsList from '../components/ItemsList';
import BaseHeader from '../components/BaseHeader';
import {observer, inject} from 'mobx-react';
import Modal from 'react-native-modal';
import {observable, action} from 'mobx';

const TabBase = createMaterialTopTabNavigator();
@inject('itemsStore')
@inject('authStore')
@observer
class StoreItemsTab extends Component {
  constructor(props) {
    super(props);
  }

  @observable newCategory = '';
  @observable addCategoryModal = false;
  @observable deleteCategoryModal = false;

  @action closeAddCategoryModal() {
    this.addCategoryModal = false;
    this.newCategory = '';
  }

  showAddCategoryModal() {
    this.addCategoryModal = true;
  }

  handleAddCategory() {
    const {addItemCategory, itemCategories} = this.props.itemsStore;
    const {merchantId} = this.props.authStore;

    if (!itemCategories.includes(this.newCategory)) {
      addItemCategory(merchantId, this.newCategory);
      this.closeAddCategoryModal();
    } else {
      Toast.show({
        text: `Category "${this.newCategory}" already exists!`,
        buttonText: 'Okay',
        type: 'danger',
        duration: 5000,
        style: {margin: 20, borderRadius: 16},
      });
      this.closeAddCategoryModal();
    }
  }

  render() {
    const {itemCategories} = this.props.itemsStore;
    const {name} = this.props.route;
    const {navigation} = this.props;

    const scroll = itemCategories.length > 2 ? true : false;

    return (
      <Container style={{flex: 1}}>
        <BaseHeader
          title={name}
          options={['Add Category', 'Delete Category']}
          actions={[this.showAddCategoryModal.bind(this)]}
          navigation={navigation}
        />

        <View>
          <Modal
            isVisible={this.addCategoryModal}
            transparent={true}
            style={{alignItems: 'center'}}>
            <Card
              style={{
                borderRadius: 16,
                overflow: 'hidden',
              }}>
              <CardItem header>
                <Left>
                  <Body>
                    <H3>Add Category</H3>
                  </Body>
                </Left>
              </CardItem>
              <CardItem>
                <Item rounded>
                  <Input
                    placeholder="Category Name"
                    value={this.newCategory}
                    onChangeText={(value) => (this.newCategory = value)}
                  />
                </Item>
              </CardItem>
              <CardItem footer>
                <Left />
                <Right style={{flexDirection: 'row'}}>
                  <Button
                    transparent
                    onPress={() => (this.addCategoryModal = false)}>
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    transparent
                    onPress={this.handleAddCategory.bind(this)}>
                    <Text>Add</Text>
                  </Button>
                </Right>
              </CardItem>
            </Card>
          </Modal>
        </View>
        <TabBase.Navigator
          tabBarOptions={{
            scrollEnabled: scroll,
            style: {backgroundColor: '#E91E63'},
            activeTintColor: '#fff',
            inactiveTintcolor: '#eee',
            indicatorStyle: {backgroundColor: '#FFC107'},
          }}>
          {itemCategories.map((category, index) => {
            this.props.itemsStore.setCategoryItems(category);

            return (
              <TabBase.Screen
                name={`${category}`}
                component={ItemsList}
                key={index}
                initialParams={{
                  category,
                  navigation,
                }}
              />
            );
          })}
        </TabBase.Navigator>
      </Container>
    );
  }
}

export default StoreItemsTab;
