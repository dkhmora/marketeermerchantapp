import React, {Component} from 'react';
import {
  FlatList,
  ActivityIndicator,
  TouchableHighlightBase,
} from 'react-native';
import {Container, View, Fab, Icon, Button} from 'native-base';
import {observer, inject} from 'mobx-react';
// Custom Components
import ItemCard from './ItemCard';
import {colors} from '../../assets/colors';

@inject('itemsStore')
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
      dataSource = this.props.itemsStore.categoryItems.get(category).slice();
    } else if (this.props.itemsStore.storeItems.length > 0) {
      dataSource = this.props.itemsStore.storeItems.slice();
    }

    const numColumns = 2;

    return (
      <Container style={{flex: 1}}>
        <View style={{paddingHorizontal: 10, flex: 1}}>
          {dataSource.length > 0 &&
          this.props.itemsStore.categoryItems.size > 0 ? (
            <FlatList
              data={this.formatData(dataSource, numColumns)}
              numColumns={numColumns}
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
          containerStyle={{}}
          position="bottomRight"
          style={{backgroundColor: colors.accent}}
          onPress={() =>
            navigation.navigate('Add Item', {pageCategory: category})
          }>
          <Icon name="add" />
        </Fab>
      </Container>
    );
  }
}

export default ItemsList;
