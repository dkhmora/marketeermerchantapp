import React, {Component} from 'react';
import {Card, CardItem, Body, View} from 'native-base';
import {Image, ActionSheetIOS} from 'react-native';
import {Text} from 'react-native-elements';
import moment, {ISO_8601} from 'moment';
import storage from '@react-native-firebase/storage';
import {inject, observer} from 'mobx-react';
import {observable} from 'mobx';
import {ScrollView} from 'react-native-gesture-handler';
import BaseOptionsMenu from './BaseOptionsMenu';
import {colors} from '../../assets/colors';
import Toast from './Toast';
import FastImage from 'react-native-fast-image';

@inject('itemsStore')
@inject('authStore')
@observer
class ItemCard extends Component {
  constructor(props) {
    super(props);
  }

  @observable url = null;

  getImage = async () => {
    const ref = storage().ref(this.props.item.image);
    const link = await ref.getDownloadURL();
    this.url = link;
  };

  handleDelete() {
    const {merchantId} = this.props.authStore;
    const {deleteStoreItem} = this.props.itemsStore;
    const {item} = this.props;

    deleteStoreItem(merchantId, item).then(() => {
      Toast({text: `${item.name} successfully deleted`});
    });
  }

  openOptions() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Delete'],
        destructiveIndex: 1,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else {
          this.handleDelete();
        }
      },
    );
  }

  componentDidMount() {
    if (this.props.item.image) {
      this.getImage();
    }
  }

  render() {
    const {item, ...otherProps} = this.props;

    const timeStamp = moment(item.createdAt, ISO_8601).fromNow();

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          marginHorizontal: 6,
          marginVertical: 3,
        }}>
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
            <View style={{flexDirection: 'column'}}>
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

            <BaseOptionsMenu
              destructiveIndex={1}
              iconStyle={{color: '#fff', fontSize: 24}}
              options={['Delete Item']}
              actions={[this.handleDelete.bind(this)]}
            />
          </CardItem>

          <CardItem cardBody>
            {this.url ? (
              <FastImage
                source={{uri: this.url}}
                style={{
                  height: 150,
                  aspectRatio: 1,
                  flex: 1,
                  backgroundColor: '#e1e4e8',
                }}
              />
            ) : (
              <FastImage
                source={require('../../assets/placeholder.jpg')}
                style={{
                  height: 150,
                  aspectRatio: 1,
                  flex: 1,
                  backgroundColor: '#e1e4e8',
                }}
              />
            )}
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
              <ScrollView style={{flex: 1}}>
                <Text>
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
              }}>
              <Text
                style={{
                  fontFamily: 'ProductSans-Black',
                  color: colors.icons,
                }}>
                ₱ {item.price}/{item.unit}
              </Text>
            </View>
          </CardItem>

          <CardItem
            footer
            bordered
            style={{bottom: 20, marginBottom: -20, elevation: 5}}>
            <Body>
              <Text style={{color: colors.text_secondary}}>
                Added {timeStamp}
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
