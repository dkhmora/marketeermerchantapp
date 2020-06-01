import React, {Component} from 'react';
import {FlatList} from 'react-native';
import BaseListItem from '../components/BaseListItem';
import {observer, inject} from 'mobx-react';

@inject('authStore')
@inject('orderStore')
@observer
class BaseFlatList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('props', this.props);
    this.props.orderStore[`${this.props.route.params.storeFunctionName}`](
      this.props.authStore.merchantId,
    );
  }

  render() {
    const {storeVarName, leftTextKey, middleTextKey} = this.props.route.params;
    const dataSource = this.props.orderStore[`${storeVarName}`].slice();

    console.log('data shit', dataSource);

    return (
      <FlatList
        data={dataSource}
        renderItem={({item, index}) => (
          <BaseListItem
            leftText={`${item[`${leftTextKey}`]}`}
            middleText={`${item[`${middleTextKey}`]}`}
            key={index}
          />
        )}
        keyExtractor={(item) => item.orderId}
      />
    );
  }
}

export default BaseFlatList;
