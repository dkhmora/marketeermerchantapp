import React, {Component} from 'react';
import {Text} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import FastImage from 'react-native-fast-image';
import {View, TouchableOpacity} from 'react-native';
import {Card, CardItem} from 'native-base';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import {Rating} from 'react-native-rating-element';
import {PlaceholderMedia, Placeholder, Fade} from 'rn-placeholder';

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

    paymentMethods &&
      paymentMethods.map((method, index) => {
        pills.push(
          <View
            key={`${method}${index}`}
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
      <View
        style={{
          flex: 1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          paddingHorizontal: 5,
        }}>
        <Card
          style={{
            padding: 0,
            margin: 0,
            borderRadius: 8,
            elevation: 2,
            overflow: 'hidden',
          }}>
          <TouchableOpacity activeOpacity={0.85}>
            <View style={{height: 200}}>
              {coverImageUrl && ready ? (
                <FastImage
                  source={{uri: coverImageUrl}}
                  style={{
                    backgroundColor: colors.primary,
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
              ) : (
                <Placeholder Animation={Fade}>
                  <PlaceholderMedia
                    style={{
                      backgroundColor: colors.primary,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      width: '100%',
                      height: 150,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  />
                </Placeholder>
              )}

              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                  borderColor: 'rgba(0,0,0,0.2)',
                  borderWidth: 1,
                  right: -1,
                  padding: 7,
                  marginTop: 20,
                  backgroundColor: colors.icons,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
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
                    Free Delivery (₱
                    {store.freeDeliveryMinimum
                      ? store.freeDeliveryMinimum
                      : 0}{' '}
                    Min.)
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
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.34,
                  shadowRadius: 6.27,
                  elevation: 10,
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
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 5,
                    },
                    shadowOpacity: 0.34,
                    shadowRadius: 6.27,
                    elevation: 10,
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

            <CardItem
              style={{
                flexDirection: 'column',
                width: '100%',
                marginTop: -55,
                borderRadius: 8,
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 10,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'column',
                  paddingTop: 5,
                }}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.text_footer,
                    {
                      fontFamily: 'ProductSans-Regular',
                      textAlign: 'left',
                      alignSelf: 'flex-start',
                      flexWrap: 'wrap',
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
                      flexWrap: 'wrap',
                      minHeight: 28,
                    },
                  ]}>
                  {store.storeDescription}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    paddingTop: 5,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}>
                    <this.PaymentMethods />
                  </View>

                  <Text style={{color: colors.text_secondary}}>
                    {store.distance
                      ? store.distance > 1000
                        ? `${(store.distance / 1000).toFixed(2)} km`
                        : `${store.distance} meters`
                      : ''}
                  </Text>
                </View>
              </View>
            </CardItem>

            <View
              style={{
                position: 'absolute',
                top: 80,
                left: 20,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                backgroundColor: colors.primary,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.primary,
                overflow: 'hidden',
                width: 80,
                height: 80,
              }}>
              {displayImageUrl && ready ? (
                <FastImage
                  source={{uri: displayImageUrl}}
                  style={{
                    backgroundColor: colors.primary,
                    width: 80,
                    height: 80,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <Placeholder Animation={Fade}>
                  <PlaceholderMedia
                    style={{
                      backgroundColor: colors.primary,
                      width: 80,
                      height: 80,
                    }}
                  />
                </Placeholder>
              )}
            </View>
          </TouchableOpacity>
        </Card>
      </View>
    );
  }
}

export default StoreCard;
