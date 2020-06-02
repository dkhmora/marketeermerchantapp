import React from 'react';
import {StyleSheet} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import AnimatedLoader from 'react-native-animated-loader';
// Custom Components
import StoreItemsTab from '../navigation/StoreItemsTab';
import AddItemScreen from './AddItemScreen';

// Firebase
import {getStoreItems, getStoreDetails} from '../../firebase/store';

const StackOrder = createStackNavigator();

export const StoreItemsScreen = ({navigation, route}) => {
  const {merchantId} = route.params;

  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState(null);

  if (loading) {
    getStoreDetails(merchantId, {setCategories}).then(() => {
      getStoreItems(merchantId, {setItems, setLoading});
    });
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
    <StackOrder.Navigator initialRouteName="Store Items" headerMode="none">
      <StackOrder.Screen
        name="Store Items"
        component={StoreItemsTab}
        initialParams={{
          categories,
          items,
          leftTextKey: 'name',
          middleTextKey: 'description',
          fabButton: true,
        }}
      />
      <StackOrder.Screen
        name="Add Item"
        component={AddItemScreen}
        initialParams={{merchantId, categories}}
      />
    </StackOrder.Navigator>
  );
};

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
});
