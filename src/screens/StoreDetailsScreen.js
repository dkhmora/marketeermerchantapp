import React from 'react';
import {StyleSheet} from 'react-native';
import {Text, Container, List, Button, Grid, Row, Col} from 'native-base';
import BaseListItem from '../components/BaseListItem';
import BaseHeader from '../components/BaseHeader';
import {signOut} from '../../firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AnimatedLoader from 'react-native-animated-loader';
export const StoreDetailsScreen = ({navigation, route}) => {
  const {merchantId} = route.params;
  const [loading, setLoading] = React.useState(true);
  const [storeDetails, setStoreDetails] = React.useState(null);

  console.log(merchantId);

  /*
  let items = null;

  firestore()
    .collection('merchants')
    .doc(merchantId)
    .collection('items')
    .get()
    .then((querySnapshot) => {
      const data = [];
      console.log('Total users: ', querySnapshot.size);

      querySnapshot.forEach((documentSnapshot) => {
        data.push(documentSnapshot.data());
      });
      return data;
    })
    .then((data) => (items = data))
    .then(() => console.log(items))
    .catch((err) => {
      console.error(err);
    });
  */

  firestore()
    .collection('merchants')
    .doc(merchantId)
    .get()
    .then((doc) => {
      return doc.data();
    })
    .then((data) => setStoreDetails(data))
    .then(() => {
      setLoading(false);
      console.log(storeDetails);
    })
    .catch((err) => {
      console.error(err);
    });

  const [editable, setEditable] = React.useState(false);

  const StoreDetailsList = () => {
    if (storeDetails) {
      const listItem = Object.keys(storeDetails).map((item, index) => {
        return (
          <BaseListItem
            onPress={() => setEditable(!editable)}
            editable={editable}
            leftText={`${_.startCase(item)}:`}
            middleText={storeDetails[item]}
            key={index}
          />
        );
      });
      return listItem;
    }
  };

  if (loading || !storeDetails) {
    return (
      <AnimatedLoader
        visible={true}
        overlayColor="rgba(255,255,255,0.75)"
        source={require('../../assets/loader.json')}
        animationStyle={styles.lottie}
        speed={1}
      />
    );
  }

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
              <Text>Sign out</Text>
            </Button>
          </Row>
        </Col>
      </Grid>
    </Container>
  );
};

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
});
