import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {ActivityIndicator, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Text, Avatar} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {Rating} from 'react-native-rating-element';
import moment, {ISO_8601} from 'moment';
import BaseHeader from '../components/BaseHeader';

@inject('detailsStore')
@observer
class ReviewsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {reviewsLoading: true, reviews: []};
  }

  componentDidMount() {
    this.getReviews();
  }

  async getReviews() {
    const {merchantId} = this.props.route.params;
    const {reviews} = this.state;

    if (reviews.length <= 0) {
      this.setState(
        {
          reviews: await this.props.detailsStore.getStoreReviews(merchantId),
        },
        () => {
          this.setState({reviewsLoading: false});
        },
      );
    }
  }

  ReviewListItem({item}) {
    const timeStamp = moment(item.createdAt, ISO_8601).format(
      'MM-DD-YYYY hh:MM A',
    );

    return (
      <View
        style={{
          width: '100%',
          flexDirection: 'column',
          paddingVertical: 10,
          borderBottomColor: colors.divider,
          borderBottomWidth: 1,
          paddingHorizontal: 15,
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
              onPress={() => console.log('Works!')}
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

          <Text style={{color: colors.text_secondary}}>{timeStamp}</Text>
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

        {reviewsLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            style={{flex: 1}}
            data={reviews}
            initialNumToRender={30}
            ListHeaderComponent={
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.divider,
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
                  rated={storeDetails.ratingAverage}
                  selectedIconImage={require('../../assets/images/feather_filled.png')}
                  emptyIconImage={require('../../assets/images/feather_unfilled.png')}
                  size={30}
                  tintColor={colors.primary}
                  ratingColor={colors.accent}
                  ratingBackgroundColor="#455A64"
                  onIconTap={() => {}}
                />

                <Text style={{fontSize: 18, fontFamily: 'ProductSans-Regular'}}>
                  {storeDetails.ratingAverage.toFixed(1)}
                </Text>
              </View>
            }
            renderItem={({item, index}) => (
              <this.ReviewListItem item={item} key={index} />
            )}
            keyExtractor={(item) => item.orderId}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  }
}

export default ReviewsScreen;
