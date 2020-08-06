import React, {Component} from 'react';
import {FlatList, ActivityIndicator} from 'react-native';
import {Container, View, Fab} from 'native-base';
import {observer, inject} from 'mobx-react';
// Custom Components
import ItemCard from './ItemCard';
import {colors} from '../../assets/colors';
import {Text, Icon} from 'react-native-elements';
import Toast from './Toast';

@inject('itemsStore')
@inject('detailsStore')
@observer
class ItemsList extends Component {
  constructor(props) {
    super(props);
  }

  formatData(data, numColumns) {
    const numberOfFullRows = Math.floor(data.length / numColumns);

    let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;
    while (
      numberOfElementsLastRow !== numColumns &&
      numberOfElementsLastRow !== 0
    ) {
      data.push({key: `blank-${numberOfElementsLastRow}`, empty: true});
      numberOfElementsLastRow += 1;
    }

    return data;
  }

  render() {
    const {category} = this.props.route.params;
    const {navigation} = this.props;
    let dataSource = [];

    if (category !== 'All' && this.props.itemsStore.categoryItems.size > 0) {
      dataSource = this.props.itemsStore.categoryItems.get(category)
        ? this.props.itemsStore.categoryItems.get(category).slice()
        : [];
    } else if (this.props.itemsStore.storeItems.length > 0) {
      dataSource = this.props.itemsStore.storeItems.slice();
    }

    const numColumns = 2;

    return (
      <Container style={{flex: 1}}>
        <View style={{paddingHorizontal: 10, flex: 1}}>
          {this.props.itemsStore.loaded ? (
            <FlatList
              data={this.formatData(dataSource, numColumns)}
              numColumns={numColumns}
              contentContainerStyle={{flexGrow: 1}}
              initialNumToRender={4}
              renderItem={({item, index}) =>
                item.empty ? (
                  <View
                    style={{flex: 1, backgroundColor: 'transparent'}}
                    key={index}
                  />
                ) : (
                  <ItemCard item={item} key={`${item.name}${category}`} />
                )
              }
              ListEmptyComponent={
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      textAlign: 'center',
                      paddingHorizontal: 15,
                    }}>
                    You haven't placed added an item to this category yet. Add
                    an item by pressing
                  </Text>
                  <Icon
                    name="plus"
                    size={20}
                    color={colors.icons}
                    containerStyle={{
                      marginTop: 10,
                      borderRadius: 30,
                      padding: 10,
                      backgroundColor: colors.accent,
                    }}
                  />
                </View>
              }
              keyExtractor={(item, index) => `${item.name}${category}`}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View
              style={{
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </View>

        <Fab
          position="bottomRight"
          style={{backgroundColor: colors.accent}}
          onPress={() => {
            if (
              this.props.detailsStore.storeDetails.itemCategories &&
              this.props.detailsStore.storeDetails.itemCategories.length > 0
            ) {
              navigation.navigate('Add Item', {pageCategory: category});
            } else {
              Toast({
                text: 'Please add a category before adding an item.',
                type: 'danger',
                duration: 6000,
              });
            }
          }}>
          <Icon name="plus" color={colors.icons} />
        </Fab>
      </Container>
    );
  }
}

export default ItemsList;
