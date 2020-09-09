import React, {Component} from 'react';
import MapView, {Marker, Polygon} from 'react-native-maps';
import {View, StatusBar, StyleSheet, Platform, Dimensions} from 'react-native';
import {Card, CardItem} from 'native-base';
import {Slider, Button, Icon, Text} from 'react-native-elements';
import {observer, inject} from 'mobx-react';
import {colors} from '../../assets/colors';
import geohash from 'ngeohash';
import * as geolib from 'geolib';
import BaseHeader from '../components/BaseHeader';
import * as turf from '@turf/turf';
import {computed, toJS} from 'mobx';
import Toast from '../components/Toast';

@inject('authStore')
@inject('detailsStore')
@observer
class DeliveryAreaScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      updating: false,
      distance: 0,
      newDistance: 0,
      bboxCenter: null,
      centerOfScreen: Dimensions.get('window').height / 2,
    };
  }

  @computed get boundingBox() {
    const {bboxCenter, newDistance, editMode} = this.state;

    if (bboxCenter && editMode) {
      const bounds = this.getBoundsOfDistance(bboxCenter, newDistance);

      const boundingBox = this.getBoundingBox(bounds[0], bounds[1]);

      return boundingBox;
    }

    return [];
  }

  @computed get currentBoundingBox() {
    const deliveryCoordinates = toJS(this.props.detailsStore.storeDetails)
      .deliveryCoordinates;
    if (deliveryCoordinates) {
      return deliveryCoordinates.boundingBox;
    }

    return null;
  }

  @computed get storeLocationIsInBBox() {
    const {editMode} = this.state;
    const {storeLocation} = this.props.detailsStore.storeDetails;

    if (
      this.boundingBox &&
      storeLocation &&
      editMode &&
      geolib.isPointInPolygon(storeLocation, this.boundingBox)
    ) {
      return true;
    }

    return false;
  }

  componentDidMount() {
    const {deliveryCoordinates} = this.props.detailsStore.storeDetails;

    if (deliveryCoordinates) {
      this.decodeGeohash();
    }
  }

  getBoundsOfDistance({latitude, longitude}, distance) {
    const bounds = geolib.getBoundsOfDistance(
      {latitude, longitude},
      distance * 1000,
    );

    return bounds;
  }

  getGeohashRange = (latitude, longitude, distance) => {
    const bounds = this.getBoundsOfDistance({latitude, longitude}, distance);

    const lower = geohash.encode(bounds[0].latitude, bounds[0].longitude, 12);
    const upper = geohash.encode(bounds[1].latitude, bounds[1].longitude, 12);

    return {
      lower,
      upper,
    };
  };

  getBoundingBox(lower, upper) {
    const line = turf.lineString([
      [lower.latitude, lower.longitude],
      [upper.latitude, upper.longitude],
    ]);
    const bbox = turf.bbox(line);
    const bboxPolygon = turf.bboxPolygon(bbox);

    let boundingBox = [];

    bboxPolygon.geometry.coordinates.map((coordinate) => {
      coordinate.map((latLng, index) => {
        if (index <= 3) {
          boundingBox.push({
            latitude: latLng[0],
            longitude: latLng[1],
          });
        }
      });
    });

    return boundingBox;
  }

  decodeGeohash() {
    const {deliveryCoordinates} = this.props.detailsStore.storeDetails;
    const {lowerRange, upperRange} = deliveryCoordinates;

    const lower = geohash.decode(lowerRange);
    const upper = geohash.decode(upperRange);

    const distance = Math.round(
      geolib.getDistance(
        {
          latitude: lower.latitude,
          longitude: lower.longitude,
        },
        {
          latitude: upper.latitude,
          longitude: lower.longitude,
        },
      ) / 2000,
    );

    this.setState({
      distance,
      newDistance: distance,
    });
  }

  handleSetStoreLocation() {
    const {newDistance, bboxCenter} = this.state;

    this.props.authStore.appReady = false;

    this.props.detailsStore
      .setStoreDeliveryArea({distance: newDistance, midPoint: bboxCenter})
      .then(() => {
        this.setState(
          {
            editMode: false,
            distance: newDistance,
            bboxCenter: null,
          },
          () => {
            this.props.authStore.appReady = true;
          },
        );
      });
  }

  panMapToLocation(position) {
    this.map.animateCamera(
      {
        center: position,
        pitch: 2,
        heading: 1,
        altitude: 1500,
        zoom: 13,
      },
      30,
    );
  }

  handleEditDeliveryArea() {
    const initialBboxCenter = geolib.getCenterOfBounds(this.currentBoundingBox);

    this.panMapToLocation(initialBboxCenter);

    this.setState({
      newDistance: this.state.distance,
      editMode: true,
      bboxCenter: initialBboxCenter,
    });
  }

  handleCancelChanges() {
    const {distance} = this.state;

    this.setState({
      bboxCenter: null,
      newDistance: distance,
      editMode: false,
    });
  }

  handleRegionChange = (mapData) => {
    const {editMode} = this.state;

    if (editMode) {
      const {latitude, longitude} = mapData;
      this.setState({
        bboxCenter: {latitude, longitude},
      });
    }
  };

  render() {
    const {navigation} = this.props;
    const {editMode, newDistance, centerOfScreen} = this.state;
    const {storeLocation} = toJS(this.props.detailsStore.storeDetails);
    const {boundingBox} = this;

    return (
      <View style={{flex: 1}}>
        <StatusBar translucent backgroundColor="transparent" />

        {storeLocation && (
          <MapView
            style={{...StyleSheet.absoluteFillObject}}
            provider="google"
            ref={(map) => {
              this.map = map;
            }}
            onRegionChangeComplete={this.handleRegionChange}
            initialRegion={{
              latitude: storeLocation.latitude,
              longitude: storeLocation.longitude,
              latitudeDelta: 0.04,
              longitudeDelta: 0.05,
            }}>
            <Marker
              ref={(marker) => {
                this.marker = marker;
              }}
              tracksViewChanges={false}
              coordinate={{...storeLocation}}>
              <View>
                <Icon color={colors.primary} name="map-pin" />
              </View>
            </Marker>

            {this.currentBoundingBox && (
              <Polygon
                coordinates={this.currentBoundingBox}
                fillColor="rgba(233, 30, 99, 0.3)"
                strokeColor="rgba(0,0,0,0.5)"
                strokeWidth={1}
              />
            )}

            {editMode && (
              <Polygon
                coordinates={boundingBox}
                fillColor="rgba(68, 138, 255, 0.3)"
                strokeColor="rgba(0,0,0,0.5)"
                strokeWidth={1}
              />
            )}
          </MapView>
        )}

        {editMode ? (
          <View
            style={{
              padding: 20,
              position: 'absolute',
              alignSelf: 'center',
              justifyContent: 'center',
              bottom: 20,
              left: 0,
              right: 0,
            }}>
            <Card
              style={{
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255, 0.6)',
              }}>
              <CardItem style={{flexDirection: 'column'}}>
                <Text
                  style={{
                    alignSelf: 'flex-start',
                    fontSize: 18,
                    fontFamily: 'ProductSans-Regular',
                  }}>
                  Delivery distance
                </Text>

                <View
                  style={{
                    width: '100%',
                    paddingVertical: 10,
                  }}>
                  <Slider
                    step={1}
                    minimumValue={1}
                    maximumValue={100}
                    value={newDistance}
                    thumbTintColor={colors.accent}
                    onValueChange={(value) =>
                      this.setState({newDistance: value})
                    }
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}>
                    <Text
                      style={{
                        fontSize: 18,
                        color: colors.primary,
                        fontFamily: 'ProductSans-Black',
                        textAlignVertical: 'bottom',
                      }}>
                      {newDistance}{' '}
                    </Text>

                    <Text
                      style={{
                        textAlignVertical: 'bottom',
                      }}>
                      KM
                    </Text>
                  </View>
                </View>

                {!this.storeLocationIsInBBox && (
                  <Text
                    style={{
                      alignSelf: 'center',
                      color: colors.danger,
                      textAlign: 'center',
                    }}>
                    Store location is not within delivery area! Please move the
                    delivery box within your store location.
                  </Text>
                )}
              </CardItem>

              <CardItem>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                  }}>
                  <Button
                    title="Cancel Changes"
                    titleStyle={{
                      color: colors.icons,
                      paddingRight: 5,
                      fontSize: 15,
                    }}
                    icon={<Icon name="x" color={colors.icons} />}
                    iconRight
                    onPress={() => this.handleCancelChanges()}
                    buttonStyle={{backgroundColor: colors.primary}}
                    containerStyle={{marginRight: 20}}
                  />

                  <Button
                    title="Save Changes"
                    titleStyle={{
                      color: colors.icons,
                      paddingRight: 5,
                      fontSize: 15,
                    }}
                    icon={<Icon name="save" color={colors.icons} />}
                    iconRight
                    disabled={!this.storeLocationIsInBBox || newDistance < 1}
                    buttonStyle={{backgroundColor: colors.accent}}
                    onPress={() => this.handleSetStoreLocation()}
                  />
                </View>
              </CardItem>
            </Card>
          </View>
        ) : (
          <Button
            title="Change Store Delivery Area"
            titleStyle={{color: colors.icons, paddingRight: 5}}
            icon={<Icon name="edit" color={colors.icons} />}
            iconRight
            onPress={() => this.handleEditDeliveryArea()}
            buttonStyle={{backgroundColor: colors.primary}}
            containerStyle={{
              position: 'absolute',
              alignSelf: 'center',
              justifyContent: 'center',
              bottom: '5%',
            }}
          />
        )}

        {editMode && (
          <View
            style={{
              left: 0,
              right: 0,
              marginLeft: 0,
              marginTop: 0,
              position: 'absolute',
              top: centerOfScreen,
              alignItems: 'center',
            }}>
            <Icon color={colors.accent} name="crosshair" />
          </View>
        )}

        <View
          style={{
            position: 'absolute',
            top: 120,
            right: 20,
          }}>
          <Button
            onPress={() => this.panMapToLocation(storeLocation)}
            disabled={!storeLocation}
            icon={<Icon name="map-pin" color={colors.icons} size={35} />}
            titleStyle={{color: colors.icons}}
            buttonStyle={{
              backgroundColor: colors.primary,
              borderRadius: 35,
              paddingBottom: Platform.OS === 'ios' ? 5 : null,
            }}
            containerStyle={{
              overflow: 'hidden',
            }}
          />
        </View>

        <BaseHeader backButton navigation={navigation} title="Delivery Area" />
      </View>
    );
  }
}
export default DeliveryAreaScreen;
