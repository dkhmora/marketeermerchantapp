import React, {Component} from 'react';
import {
  Container,
  View,
  Card,
  CardItem,
  Input,
  Item,
  Right,
  Left,
  Body,
  H3,
  Toast,
  Picker,
} from 'native-base';
import {Text, Button, Icon} from 'react-native-elements';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ItemsList from '../components/ItemsList';
import BaseHeader from '../components/BaseHeader';
import {observer, inject} from 'mobx-react';
import Modal from 'react-native-modal';
import {observable, action, computed} from 'mobx';
import {colors} from '../../assets/colors';
import EditItemModal from '../components/EditItemModal';

const TabBase = createMaterialTopTabNavigator();
@inject('itemsStore')
@inject('authStore')
@inject('detailsStore')
@observer
class StoreItemsTab extends Component {
  constructor(props) {
    super(props);
  }

  @observable newCategory = '';
  @observable selectedCategory = this.props.detailsStore.storeDetails
    .itemCategories.slice[0];
  @observable addCategoryModal = false;
  @observable deleteCategoryModal = false;

  @computed get scrollEnabled() {
    return this.props.detailsStore.storeDetails.itemCategories.length > 1;
  }

  @action closeAddCategoryModal() {
    this.addCategoryModal = false;
    this.newCategory = '';
  }

  @action showAddCategoryModal() {
    this.addCategoryModal = true;
  }

  @action showDeleteCategoryModal() {
    if (this.props.detailsStore.storeDetails.itemCategories.length > 0) {
      this.deleteCategoryModal = true;
      this.selectedCategory = this.props.detailsStore.storeDetails.itemCategories[0];
    } else {
      Toast.show({
        text: `There are no categories to be deleted.`,
        type: 'warning',
        style: {margin: 20, borderRadius: 16},
        duration: 3000,
      });
    }
  }

  @action closeDeleteCategoryModal() {
    this.deleteCategoryModal = false;
  }

  onValueChange(value) {
    this.selectedCategory = value;
  }

  handleAddCategory() {
    const {merchantId, itemCategories} = this.props.detailsStore.storeDetails;

    if (!itemCategories.includes(this.newCategory)) {
      this.props.itemsStore
        .addItemCategory(merchantId, this.newCategory)
        .then(() => {
          this.props.itemsStore.setStoreItems(merchantId, itemCategories);

          Toast.show({
            text: `Category "${this.newCategory}" successfully added!`,
            buttonText: 'Okay',
            type: 'success',
            duration: 5000,
            style: {margin: 20, borderRadius: 16},
          });
        })
        .then(() => {
          this.closeAddCategoryModal();
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
    const {merchantId, itemCategories} = this.props.detailsStore.storeDetails;

    if (itemCategories.includes(this.selectedCategory)) {
      this.props.itemsStore
        .deleteItemCategory(merchantId, this.selectedCategory)
        .then(() => {
          this.props.itemsStore.setStoreItems(merchantId, itemCategories);

          this.closeDeleteCategoryModal();
          Toast.show({
            text: `Category "${this.selectedCategory}" successfully deleted!`,
            buttonText: 'Okay',
            type: 'success',
            duration: 5000,
            style: {margin: 20, borderRadius: 16},
          });
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
    const {itemCategories} = this.props.detailsStore.storeDetails;
    const {name} = this.props.route;
    const {navigation} = this.props;

    return (
      <Container style={{flex: 1}}>
        <BaseHeader
          title={name}
          options={['Add Category', 'Delete Category']}
          actions={[
            this.showAddCategoryModal.bind(this),
            this.showDeleteCategoryModal.bind(this),
          ]}
          destructiveIndex={1}
          navigation={navigation}
        />

        <View>
          <Modal
            isVisible={this.addCategoryModal}
            onBackdropPress={() => (this.addCategoryModal = false)}
            transparent={true}
            style={{alignItems: 'center'}}>
            <Card
              style={{
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              <CardItem header>
                <Text style={{fontFamily: 'ProductSans-Regular', fontSize: 20}}>
                  Add Category
                </Text>
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
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                  }}>
                  <Button
                    title="Cancel"
                    type="clear"
                    onPress={() => this.closeAddCategoryModal()}
                    containerStyle={{marginRight: 10}}
                  />

                  <Button
                    title="Add"
                    type="clear"
                    onPress={this.handleAddCategory.bind(this)}
                  />
                </View>
              </CardItem>
            </Card>
          </Modal>
        </View>

        <View>
          <Modal
            isVisible={this.deleteCategoryModal}
            transparent={true}
            onBackdropPress={() => (this.deleteCategoryModal = false)}
            style={{alignItems: 'center'}}>
            <Card
              style={{
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              <CardItem header>
                <Text style={{fontFamily: 'ProductSans-Regular', fontSize: 20}}>
                  Delete Category
                </Text>
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
                    onValueChange={(value) => this.onValueChange(value)}>
                    {itemCategories.map((cat, index) => {
                      return (
                        <Picker.Item key={index} label={cat} value={cat} />
                      );
                    })}
                  </Picker>
                </Item>
              </CardItem>

              <CardItem footer>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                  }}>
                  <Button
                    title="Cancel"
                    type="clear"
                    onPress={() => this.closeDeleteCategoryModal()}
                    containerStyle={{marginRight: 10}}
                  />

                  <Button
                    title="Delete"
                    type="clear"
                    onPress={this.handleDeleteCategory.bind(this)}
                  />
                </View>
              </CardItem>
            </Card>
          </Modal>
        </View>

        <EditItemModal isVisible={this.props.itemsStore.editItemModal} />

        <TabBase.Navigator
          tabBarOptions={{
            scrollEnabled: this.scrollEnabled,
            style: {backgroundColor: colors.icons},
            activeTintColor: colors.primary,
            inactiveTintcolor: '#eee',
            indicatorStyle: {backgroundColor: colors.primary},
          }}>
          <TabBase.Screen
            name="All"
            component={ItemsList}
            initialParams={{
              category: 'All',
            }}
          />
          {itemCategories.length > 0 &&
            itemCategories.map((category, index) => {
              return (
                <TabBase.Screen
                  name={`${category}`}
                  component={ItemsList}
                  key={index}
                  initialParams={{
                    category,
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
