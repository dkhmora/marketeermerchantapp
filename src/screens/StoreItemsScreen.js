import React, {Component} from 'react';
import {View, CardItem, Input, Item} from 'native-base';
import {Text, Button, Icon, Overlay} from 'react-native-elements';
import {Picker} from '@react-native-community/picker';
import BaseHeader from '../components/BaseHeader';
import {observer, inject} from 'mobx-react';
import {observable, action, computed} from 'mobx';
import {colors} from '../../assets/colors';
import Toast from '../components/Toast';
import {Dimensions, StyleSheet} from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import StoreItemsTab from '../navigation/StoreItemsTab';

const SCREEN_WIDTH = Dimensions.get('screen').width;

@inject('itemsStore')
@inject('authStore')
@inject('detailsStore')
@observer
class StoreItemsScreen extends Component {
  constructor(props) {
    super(props);

    const {storeId, itemCategories} = this.props.detailsStore.storeDetails;

    this.props.itemsStore.setStoreItems(storeId, itemCategories);
  }

  @observable newCategory = '';
  @observable selectedCategory = this.props.detailsStore.storeDetails
    .itemCategories
    ? this.props.detailsStore.storeDetails.itemCategories.slice[0]
    : null;
  @observable addCategoryModal = false;
  @observable deleteCategoryModal = false;

  @computed get tabWidth() {
    const {itemCategories} = this.props.detailsStore.storeDetails;

    if (itemCategories) {
      return itemCategories.length > 2
        ? 'auto'
        : SCREEN_WIDTH / (itemCategories.length + 1);
    }
    return 'auto';
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
      Toast({
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

  componentDidMount() {
    crashlytics().log('StoreItemsScreen');
  }

  onValueChange(value) {
    this.selectedCategory = value;
  }

  handleAddCategory() {
    const {storeId, itemCategories} = this.props.detailsStore.storeDetails;

    if (
      (itemCategories && !itemCategories.includes(this.newCategory)) ||
      !itemCategories
    ) {
      this.props.itemsStore
        .addItemCategory(storeId, this.newCategory)
        .then(() => {
          this.props.itemsStore.setStoreItems(storeId, itemCategories);

          Toast({
            text: `Category "${this.newCategory}" successfully added!`,
            type: 'success',
            duration: 5000,
            style: {margin: 20, borderRadius: 16},
          });
        })
        .then(() => {
          this.closeAddCategoryModal();
        });
    } else {
      Toast({
        text: `Category "${this.newCategory}" already exists!`,
        type: 'danger',
        duration: 5000,
        style: {margin: 20, borderRadius: 16},
      });
      this.closeAddCategoryModal();
    }
  }

  handleDeleteCategory() {
    const {storeId, itemCategories} = this.props.detailsStore.storeDetails;

    if (itemCategories.includes(this.selectedCategory)) {
      const category = this.selectedCategory;
      this.props.itemsStore
        .deleteItemCategory(storeId, this.selectedCategory)
        .then(() => {
          this.props.itemsStore.setStoreItems(storeId, itemCategories);

          this.closeDeleteCategoryModal();
          Toast({
            text: `Category "${category}" successfully deleted!`,
            type: 'success',
            duration: 5000,
            style: {margin: 20, borderRadius: 16},
          });
        });
    } else {
      Toast({
        text: `Category "${this.selectedCategory}" does not exist!`,
        type: 'danger',
        duration: 5000,
        style: {margin: 20, borderRadius: 16},
      });
      this.closeDeleteCategoryModal();
    }
  }

  render() {
    const {name} = this.props.route;
    const {navigation} = this.props;
    const {storeType} = this.props.detailsStore.storeDetails;
    const {itemCategories} = this.props.detailsStore.storeDetails;

    return (
      <View style={{...StyleSheet.absoluteFillObject}}>
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

        <Overlay
          isVisible={this.addCategoryModal}
          onBackdropPress={() => (this.addCategoryModal = false)}
          statusBarTranslucent
          animationType="fade"
          width="auto"
          height="auto"
          overlayStyle={{
            padding: 0,
            width: '80%',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
          <View>
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
          </View>
        </Overlay>

        <Overlay
          isVisible={this.deleteCategoryModal}
          onBackdropPress={() => (this.deleteCategoryModal = false)}
          statusBarTranslucent
          animationType="fade"
          width="auto"
          height="auto"
          overlayStyle={{
            padding: 0,
            width: '80%',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
          <View>
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
                  {itemCategories &&
                    itemCategories.map((cat, index) => {
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
          </View>
        </Overlay>

        <StoreItemsTab tabs={itemCategories} />
      </View>
    );
  }
}

export default StoreItemsScreen;
