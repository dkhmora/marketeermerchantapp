import React, {Component} from 'react';
import {Overlay, Text, Button, Icon, Input} from 'react-native-elements';
import {View, SafeAreaView, StatusBar, Platform} from 'react-native';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import {inject, observer} from 'mobx-react';
import Toast from './Toast';
import {computed} from 'mobx';
import ImagePicker from 'react-native-image-crop-picker';
import {Card, CardItem, Picker, Item, Label} from 'native-base';
import storage from '@react-native-firebase/storage';
import FastImage from 'react-native-fast-image';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ConfirmationModal from './ConfirmationModal';

@inject('detailsStore')
@inject('itemsStore')
@observer
class EditItemModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      newImagePath: null,
      imageDisplay: require('../../assets/placeholder.jpg'),
      newName: '',
      newCategory: '',
      newDescription: '',
      newStock: '',
      newUnit: '',
      newPrice: '',
      newDiscountedPrice: '',
      newStockError: null,
      newNameError: null,
      newDescriptionError: null,
      newPriceError: null,
      newDiscountedPriceError: null,
      editItemConfirmModal: false,
    };
  }

  @computed get categories() {
    return this.props.detailsStore.storeDetails.itemCategories;
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.isVisible !== prevProps.isVisible &&
      this.props.itemsStore.selectedItem
    ) {
      const {
        name,
        description,
        category,
        unit,
        price,
        discountedPrice,
      } = this.props.itemsStore.selectedItem;

      this.setState({
        newName: name,
        newDescription: description,
        newCategory:
          this.categories && this.categories.includes(category)
            ? category
            : this.categories[0],
        newUnit: String(unit),
        newPrice: String(price),
        newDiscountedPrice: discountedPrice ? String(discountedPrice) : '',
      });

      if (this.props.itemsStore.selectedItem.image) {
        this.getImage();
      }
    }
  }

  getImage = async () => {
    const ref = storage().ref(this.props.itemsStore.selectedItem.image);
    const link = await ref
      .getDownloadURL()
      .catch((err) => Toast({text: err.message, type: 'danger'}));

    this.setState({imageDisplay: {uri: link}, imageLoading: false});
  };

  handleStock(stock) {
    const numberRegexp = /^-?[0-9]+$/;

    this.setState({newStock: stock});

    if (!numberRegexp.test(Number(stock))) {
      this.setState({
        stockError: 'Additional Stock can only consist of (+/-) numbers',
      });
    } else {
      this.setState({newStockError: null});
    }
  }

  handleCategory(category) {
    this.setState({newCategory: category});
  }

  handleName(name) {
    const regexp = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

    this.setState({newName: name});

    if (name === '') {
      this.setState({newNameError: 'Item Name must not be empty'});
    } else if (regexp.test(name)) {
      this.setState({newNameError: 'Item Name cannot include Emojis'});
    } else {
      this.setState({newNameError: null});
    }
  }

  handleDescription(description) {
    const regexp = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

    this.setState({newDescription: description});

    if (regexp.test(description)) {
      this.setState({
        newDescriptionError: 'Item Description cannot include Emojis',
      });
    } else {
      this.setState({newDescriptionError: null});
    }
  }

  handlePrice(price) {
    const numberRegexp = /^[0-9]+$/;

    this.setState({newPrice: price});

    if (price === '') {
      this.setState({
        newPriceError: 'Price must not be empty',
      });
    } else if (!numberRegexp.test(Number(price))) {
      this.setState({
        newPriceError: 'Price can only consist of numbers',
      });
    } else if (Number(this.state.newDiscountedPrice) >= Number(price)) {
      this.setState({
        newPriceError: 'Normal Price must be more than Discounted Price',
      });
    } else {
      this.setState({newPriceError: null});

      if (
        Number(this.state.newDiscountedPrice) <= Number(price) &&
        this.state.newDiscountedPriceError ===
          'Discounted Price must be less than Normal Price'
      ) {
        this.setState({
          newDiscountedPriceError: null,
        });
      }
    }
  }

  handleDiscountedPrice(discountedPrice) {
    const numberRegexp = /^[0-9]+$/;

    this.setState({newDiscountedPrice: discountedPrice});

    if (!numberRegexp.test(Number(discountedPrice))) {
      this.setState({
        newDiscountedPriceError: 'Price can only consist of numbers',
      });
    } else if (Number(discountedPrice) >= Number(this.state.newPrice)) {
      this.setState({
        newDiscountedPriceError:
          'Discounted Price must be less than Normal Price',
      });
    } else {
      this.setState({newDiscountedPriceError: null});

      if (
        Number(discountedPrice) <= Number(this.state.newPrice) &&
        this.state.newPriceError ===
          'Normal Price must be more than Discounted Price'
      ) {
        this.setState({newPriceError: null});
      }
    }
  }

  handleTakePhoto() {
    ImagePicker.openCamera({
      width: 400,
      height: 400,
      forceJpg: true,
      mediaType: 'photo',
      cropping: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        this.setState({
          newImagePath: image.path,
          imageDisplay: {uri: image.path},
        });
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  handleSelectImage() {
    ImagePicker.openPicker({
      width: 400,
      height: 400,
      forceJpg: true,
      mediaType: 'photo',
      cropping: true,
      compressImageQuality: 0.85,
    })
      .then((image) => {
        this.setState({
          newImagePath: image.path,
          imageDisplay: {uri: image.path},
        });
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  handleEditItem() {
    const {merchantId, itemCategories} = this.props.detailsStore.storeDetails;
    const {
      newName,
      newDescription,
      newUnit,
      newCategory,
      newPrice,
      newDiscountedPrice,
      newStock,
      newImagePath,
    } = this.state;

    this.setState({loading: true});

    const newItem = {
      name: newName,
      description: newDescription,
      unit: newUnit,
      category: newCategory,
      price: Number(Math.ceil(newPrice)),
      discountedPrice: newDiscountedPrice
        ? Number(Math.ceil(newDiscountedPrice))
        : null,
      image: newImagePath,
    };

    this.props.itemsStore.unsubscribeSetStoreItems &&
      this.props.itemsStore.unsubscribeSetStoreItems();

    this.props.itemsStore
      .editItem(merchantId, newItem, Number(Math.trunc(newStock)))
      .then(() => {
        this.props.itemsStore.setStoreItems(merchantId, itemCategories);

        Toast({
          text: `Item ${this.props.itemsStore.selectedItem.name} successfully edited!`,
          type: 'success',
          duration: 3500,
          style: {margin: 20, borderRadius: 16},
        });

        this.closeModal();

        this.setState({loading: false});
      });
  }

  closeModal() {
    this.props.itemsStore.editItemModal = false;
    this.props.itemsStore.selectedItem = null;

    this.setState({
      loading: false,
      imageLoading: false,
      newImagePath: null,
      imageDisplay: require('../../assets/placeholder.jpg'),
      newName: '',
      newCategory: '',
      newDescription: '',
      newStock: '',
      newUnit: '',
      newPrice: '',
      newDiscountedPrice: '',
      newStockError: null,
      newNameError: null,
      newDescriptionError: null,
      newPriceError: null,
      newDiscountedPriceError: null,
    });
  }

  render() {
    const {
      newStockError,
      imageDisplay,
      newName,
      newCategory,
      newDescription,
      newStock,
      newUnit,
      newPrice,
      newDiscountedPrice,
      newNameError,
      newDescriptionError,
      newPriceError,
      newDiscountedPriceError,
    } = this.state;
    const {isVisible} = this.props;

    return (
      <Overlay
        isVisible={isVisible}
        onBackdropPress={() => {
          this.closeModal();
        }}
        statusBarTranslucent
        fullScreen
        width="auto"
        height="auto"
        overlayStyle={{flex: 1, padding: 0}}>
        <SafeAreaView style={{flex: 1}}>
          <StatusBar
            barStyle={
              Platform.OS === 'android' ? 'light-content' : 'dark-content'
            }
          />

          <ConfirmationModal
            isVisible={this.state.editItemConfirmModal}
            title={`Edit Item "${
              this.props.itemsStore.selectedItem &&
              this.props.itemsStore.selectedItem.name
            }"`}
            body={`Are you sure you want to edit "${
              this.props.itemsStore.selectedItem &&
              this.props.itemsStore.selectedItem.name
            }"? Buyers will immediately see changes.`}
            onConfirm={() => {
              this.setState({editItemConfirmModal: false}, () => {
                this.handleEditItem();
              });
            }}
            closeModal={() => this.setState({editItemConfirmModal: false})}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottomWidth: 2,
              padding: 10,
              borderColor: colors.divider,
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: 'ProductSans-Regular',
              }}>
              Edit{' '}
              {this.props.itemsStore.selectedItem &&
                this.props.itemsStore.selectedItem.name}
            </Text>

            {!this.state.loading && (
              <Button
                type="clear"
                icon={<Icon name="x" color={colors.primary} />}
                titleStyle={{color: colors.primary}}
                containerStyle={{
                  borderRadius: 30,
                }}
                onPress={() => this.closeModal()}
              />
            )}
          </View>

          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            keyboardOpeningTime={20}
            extraScrollHeight={20}
            style={{paddingHorizontal: 15, paddingTop: 15}}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingBottom: 10,
              }}>
              <FastImage
                source={imageDisplay}
                style={{
                  alignSelf: 'flex-start',
                  borderColor: '#BDBDBD',
                  borderRadius: 10,
                  borderWidth: 1,
                  height: 150,
                  width: 150,
                }}
              />

              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  paddingHorizontal: 15,
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
              </View>
            </View>

            <Card style={{borderRadius: 10, overflow: 'hidden'}}>
              <CardItem>
                <Text note style={{textAlign: 'left'}}>
                  Tip: Uploading a photo makes customers more likely to buy your
                  product!
                </Text>
              </CardItem>
            </Card>

            <View style={styles.action}>
              <Item
                style={{
                  paddingHorizontal: 10,
                  flex: 1,
                  borderBottomWidth: 0,
                }}>
                <View style={[styles.icon_container, {flex: 1}]}>
                  <Icon name="folder" color={colors.primary} size={20} />
                </View>
                <Picker
                  note={false}
                  placeholder="Select Item Category"
                  mode="dropdown"
                  selectedValue={newCategory}
                  iosIcon={<Icon name="chevron-down" />}
                  itemTextStyle={{textAlign: 'right'}}
                  onValueChange={this.handleCategory.bind(this)}>
                  {this.categories &&
                    this.categories.map((cat, index) => {
                      return (
                        <Picker.Item key={index} label={cat} value={cat} />
                      );
                    })}
                </Picker>
              </Item>
            </View>

            <Input
              leftIcon={<Icon name="type" color={colors.primary} size={20} />}
              placeholder={`${
                this.props.itemsStore.selectedItem &&
                this.props.itemsStore.selectedItem.name
              }'s New Name`}
              errorMessage={newNameError && newNameError}
              style={styles.textInput}
              autoCapitalize="words"
              value={newName}
              onChangeText={(value) => this.handleName(value)}
            />

            <Input
              leftIcon={
                <Icon name="align-justify" color={colors.primary} size={20} />
              }
              placeholder={`${
                this.props.itemsStore.selectedItem &&
                this.props.itemsStore.selectedItem.name
              }'s New Description`}
              maxLength={150}
              numberOfLines={3}
              multiline
              style={styles.textInput}
              inputStyle={{textAlignVertical: 'top'}}
              autoCapitalize="sentences"
              value={newDescription}
              onChangeText={(value) => this.handleDescription(value)}
            />

            <View style={{flexDirection: 'row'}}>
              <Input
                placeholder={`${
                  this.props.itemsStore.selectedItem &&
                  this.props.itemsStore.selectedItem.name
                }'s New Price`}
                leftIcon={
                  <Text style={{color: colors.primary, fontSize: 25}}>₱</Text>
                }
                errorMessage={newPriceError && newPriceError}
                containerStyle={{flex: 1}}
                maxLength={10}
                keyboardType="numeric"
                style={styles.textInput}
                autoCapitalize="none"
                value={newPrice}
                onChangeText={(value) => this.handlePrice(value)}
              />

              <Text
                style={{
                  fontSize: 34,
                  textAlignVertical: 'center',
                  marginBottom: 15,
                }}>
                /
              </Text>

              <Input
                placeholder={`${
                  this.props.itemsStore.selectedItem &&
                  this.props.itemsStore.selectedItem.name
                }'s New Unit`}
                maxLength={10}
                containerStyle={{flex: 1}}
                style={styles.textInput}
                autoCapitalize="none"
                value={newUnit}
                onChangeText={(value) => this.setState({newUnit: value})}
              />
            </View>

            <Input
              placeholder={`${
                this.props.itemsStore.selectedItem &&
                this.props.itemsStore.selectedItem.name
              }'s New Discounted Price`}
              leftIcon={
                <Text style={{color: colors.primary, fontSize: 25}}>₱</Text>
              }
              errorMessage={newDiscountedPriceError}
              containerStyle={{flex: 1}}
              maxLength={10}
              keyboardType="numeric"
              style={styles.textInput}
              autoCapitalize="none"
              value={newDiscountedPrice}
              onChangeText={(value) => this.handleDiscountedPrice(value)}
            />

            <Input
              placeholder={`Increase/Decrease ${
                this.props.itemsStore.selectedItem &&
                this.props.itemsStore.selectedItem.name
              } Stock (+/- values)`}
              placeholderStyle={{color: colors.primary}}
              leftIcon={<Icon name="hash" color={colors.primary} size={20} />}
              maxLength={10}
              errorMessage={newDescriptionError && newDescriptionError}
              keyboardType="numeric"
              style={styles.textInput}
              autoCapitalize="none"
              value={newStock}
              onChangeText={(value) => this.handleStock(value)}
            />

            <SafeAreaView
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                marginVertical: 30,
              }}>
              {!this.state.loading && (
                <Button
                  title="Cancel"
                  type="clear"
                  containerStyle={{
                    alignSelf: 'flex-end',
                    borderRadius: 30,
                  }}
                  onPress={() => this.closeModal()}
                />
              )}

              <Button
                title="Confirm"
                type="clear"
                disabled={
                  !(
                    !newStockError &&
                    !newNameError &&
                    !newDescriptionError &&
                    !newPriceError &&
                    !newDiscountedPriceError
                  )
                }
                loading={this.state.loading}
                loadingProps={{size: 'small', color: colors.primary}}
                containerStyle={{
                  alignSelf: 'flex-end',
                  borderRadius: 30,
                }}
                onPress={() => this.setState({editItemConfirmModal: true})}
              />
            </SafeAreaView>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </Overlay>
    );
  }
}

export default EditItemModal;
