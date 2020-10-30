import React, {PureComponent} from 'react';
import {Card, CardItem, Body} from 'native-base';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {ListItem, Text} from 'react-native-elements';
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
import Divider from '../../Divider';

@inject('itemsStore')
@inject('authStore')
@inject('detailsStore')
@observer
class FoodItemCard extends PureComponent {
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

  Subtitle(props) {
    const {description, options} = props;

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
        <Text style={{color: colors.text_secondary}}>{description}</Text>

        <View style={{flexDirection: 'row'}}>
          <Text style={{fontSize: 12}}>Options: </Text>
          {options ? (
            <Text style={{color: colors.accent, fontSize: 12}}>{options}</Text>
          ) : (
            <Text style={{color: colors.danger, fontSize: 12}}>No Options</Text>
          )}
        </View>
      </View>
    );
  }

  RightElement(props) {
    const {source, optionsLoading, onPressEditItem, onPressDeleteItem} = props;

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <FastImage
          source={source}
          style={{
            width: 75,
            height: 75,
            borderRadius: 10,
            elevation: 3,
            marginHorizontal: 5,
          }}
          resizeMode={FastImage.resizeMode.contain}
        />

        {optionsLoading ? (
          <ActivityIndicator size="small" color={colors.icons} />
        ) : (
          <BaseOptionsMenu
            destructiveIndex={1}
            iconStyle={{fontSize: 24}}
            iconColor={colors.primary}
            options={['Edit Item', 'Delete Item']}
            actions={[() => onPressEditItem(), () => onPressDeleteItem()]}
          />
        )}
      </View>
    );
  }

  render() {
    const {item, ...otherProps} = this.props;
    const {url, imageReady, imageWidth, deleting} = this.state;
    const {Subtitle, RightElement} = this;
    const options =
      item.options && Object.keys(item.options).length > 0
        ? Object.keys(item.options).join(' | ')
        : null;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
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

        <ListItem
          title={item.name}
          titleStyle={{fontSize: 18, fontFamily: 'ProductSans-Regular'}}
          subtitle={
            <Subtitle description={item.description} options={options} />
          }
          rightElement={
            <RightElement
              source={url}
              optionsLoading={deleting}
              onPressEditItem={() => this.handleEditItem()}
              onPressDeleteItem={() =>
                this.setState({deleteItemConfirmModal: true})
              }
            />
          }
          style={{paddingTop: 1, paddingBottom: 1}}
          containerStyle={{
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 5,
            paddingRight: 5,
          }}
        />

        <Divider />
      </View>
    );
  }
}

FoodItemCard.defaultProps = {
  editable: false,
};

export default FoodItemCard;
