import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {View, RefreshControl} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Text, Avatar, Divider} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {Rating} from 'react-native-rating-element';
import moment from 'moment';
import BaseHeader from '../components/BaseHeader';
import crashlytics from '@react-native-firebase/crashlytics';

@inject('detailsStore')
@observer
class ReviewsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {reviewsLoading: true, reviews: []};
  }

  componentDidMount() {
    this.getReviews();

    crashlytics().log('ReviewsScreen');
  }

  async getReviews() {
    this.setState(
      {
        reviews: await this.props.detailsStore.getStoreReviews(),
        reviewsLoading: true,
      },
      () => {
        this.setState({reviewsLoading: false});
      },
    );
  }

  onRefresh() {
    this.getReviews();
  }

  ReviewListItem({item}) {
    const timeStamp = moment(item.createdAt, 'x').format('MM-DD-YYYY hh:mm A');

    return (
      <View
        style={{
          width: '100%',
          flexDirection: 'column',
          paddingHorizontal: 5,
          paddingVertical: 5,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Avatar
              title={item.userName.charAt(0)}
              size="small"
              rounded
              overlayContainerStyle={{
                backgroundColor: colors.primary,
              }}
              activeOpacity={0.7}
              titleStyle={{
                fontFamily: 'ProductSans-Light',
                color: colors.icons,
              }}
            />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 17,
                fontFamily: 'ProductSans-Regular',
              }}>
              {item.userName}
            </Text>
          </View>

          <Rating
            type="custom"
            direction="row"
            rated={item.rating}
            selectedIconImage={require('../../assets/images/feather_filled.png')}
            emptyIconImage={require('../../assets/images/feather_unfilled.png')}
            size={20}
            tintColor={colors.primary}
            ratingColor={colors.accent}
            ratingBackgroundColor="#455A64"
            onIconTap={() => {}}
          />
        </View>

        <View style={{paddingHorizontal: 8, paddingTop: 8}}>
          <Text style={{fontSize: 15, paddingBottom: 10, textAlign: 'justify'}}>
            {item.reviewBody}
          </Text>

          <Text
            style={{
              color: colors.text_secondary,
              fontFamily: 'ProductSans-Light',
            }}>
            {timeStamp}
          </Text>
        </View>
      </View>
    );
  }

  AverageRatingHeader({storeDetails}) {
    return (
      <View
        style={{
          alignItems: 'center',
          paddingVertical: 10,
        }}>
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'ProductSans-Regular',
            marginBottom: 10,
          }}>
          {storeDetails.storeName}'s Average Rating
        </Text>
        <Rating
          type="custom"
          direction="row"
          rated={storeDetails.ratingAverage ? storeDetails.ratingAverage : 0}
          selectedIconImage={require('../../assets/images/feather_filled.png')}
          emptyIconImage={require('../../assets/images/feather_unfilled.png')}
          size={30}
          tintColor={colors.primary}
          ratingColor={colors.accent}
          ratingBackgroundColor="#455A64"
          onIconTap={() => {}}
        />

        <View style={{flexDirection: 'row'}}>
          <Text style={{fontSize: 18, fontFamily: 'ProductSans-Regular'}}>
            {storeDetails.ratingAverage
              ? storeDetails.ratingAverage.toFixed(1)
              : 'No Rating Yet'}
          </Text>
          <Text
            style={{
              textAlignVertical: 'center',
              paddingHorizontal: 2,
              fontSize: 16,
            }}>{`(${storeDetails.reviewNumber})`}</Text>
        </View>
      </View>
    );
  }

  render() {
    const {reviewsLoading, reviews} = this.state;
    const {storeDetails} = this.props.detailsStore;
    const {navigation} = this.props;

    return (
      <View style={{flex: 1}}>
        <BaseHeader title="Customer Reviews" navigation={navigation} />

        <FlatList
          style={{flex: 1}}
          data={reviews}
          initialNumToRender={30}
          contentContainerStyle={{paddingHorizontal: 10, paddingVertical: 5}}
          ListHeaderComponent={
            <View>
              <this.AverageRatingHeader storeDetails={storeDetails} />
              <Divider />
            </View>
          }
          renderItem={({item, index}) => (
            <View key={index}>
              <this.ReviewListItem item={item} />

              <Divider />
            </View>
          )}
          refreshControl={
            <RefreshControl
              colors={[colors.primary, colors.dark]}
              refreshing={reviewsLoading}
              onRefresh={this.onRefresh.bind(this)}
            />
          }
          keyExtractor={(item) => item.orderId}
        />
      </View>
    );
  }
}

export default ReviewsScreen;
