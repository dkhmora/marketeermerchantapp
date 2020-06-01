import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {Container, List, Grid, Row, Col, Content} from 'native-base';
// Custom Components
import BaseListItem from '../components/BaseListItem';
import BaseHeader from '../components/BaseHeader';
// Mobx
import {inject, observer} from 'mobx-react';

@inject('detailsStore')
@inject('authStore')
@observer
class StoreDetailsScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.detailsStore.setStoreDetails(this.props.authStore.merchantId);
  }

  render() {
    return (
      <Container style={{flex: 1}}>
        <BaseHeader
          title={this.props.route.name}
          optionsButton
          navigation={this.props.navigation}
        />

        <Content>
          <List style={{flex: 1}}>
            {Object.keys(this.props.detailsStore.storeDetails).map(
              (item, index) => {
                return (
                  <BaseListItem
                    leftText={`${_.startCase(item)}:`}
                    middleText={this.props.detailsStore.storeDetails[item]}
                    index={index}
                    key={index}
                  />
                );
              },
            )}
          </List>
        </Content>
      </Container>
    );
  }
}

export default StoreDetailsScreen;
