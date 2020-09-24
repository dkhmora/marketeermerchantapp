import React, {PureComponent} from 'react';
import {Card, CardItem, Body} from 'native-base';
import {View, ActivityIndicator} from 'react-native';
import {Text} from 'react-native-elements';
import moment from 'moment';
import storage from '@react-native-firebase/storage';
import {inject, observer} from 'mobx-react';
import {computed} from 'mobx';
import {ScrollView} from 'react-native-gesture-handler';
import BaseOptionsMenu from './BaseOptionsMenu';
import {colors} from '../../assets/colors';
import Toast from './Toast';
import FastImage from 'react-native-fast-image';
import ConfirmationModal from './ConfirmationModal';

@inject('itemsStore')
@inject('authStore')
@inject('detailsStore')
@observer
class ItemCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      url: require('../../assets/placeholder.jpg'),
      loaded: false,
      deleting: false,
      deleteItemConfirmModal: false,
    };
  }

  @computed get timeStamp() {
    return moment(this.props.item.updatedAt, 'x').fromNow();
  }

  getImage = async () => {
    const ref = storage().ref(this.props.item.image);
    const link = await ref.getDownloadURL().catch((err) => {
      Toast({text: err.message, type: 'danger'});
      return null;
    });

    if (link) {
      this.setState({url: {uri: link}});
    }

    this.setState({loaded: true});
  };

  handleDelete() {
    const {storeId} = this.props.detailsStore.storeDetails;
    const {item} = this.props;

    this.props.itemsStore.deleteStoreItem(storeId, item).then(() => {
      Toast({text: `${item.name} successfully deleted`});
    });
  }

  handleEditItem() {
    this.props.itemsStore.selectedItem = this.props.item;

    this.props.itemsStore.editItemModal = true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.item !== this.props.item) {
      this.setState({loaded: false});
    }

    if (!this.state.loaded && this.props.item.image) {
      this.getImage();
    }
  }

  componentDidMount() {
    const {url} = this.state;

    if (
      url === require('../../assets/placeholder.jpg') &&
      this.props.item.image
    ) {
      this.getImage();
    }
  }

  render() {
    const {item, ...otherProps} = this.props;
    const {url} = this.state;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          marginHorizontal: 6,
          marginVertical: 3,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
        }}>
        <ConfirmationModal
          isVisible={this.state.deleteItemConfirmModal}
          title={`Delete Item "${item.name}"?`}
          body={`Are you sure you want to delete "${item.name}"? Shoppers will immediately see changes.`}
          onConfirm={() => {
            this.setState(
              {deleteItemConfirmModal: false, deleting: true},
              () => {
                this.handleDelete();
              },
            );
          }}
          closeModal={() => this.setState({deleteItemConfirmModal: false})}
        />

        <Card
          {...otherProps}
          style={{
            borderRadius: 10,
            overflow: 'hidden',
          }}>
          <CardItem
            header
            bordered
            style={{
              backgroundColor: colors.primary,
              justifyContent: 'space-between',
            }}>
            <View style={{flexDirection: 'column', flex: 1}}>
              <Text
                style={{
                  color: colors.icons,
                  fontFamily: 'ProductSans-Regular',
                }}>
                {item.name}
              </Text>

              <Text
                note
                style={{fontFamily: 'ProductSans-Black', color: colors.icons}}>
                Stock: {item.stock}
              </Text>

              <Text style={{color: '#ddd'}}>{item.sales} Sold</Text>
            </View>

            {this.state.deleting ? (
              <ActivityIndicator size="small" color={colors.icons} />
            ) : (
              <BaseOptionsMenu
                destructiveIndex={1}
                iconStyle={{color: '#fff', fontSize: 24}}
                options={['Edit Item', 'Delete Item']}
                actions={[
                  this.handleEditItem.bind(this),
                  () => this.setState({deleteItemConfirmModal: true}),
                ]}
              />
            )}
          </CardItem>

          <CardItem cardBody>
            <FastImage
              source={url}
              style={{
                height: 150,
                aspectRatio: 1,
                flex: 1,
              }}
            />
          </CardItem>

          <CardItem
            bordered
            style={{
              position: 'relative',
              elevation: 5,
            }}>
            <Body
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                height: 100,
                flexGrow: 1,
                flexShrink: 1,
              }}>
              <ScrollView>
                <Text style={{paddingBottom: 10}}>
                  {item.description ? item.description : 'No description'}
                </Text>
              </ScrollView>
            </Body>
          </CardItem>

          <CardItem
            bordered
            style={{
              bottom: 20,
              elevation: 5,
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <View
              style={{
                borderRadius: 10,
                padding: 8,
                backgroundColor: colors.primary,
                elevation: 3,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {item.discountedPrice && (
                <Text
                  style={{
                    textDecorationLine: 'line-through',
                    textDecorationStyle: 'solid',
                    color: colors.icons,
                    marginRight: 5,
                  }}>
                  ₱ {item.price}
                </Text>
              )}

              <Text
                style={{
                  fontFamily: 'ProductSans-Black',
                  color: colors.icons,
                }}>
                ₱ {item.discountedPrice ? item.discountedPrice : item.price}
                {item.unit ? `/${item.unit}` : ''}
              </Text>
            </View>
          </CardItem>

          <CardItem
            footer
            bordered
            style={{bottom: 20, marginBottom: -20, elevation: 5}}>
            <Body>
              <Text style={{color: colors.text_secondary}}>
                Updated {this.timeStamp}
              </Text>
            </Body>
          </CardItem>
        </Card>
      </View>
    );
  }
}

ItemCard.defaultProps = {
  editable: false,
};

export default ItemCard;
