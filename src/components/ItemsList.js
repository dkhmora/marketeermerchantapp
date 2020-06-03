import React, {Component} from 'react';
import {FlatList} from 'react-native';
import {Container, View} from 'native-base';
import {observer, inject} from 'mobx-react';
// Custom Components
import ItemCard from './ItemCard';

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
    const dataSource = this.props.itemsStore.categoryItems
      .get(category)
      .slice();
    const numColumns = 2;

    return (
      <Container style={{flex: 1}}>
        <View style={{paddingHorizontal: 10}}>
          <FlatList
            data={this.formatData(dataSource, numColumns)}
            numColumns={2}
            renderItem={({item, index}) =>
              item.empty ? (
                <View style={{flex: 1, backgroundColor: 'transparent'}} />
              ) : (
                <ItemCard
                  name={`${item.name}`}
                  image={`${item.image}`}
                  description={`${item.description}`}
                  price={`${item.price}`}
                  stock={`${item.stock}`}
                  sales={`${item.sales}`}
                  unit={`${item.unit}`}
                  createdAt={`${item.createdAt}`}
                  key={index}
                />
              )
            }
            keyExtractor={(item) => item.name}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Container>
    );
  }
}

export default ItemsList;
