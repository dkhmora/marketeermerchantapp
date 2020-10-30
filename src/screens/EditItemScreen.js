import React, {Component} from 'react';
import {
  Overlay,
  Text,
  Button,
  Icon,
  Input,
  ButtonGroup,
} from 'react-native-elements';
import {
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  StyleSheet,
} from 'react-native';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import {inject, observer} from 'mobx-react';
import Toast from '../components/Toast';
import {computed} from 'mobx';
import ImagePicker from 'react-native-image-crop-picker';
import {Card, CardItem, Picker, Item} from 'native-base';
import FastImage from 'react-native-fast-image';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ConfirmationModal from '../components/ConfirmationModal';
import {Fade, Placeholder, PlaceholderMedia} from 'rn-placeholder';
import Divider from '../components/Divider';
import CustomizationOptionsCard from '../components/store_items/food/CustomizationOptionsCard';
import AddOptionBottomSheet from '../components/store_items/food/AddOptionBottomSheet';
import BaseHeader from '../components/BaseHeader';

@inject('detailsStore')
@inject('itemsStore')
@observer
class EditItemScreen extends Component {
  constructor(props) {
    super(props);

    const {item} = this.props.route.params;
    const {image} = item;

    this.state = {
      loading: false,
      newImagePath: null,
      imageReady: false,
      imageDisplay: image
        ? {uri: `https://cdn.marketeer.ph${image}`}
        : require('../../assets/placeholder.jpg'),
      editItemConfirmModal: false,
      paddingHeight: 0,
      newItem: item,
      newStock: null,
      selectedStockNumberSignIndex: 1,
    };
  }

  @computed get categories() {
    return this.props.detailsStore.storeDetails.itemCategories;
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
    const {storeId, itemCategories} = this.props.detailsStore.storeDetails;
    const {newItem} = this.state;
    const {name} = newItem;

    this.setState({loading: true}, () => {
      this.props.itemsStore.editItem(storeId, newItem).then(() => {
        this.setState({loading: false}, () =>
          Toast({
            text: `Item ${name} successfully edited!`,
            type: 'success',
            duration: 3500,
            style: {margin: 20, borderRadius: 16},
          }),
        );
      });
    });
  }

  render() {
    const {
      imageDisplay,
      imageReady,
      paddingHeight,
      newItem,
      loading,
      editItemConfirmModal,
      selectedStockNumberSignIndex,
      newStock,
    } = this.state;
    const {item} = this.props.route.params;
    const {navigation} = this.props;
    const {name} = item;
    const {
      category,
      description,
      price,
      discountedPrice,
      unit,
      options,
      stock,
    } = newItem;
    const {storeType} = this.props.detailsStore.storeDetails;

    return (
      <SafeAreaView style={{flex: 1}}>
        <StatusBar
          barStyle={
            Platform.OS === 'android' ? 'light-content' : 'dark-content'
          }
        />

        <BaseHeader
          title={`Edit ${name}`}
          rightComponent={
            !loading && (
              <Button
                type="clear"
                icon={<Icon name="x" color={colors.icons} />}
                titleStyle={{color: colors.icons}}
                containerStyle={{
                  borderRadius: 30,
                }}
                onPress={() => navigation.goBack()}
              />
            )
          }
        />

        <ConfirmationModal
          isVisible={editItemConfirmModal}
          title={`Edit Item "${name}"`}
          body={`Are you sure you want to edit "${name}"? Buyers will immediately see changes.`}
          onConfirm={() => {
            this.setState({editItemConfirmModal: false}, () => {
              this.handleEditItem();
            });
          }}
          closeModal={() => this.setState({editItemConfirmModal: false})}
        />

        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          keyboardOpeningTime={20}
          extraScrollHeight={20}
          contentContainerStyle={{
            paddingBottom: paddingHeight + 20,
          }}
          style={{
            paddingHorizontal: 15,
            paddingTop: 15,
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: 10,
            }}>
            <View style={{flex: 1, height: 150}}>
              {imageDisplay && (
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
                  onLoad={() => this.setState({imageReady: true})}
                />
              )}

              {!imageReady && (
                <View style={{position: 'absolute'}}>
                  <Placeholder Animation={Fade}>
                    <PlaceholderMedia
                      style={{
                        alignSelf: 'flex-start',
                        backgroundColor: colors.primary,
                        borderColor: '#BDBDBD',
                        borderRadius: 10,
                        borderWidth: 1,
                        height: 150,
                        width: 150,
                      }}
                    />
                  </Placeholder>
                </View>
              )}
            </View>

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

              <Text style={{textAlign: 'center', marginVertical: 12}}>or</Text>

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
                selectedValue={category}
                iosIcon={<Icon name="chevron-down" />}
                itemTextStyle={{textAlign: 'right'}}
                onValueChange={(value) =>
                  this.setState({['newItem.category']: value})
                }>
                {this.categories &&
                  this.categories.map((cat, index) => {
                    return <Picker.Item key={index} label={cat} value={cat} />;
                  })}
              </Picker>
            </Item>
          </View>

          <Input
            leftIcon={<Icon name="type" color={colors.primary} size={20} />}
            placeholder={`${name}'s Name`}
            style={styles.textInput}
            autoCapitalize="words"
            value={newItem.name}
            onChangeText={(value) => this.setState({['newItem.name']: value})}
          />

          <Input
            leftIcon={
              <Icon name="align-justify" color={colors.primary} size={20} />
            }
            placeholder={`${name}'s Description`}
            maxLength={150}
            numberOfLines={3}
            multiline
            style={styles.textInput}
            inputStyle={{textAlignVertical: 'top'}}
            autoCapitalize="sentences"
            value={description}
            onChangeText={(value) =>
              this.setState({['newItem.description']: value})
            }
          />

          <Input
            placeholder={`${name}'s Price`}
            leftIcon={
              <Text style={{color: colors.primary, fontSize: 25}}>₱</Text>
            }
            containerStyle={{flex: 1}}
            maxLength={10}
            keyboardType="numeric"
            style={styles.textInput}
            autoCapitalize="none"
            value={String(price)}
            onChangeText={(value) =>
              this.setState({['newItem.price']: Number(value)})
            }
          />

          <Input
            placeholder={`${name}'s Discounted Price`}
            leftIcon={
              <Text style={{color: colors.primary, fontSize: 25}}>₱</Text>
            }
            containerStyle={{flex: 1}}
            maxLength={10}
            keyboardType="numeric"
            style={styles.textInput}
            autoCapitalize="none"
            value={discountedPrice ? String(discountedPrice) : ''}
            onChangeText={(value) =>
              this.setState({
                ['newItem.discountedPrice']: Number(value),
              })
            }
          />

          {storeType === 'basic' && (
            <View
              style={{
                flexDirection: 'row',
              }}>
              <ButtonGroup
                onPress={(index) =>
                  this.setState({selectedStockNumberSignIndex: index})
                }
                selectedIndex={selectedStockNumberSignIndex}
                buttons={['-', '+']}
                activeOpacity={0.7}
                containerStyle={{
                  height: 40,
                  width: 80,
                  borderRadius: 8,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                  borderWidth: 0.7,
                  borderColor: 'rgba(0,0,0,0.4)',
                }}
                selectedButtonStyle={{backgroundColor: colors.primary}}
              />

              <Input
                placeholder={`${
                  selectedStockNumberSignIndex === 0 ? 'Decrease' : 'Increase'
                } ${name} Stock`}
                placeholderStyle={{color: colors.primary}}
                leftIcon={<Icon name="hash" color={colors.primary} size={20} />}
                maxLength={10}
                keyboardType="numeric"
                style={styles.textInput}
                containerStyle={{flex: 1}}
                autoCapitalize="none"
                value={newStock ? String(newStock) : ''}
                onChangeText={(value) =>
                  this.setState({newStock: Number(value)})
                }
              />
            </View>
          )}

          <Divider />

          {storeType === 'food' && (
            <View>
              <View
                style={{
                  flex: 1,
                  paddingVertical: 10,
                }}>
                <Text style={{fontSize: 24}}>Customization</Text>

                {options &&
                  Object.entries(options).map(
                    ([optionTitle, optionData], index) => {
                      const {multipleSelection, selection} = optionData;

                      return (
                        <CustomizationOptionsCard
                          key={optionTitle}
                          title={optionTitle}
                          multipleSelection={multipleSelection}
                          options={selection}
                        />
                      );
                    },
                  )}
              </View>

              <Divider />

              <Button
                type="clear"
                title="Add Option"
                containerStyle={{marginVertical: 5}}
                icon={<Icon name="plus" color={colors.primary} size={20} />}
                onPress={() => this.addOptionBottomSheet.bottomSheet.snapTo(1)}
              />
            </View>
          )}
        </KeyboardAwareScrollView>

        <View
          style={{
            width: '100%',
            backgroundColor: colors.icons,
            elevation: 20,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderLeftWidth: StyleSheet.hairlineWidth,
            borderRightWidth: StyleSheet.hairlineWidth,
            borderColor: 'rgba(0,0,0,0.3)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingVertical: 10,
            position: 'absolute',
            bottom: 0,
            left: 0,
          }}
          onLayout={(event) =>
            this.setState({paddingHeight: event.nativeEvent.layout.height})
          }>
          <SafeAreaView style={{flexDirection: 'row'}}>
            {!loading && (
              <Button
                title="Cancel"
                type="outline"
                buttonStyle={{
                  height: 50,
                  borderRadius: 30,
                  borderWidth: 1,
                  borderColor: colors.danger,
                }}
                titleStyle={{color: colors.danger}}
                containerStyle={{
                  flex: 1,
                  marginLeft: 10,
                  marginRight: 5,
                }}
                onPress={() => this.closeModal()}
              />
            )}

            <Button
              title="Save"
              type="outline"
              disabled={loading}
              loading={loading}
              loadingProps={{size: 'small', color: colors.primary}}
              buttonStyle={{
                height: 50,
                borderRadius: 30,
                borderWidth: 1,
                borderColor: colors.accent,
              }}
              titleStyle={{color: colors.accent}}
              containerStyle={{
                flex: 1,
                marginLeft: 10,
                marginRight: 5,
              }}
              onPress={() => this.setState({editItemConfirmModal: true})}
            />
          </SafeAreaView>
        </View>

        <AddOptionBottomSheet
          ref={(sheetRef) => (this.addOptionBottomSheet = sheetRef)}
          onConfirm={() => console.log('confirm')}
        />
      </SafeAreaView>
    );
  }
}

export default EditItemScreen;
