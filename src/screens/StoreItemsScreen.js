import React from 'react';
import {StyleSheet} from 'react-native';
import {Container} from 'native-base';
import {createStackNavigator} from '@react-navigation/stack';
import AnimatedLoader from 'react-native-animated-loader';
// Custom Components
import BaseHeader from '../components/BaseHeader';
import BaseTab from '../navigation/BaseTab';
// Firebase
import {getStoreItems, getStoreDetails} from '../../firebase/store';

const StackOrder = createStackNavigator();

export const StoreItemsScreen = ({navigation, route}) => {
  const {merchantId} = route.params;

  const [categories, setCategories] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState(null);

  const leftTextKey = 'name';
  const middleTextKey = 'description';

  if (loading) {
    getStoreDetails(merchantId, {setCategories});
    getStoreItems(merchantId, {setItems, setLoading});
    return (
      <AnimatedLoader
        visible={loading}
        overlayColor="rgba(255,255,255,0)"
        source={require('../../assets/loader.json')}
        animationStyle={styles.lottie}
        speed={1}
      />
    );
  }

  return (
    <Container>
      <BaseHeader title="Store Items" optionsButton navigation={navigation} />

      <StackOrder.Navigator initialRouteName="Item Tab" headerMode="none">
        <StackOrder.Screen
          name="Item Tab"
          component={BaseTab}
          initialParams={{categories, items, leftTextKey, middleTextKey}}
        />
      </StackOrder.Navigator>
    </Container>
  );
};

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
});
