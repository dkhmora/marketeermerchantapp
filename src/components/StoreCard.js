import React, {Component} from 'react';
import {Text} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import FastImage from 'react-native-fast-image';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
} from 'react-native';
import {Card, CardItem} from 'native-base';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import StoreCardLoader from './StoreCardLoader';
import {Rating} from 'react-native-rating-element';

class StoreCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayImageUrl: '',
      coverImageUrl: '',
      ready: false,
    };
  }

  getImage = async () => {
    const {displayImage, coverImage} = this.props.store;

    if (displayImage) {
      const displayImageRef = storage().ref(displayImage);
      const displayImageUrl = await displayImageRef.getDownloadURL();

      this.setState({displayImageUrl, ready: true});
    }

    if (coverImage) {
      const coverImageRef = storage().ref(coverImage);
      const coverImageUrl = await coverImageRef.getDownloadURL();

      this.setState({coverImageUrl, ready: true});
    }
  };

  componentDidMount() {
    this.getImage();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.store !== this.props.store) {
      this.getImage();
    }
  }

  PaymentMethods = () => {
    const {paymentMethods} = this.props.store;
    const pills = [];

    paymentMethods.map((method, index) => {
      pills.push(
        <View
          key={index}
          style={{
            borderRadius: 20,
            backgroundColor: colors.accent,
            padding: 3,
            paddingHorizontal: 10,
            marginRight: 2,
          }}>
          <Text
            style={{
              fontSize: 13,
              fontFamily: 'ProductSans-Regular',
              color: colors.icons,
            }}>
            {method}
          </Text>
        </View>,
      );
    });

    return pills;
  };

  render() {
    const {store, navigation} = this.props;
    const {displayImageUrl, coverImageUrl, ready} = this.state;

    return (
      <Card
        style={{
          padding: 0,
          margin: 0,
          borderRadius: 8,
          elevation: 2,
          height: 266,
          width: '100%',
        }}>
        {ready ? (
          <TouchableOpacity activeOpacity={0.85}>
            {{coverImageUrl} && (
              <View style={{height: 200}}>
                <FastImage
                  source={{uri: coverImageUrl}}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 150,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />

                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                    borderColor: 'rgba(0,0,0,0.3)',
                    borderWidth: 1,
                    right: -1,
                    padding: 7,
                    marginTop: 20,
                    backgroundColor: colors.icons,
                  }}>
                  <Text style={{color: colors.text_primary}}>
                    {store.deliveryType}
                  </Text>

                  {store.freeDelivery && (
                    <Text
                      style={{
                        color: colors.text_primary,
                        fontFamily: 'ProductSans-Black',
                      }}>
                      Free Delivery (₱{store.freeDeliveryMinimum} Min.)
                    </Text>
                  )}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    borderTopLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    top: 0,
                    left: 0,
                    padding: 7,
                    backgroundColor: colors.primary,
                  }}>
                  <Text style={{color: colors.icons, fontSize: 17}}>
                    {store.storeCategory}
                  </Text>
                </View>

                {store.ratingAverage && (
                  <View
                    style={{
                      overflow: 'hidden',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      borderTopLeftRadius: 8,
                      borderBottomLeftRadius: 8,
                      bottom: 60,
                      right: 0,
                      padding: 5,
                      backgroundColor: colors.primary,
                    }}>
                    <Rating
                      type="custom"
                      direction="row"
                      rated={store.ratingAverage}
                      selectedIconImage={require('../../assets/images/feather_filled.png')}
                      emptyIconImage={require('../../assets/images/feather_unfilled.png')}
                      size={23}
                      tintColor={colors.primary}
                      ratingColor={colors.accent}
                      ratingBackgroundColor="#455A64"
                      readonly
                    />
                  </View>
                )}
              </View>
            )}

            <CardItem
              style={{
                flexDirection: 'column',
                width: '100%',
                height: 65,
                borderRadius: 8,
                paddingBottom: 20,
                position: 'relative',
                bottom: 40,
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'column',
                }}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.text_footer,
                    {
                      fontFamily: 'ProductSans-Regular',
                      textAlign: 'left',
                      alignSelf: 'flex-start',
                    },
                  ]}>
                  {store.storeName}
                </Text>

                <Text
                  numberOfLines={2}
                  style={[
                    styles.text_subtext,
                    {
                      fontFamily: 'ProductSans-light',
                      textAlign: 'left',
                      alignSelf: 'flex-start',
                      height: 32,
                    },
                  ]}>
                  {store.storeDescription}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end',
                    marginTop: 5,
                  }}>
                  <this.PaymentMethods />
                </View>
              </View>
            </CardItem>

            {{displayImageUrl} && (
              <FastImage
                source={{uri: displayImageUrl}}
                style={{
                  position: 'absolute',
                  bottom: 95,
                  left: 20,
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.primary,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{height: 266, width: '100%'}}>
            <StoreCardLoader />
          </View>
        )}
      </Card>
    );
  }
}

export default StoreCard;
