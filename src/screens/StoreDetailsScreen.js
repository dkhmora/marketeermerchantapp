import React from 'react';
import {Text, Container, List, Button, Grid, Row, Col} from 'native-base';
import BaseListItem from '../components/BaseListItem';
import BaseHeader from '../components/BaseHeader';
import {signOut} from '../../firebase/auth';

export const StoreDetailsScreen = ({navigation}) => {
  const TestData = {
    storeName: 'Test Store',
    storeDescription: 'Test Description',
    deliveryDescription: 'Test Delivery Descriptionasdadadasss asdasda asdasda',
  };

  const [editable, setEditable] = React.useState(false);

  const StoreDetailsList = () => {
    const listItem = Object.keys(TestData).map((item, index) => {
      return (
        <BaseListItem
          onPress={() => setEditable(!editable)}
          editable={editable}
          leftText={`${_.startCase(item)}:`}
          middleText={TestData[item]}
          key={index}
        />
      );
    });
    return listItem;
  };

  return (
    <Container style={{flex: 1}}>
      <BaseHeader title="Store Details" optionsButton navigation={navigation} />

      <Grid>
        <Col>
          <Row style={{backgroundColor: '#eee'}}>
            <List style={{flex: 1}} listBorderColor="red">
              <StoreDetailsList />
            </List>
          </Row>
          <Row size={1}>
            <Button rounded style={{flex: 1}} onPress={() => signOut()}>
              <Text>Testing</Text>
            </Button>
          </Row>
        </Col>
      </Grid>
    </Container>
  );
};
