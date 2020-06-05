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
  Picker,
  Icon,
} from 'native-base';
import {ActionSheetIOS} from 'react-native';
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
  @observable selectedCategory = this.props.itemsStore.itemCategories[0];
  @observable addCategoryModal = false;
  @observable deleteCategoryModal = false;

  @action closeAddCategoryModal() {
    this.addCategoryModal = false;
    this.newCategory = '';
  }

  @action showAddCategoryModal() {
    this.addCategoryModal = true;
  }

  @action showDeleteCategoryModal() {
    this.deleteCategoryModal = true;
  }

  @action closeDeleteCategoryModal() {
    this.deleteCategoryModal = false;
  }

  openOptions() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Add Category', 'Delete Category'],
        destructiveIndex: 1,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 1) {
          this.showAddCategoryModal();
        } else {
          this.showDeleteCategoryModal();
        }
      },
    );
  }

  onValueChange(value) {
    this.selectedCategory = value;
  }

  handleAddCategory() {
    const {addItemCategory, itemCategories} = this.props.itemsStore;
    const {merchantId} = this.props.authStore;

    if (!itemCategories.includes(this.newCategory)) {
      addItemCategory(merchantId, this.newCategory);
      this.closeAddCategoryModal();
      Toast.show({
        text: `Category "${this.newCategory}" successfully added!`,
        buttonText: 'Okay',
        type: 'success',
        duration: 5000,
        style: {margin: 20, borderRadius: 16},
      });
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

  handleDeleteCategory() {
    const {deleteItemCategory, itemCategories} = this.props.itemsStore;
    const {merchantId} = this.props.authStore;

    if (itemCategories.includes(this.selectedCategory)) {
      deleteItemCategory(merchantId, this.selectedCategory);
      this.selectedCategory = this.props.itemsStore.itemCategories[0];
      this.closeDeleteCategoryModal();
      Toast.show({
        text: `Category "${this.selectedCategory}" successfully deleted!`,
        buttonText: 'Okay',
        type: 'success',
        duration: 5000,
        style: {margin: 20, borderRadius: 16},
      });
    } else {
      Toast.show({
        text: `Category "${this.selectedCategory}" does not exist!`,
        buttonText: 'Okay',
        type: 'danger',
        duration: 5000,
        style: {margin: 20, borderRadius: 16},
      });
      this.closeDeleteCategoryModal();
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
          options={['Add Category', 'Delete Category', 'Cancel']}
          actions={[
            this.showAddCategoryModal.bind(this),
            this.showDeleteCategoryModal.bind(this),
          ]}
          openOptions={this.openOptions.bind(this)}
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
                    onPress={() => this.closeAddCategoryModal()}>
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

        <View>
          <Modal
            isVisible={this.deleteCategoryModal}
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
                    <H3>Delete Category</H3>
                  </Body>
                </Left>
              </CardItem>
              <CardItem>
                <Item
                  rounded
                  style={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    width: '100%',
                  }}>
                  <Picker
                    note={false}
                    placeholder="Select Item Category"
                    mode="dropdown"
                    selectedValue={this.selectedCategory}
                    iosIcon={<Icon name="arrow-down" />}
                    onValueChange={this.onValueChange.bind(this)}>
                    {itemCategories.map((cat, index) => {
                      return (
                        <Picker.Item key={index} label={cat} value={cat} />
                      );
                    })}
                  </Picker>
                </Item>
              </CardItem>
              <CardItem footer>
                <Left />
                <Right style={{flexDirection: 'row', marginRight: 45}}>
                  <Button
                    transparent
                    onPress={() => this.closeDeleteCategoryModal()}>
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    transparent
                    onPress={this.handleDeleteCategory.bind(this)}>
                    <Text>Delete</Text>
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
