import React, {Component} from 'react';
import {FlatList} from 'react-native';
import BaseListItem from '../components/BaseListItem';
import {observer, inject} from 'mobx-react';
import OrderCard from './OrderCard';
import {Container, Content} from 'native-base';

@inject('authStore')
@inject('orderStore')
@observer
class BaseFlatList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.orderStore[`${this.props.route.params.storeFunctionName}`](
      this.props.authStore.merchantId,
    );
  }

  render() {
    const {storeVarName, leftTextKey, middleTextKey} = this.props.route.params;
    const dataSource = this.props.orderStore[`${storeVarName}`].slice();

    console.log('data shit', dataSource.user);

    return (
      <Container style={{flex: 1}}>
        <Content padder>
          <FlatList
            data={dataSource}
            renderItem={({item, index}) => (
              <OrderCard
                orderNumber={`${item.orderNumber}`}
                userName={`${item.userName}`}
                numberOfItems={`${item.numberOfItems}`}
                totalAmount={`${item.totalAmount}`}
                orderId={`${item.orderId}`}
                userAddress={`${item.userAddress}`}
                createdAt={`${item.createdAt}`}
                key={index}
              />
            )}
            keyExtractor={(item) => item.orderId}
          />
        </Content>
      </Container>
    );
  }
}

export default BaseFlatList;
