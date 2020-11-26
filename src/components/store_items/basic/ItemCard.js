import React, {PureComponent} from 'react';
import {Card, CardItem, Body} from 'native-base';
import {View, ActivityIndicator} from 'react-native';
import {Text} from 'react-native-elements';
import moment from 'moment';
import {inject, observer} from 'mobx-react';
import {computed} from 'mobx';
import {ScrollView} from 'react-native-gesture-handler';
import BaseOptionsMenu from '../../BaseOptionsMenu';
import {colors} from '../../../../assets/colors';
import Toast from '../../Toast';
import FastImage from 'react-native-fast-image';
import ConfirmationModal from '../../ConfirmationModal';
import {Fade, Placeholder, PlaceholderMedia} from 'rn-placeholder';

@inject('itemsStore')
@inject('authStore')
@inject('detailsStore')
@observer
class ItemCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      url: require('../../../../assets/placeholder.jpg'),
      imageReady: false,
      imageWidth: null,
      deleting: false,
      deleteItemConfirmModal: false,
    };
  }

  @computed get timeStamp() {
    return moment(this.props.item.updatedAt, 'x').fromNow();
  }

  getImage = async () => {
    if (this.props.item.image) {
      this.setState({imageReady: false}, () => {
        this.setState({
          url: {uri: `https://cdn.marketeer.ph${this.props.item.image}`},
        });
      });
    }
  };

  handleDelete() {
    const {storeId} = this.props.detailsStore.storeDetails;
    const {item} = this.props;

    this.props.itemsStore.deleteStoreItem(storeId, item).then(() => {
      Toast({text: `${item.name} successfully deleted`});
    });
  }

  handleEditItem() {
    this.props.navigation.navigate('Edit Item', {item: this.props.item});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.item.image !== this.props.item.image) {
      this.getImage();
    }
  }

  componentDidMount() {
    if (this.props.item.image) {
      this.getImage();
    }
  }

  render() {
    const {
      item: {name, description, price, discountedPrice, sales, stock, unit},
      ...otherProps
    } = this.props;
    const {url, imageReady, imageWidth} = this.state;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          marginHorizontal: 3,
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
          title={`Delete Item "${name}"?`}
          body={`Are you sure you want to delete "${name}"? Shoppers will immediately see changes.`}
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
              backgroundColor: colors.icons,
              justifyContent: 'space-between',
              minHeight: 60,
              paddingLeft: 10,
              paddingRight: 5,
              paddingTop: 5,
              paddingBottom: 5,
            }}>
            <View style={{flex: 1}}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.primary,
                  fontFamily: 'ProductSans-Bold',
                  fontSize: 16,
                }}>
                {name}
              </Text>

              <Text
                style={{
                  color: colors.text_secondary,
                  fontFamily: 'ProductSans-Light',
                  fontSize: 12,
                }}>
                {sales}
                {stock ? ` of ${stock}` : ''} sold
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                {discountedPrice ? (
                  <Text
                    maxFontSizeMultiplier={1}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={{
                      textDecorationLine: 'line-through',
                      textDecorationStyle: 'solid',
                      color: colors.text_secondary,
                      fontFamily: 'ProductSans-Light',
                      textAlignVertical: 'bottom',
                      marginRight: 5,
                    }}>
                    ₱{price}
                  </Text>
                ) : null}

                <Text
                  maxFontSizeMultiplier={1}
                  numberOfLines={1}
                  style={{
                    color: colors.text_primary,
                    fontFamily: 'ProductSans-Bold',
                    flexWrap: 'wrap',
                  }}>
                  ₱{discountedPrice ? discountedPrice : price}
                  {unit && `/${unit}`}
                </Text>
              </View>
            </View>

            {this.state.deleting ? (
              <ActivityIndicator size="small" color={colors.icons} />
            ) : (
              <BaseOptionsMenu
                destructiveIndex={1}
                iconColor={colors.primary}
                iconStyle={{fontSize: 24}}
                options={['Edit Item', 'Delete Item']}
                actions={[
                  this.handleEditItem.bind(this),
                  () => this.setState({deleteItemConfirmModal: true}),
                ]}
              />
            )}
          </CardItem>

          <View
            style={{flex: 1}}
            onLayout={(event) => {
              const {width} = event.nativeEvent.layout;
              this.setState({imageWidth: width});
            }}>
            <FastImage
              source={url}
              style={{
                aspectRatio: 1,
                flex: 1,
              }}
              onLoad={() => this.setState({imageReady: true})}
            />

            {!imageReady && (
              <View
                style={{
                  position: 'absolute',
                }}>
                <Placeholder Animation={Fade}>
                  <PlaceholderMedia
                    style={{
                      borderRadius: 0,
                      backgroundColor: colors.primary,
                      aspectRatio: 1,
                      width: imageWidth ? imageWidth : 0,
                      height: imageWidth ? imageWidth : 0,
                    }}
                  />
                </Placeholder>
              </View>
            )}
          </View>

          <CardItem
            bordered
            style={{
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 0,
              height: 100,
              alignItems: 'flex-start',
            }}>
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}>
              {description ? (
                <Text>{description ? description : 'No description'}</Text>
              ) : (
                <Text
                  style={{
                    fontFamily: 'ProductSans-Light',
                    colors: colors.text_secondary,
                    textAlignVertical: 'top',
                  }}>
                  No description
                </Text>
              )}
            </ScrollView>
          </CardItem>

          <CardItem
            footer
            bordered
            style={{
              elevation: 5,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 5,
              paddingBottom: 5,
            }}>
            <Body>
              <Text
                style={{
                  color: colors.text_secondary,
                  fontFamily: 'ProductSans-Light',
                }}>
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
