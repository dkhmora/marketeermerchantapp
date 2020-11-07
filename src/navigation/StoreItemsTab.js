import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ItemsList from '../components/ItemsList';
import {observer, inject} from 'mobx-react';
import {computed} from 'mobx';
import {colors} from '../../assets/colors';
import {Dimensions, View} from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

const TabBase = createMaterialTopTabNavigator();

const SCREEN_WIDTH = Dimensions.get('screen').width;
@inject('itemsStore')
@inject('authStore')
@inject('detailsStore')
@observer
class StoreItemsTab extends Component {
  constructor(props) {
    super(props);
  }

  @computed get tabWidth() {
    const {tabs} = this.props;

    if (tabs) {
      return tabs.length > 2 ? 'auto' : SCREEN_WIDTH / (tabs.length + 1);
    }
    return 'auto';
  }

  componentDidMount() {
    crashlytics().log('StoreItemsTab');
  }

  render() {
    const {tabs} = this.props;

    return (
      <View style={{flex: 1}}>
        <TabBase.Navigator
          lazy
          lazyPreloadDistance={1}
          tabBarOptions={{
            allowFontScaling: false,
            scrollEnabled: true,
            activeTintColor: colors.primary,
            inactiveTintColor: colors.text_secondary,
            tabStyle: {
              width: this.tabWidth,
              paddingTop: 0,
            },
            labelStyle: {
              marginTop: 0,
              fontFamily: 'ProductSans-Regular',
            },
            indicatorStyle: {
              height: 1,
              backgroundColor: colors.primary,
            },
            style: {
              backgroundColor: colors.icons,
              height: 35,
              paddingTop: 0,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,
              elevation: 5,
            },
          }}>
          <TabBase.Screen
            name="All"
            component={ItemsList}
            initialParams={{
              category: 'All',
            }}
          />
          {tabs &&
            tabs.map((category, index) => {
              return (
                <TabBase.Screen
                  name={`${category}`}
                  component={ItemsList}
                  key={index}
                  initialParams={{
                    category,
                  }}
                />
              );
            })}
        </TabBase.Navigator>
      </View>
    );
  }
}

export default StoreItemsTab;
