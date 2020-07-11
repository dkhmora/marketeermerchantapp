import React, {Component} from 'react';
import MapView, {Circle, Marker, Polygon} from 'react-native-maps';
import {
  View,
  StatusBar,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {Card, CardItem} from 'native-base';
import {Slider, Button, Icon, Text} from 'react-native-elements';
import {observer, inject} from 'mobx-react';
import Geolocation from '@react-native-community/geolocation';
import {colors} from '../../assets/colors';
import geohash from 'ngeohash';
import * as geolib from 'geolib';
import BaseHeader from '../components/BaseHeader';
import RNGooglePlaces from 'react-native-google-places';
import Toast from '../components/Toast';
import * as turf from '@turf/turf';

@inject('authStore')
@inject('detailsStore')
@observer
class DeliveryAreaScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapReady: false,
      editMode: false,
      updating: false,
      boundingBox: null,
      address: null,
      distance: 0,
      initialdistance: 0,
      newMarkerPosition: null,
      centerOfScreen: (Dimensions.get('window').height - 17) / 2,
    };
  }

  componentDidMount() {
    const {deliveryCoordinates} = this.props.detailsStore.storeDetails;

    if (!deliveryCoordinates) {
      this.setInitialMarkerPosition();
    } else {
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
    const {lowerRange, upperRange, latitude, longitude} = deliveryCoordinates;

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

    const boundingBox = this.getBoundingBox(lower, upper);

    this.setState({
      markerPosition: {latitude, longitude},
      newMarkerPosition: {latitude, longitude},
      boundingBox,
      mapData: {
        latitude,
        longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.05,
      },
      distance,
      mapReady: true,
    });
  }

  async setInitialMarkerPosition() {
    await Geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: parseFloat(position.coords.latitude),
          longitude: parseFloat(position.coords.longitude),
        };

        this.setState({
          newMarkerPosition: {
            ...coords,
          },
          mapData: {
            ...coords,
            latitudeDelta: 0.04,
            longitudeDelta: 0.05,
          },
          mapReady: true,
        });
      },
      (err) => console.log(err),
      {
        timeout: 20000,
      },
    );
  }

  _onMapReady = () => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then((granted) => {
        console.log(granted); // just to ensure that permissions were granted
      });
    } else {
      Geolocation.requestAuthorization();
    }
  };

  async handleSetStoreLocation() {
    const {updateCoordinates} = this.props.detailsStore;
    const {merchantId} = this.props.authStore;
    const {newMarkerPosition, distance, address} = this.state;

    const range = this.getGeohashRange(
      newMarkerPosition.latitude,
      newMarkerPosition.longitude,
      distance,
    );

    const bounds = this.getBoundsOfDistance({...newMarkerPosition}, distance);
    const boundingBox = this.getBoundingBox(bounds[0], bounds[1]);

    this.setState({loading: true});

    if (!address) {
      this.setState(
        {
          address: await this.props.detailsStore.getAddressFromCoordinates({
            ...newMarkerPosition,
          }),
          boundingBox,
        },
        () => {
          updateCoordinates(
            merchantId,
            range.lower,
            range.upper,
            newMarkerPosition,
            boundingBox,
            this.state.address,
          )
            .then(() => {
              Toast({text: 'Delivery Area successfully set!'});
              this.setState({loading: false});
            })
            .catch((err) => Toast({text: err, type: 'danger'}));
        },
      );
    } else {
      updateCoordinates(
        merchantId,
        range.lower,
        range.upper,
        newMarkerPosition,
        this.state.address,
      )
        .then(() => {
          Toast({text: 'Delivery Area successfully set!'});
          this.setState({loading: false});
        })
        .catch((err) => Toast({text: err, type: 'danger'}));
    }

    this.setState({
      editMode: false,
      markerPosition: newMarkerPosition,
    });
  }

  panMapToLocation(position) {
    if (Platform.OS === 'ios') {
      this.map.animateCamera(
        {
          center: position,
          pitch: 2,
          heading: 20,
          altitude: 6000,
          zoom: 5,
        },
        150,
      );
    } else {
      this.map.animateCamera(
        {
          center: position,
          pitch: 2,
          heading: 1,
          altitude: 200,
          zoom: 18,
        },
        150,
      );
    }
  }

  panMapToMarker() {
    if (Platform.OS === 'ios') {
      this.map.animateCamera(
        {
          center: this.state.markerPosition,
          pitch: 2,
          heading: 20,
          altitude: 6000,
          zoom: 5,
        },
        150,
      );
    } else {
      this.map.animateCamera(
        {
          center: this.state.markerPosition,
          pitch: 2,
          heading: 1,
          altitude: 500,
          zoom: 18,
        },
        150,
      );
    }
  }

  handleEditDeliveryArea() {
    this.setState({
      mapData: {
        ...this.state.markerPosition,
        latitudeDelta: 0.04,
        longitudeDelta: 0.05,
      },
      newMarkerPosition: this.state.markerPosition,
      initialdistance: this.state.distance,
      editMode: true,
    });

    this.panMapToMarker();
  }

  handleCancelChanges() {
    const {markerPosition, initialdistance} = this.state;

    this.setState({
      mapData: {...markerPosition, latitudeDelta: 0.04, longitudeDelta: 0.05},
      newMarkerPosition: {...markerPosition},
      distance: initialdistance,
      editMode: false,
    });

    this.panMapToMarker();
  }

  handleRegionChange = (mapData) => {
    const {editMode} = this.state;
    const {latitude, longitude} = mapData;

    const bounds = this.getBoundsOfDistance(
      {latitude, longitude},
      this.state.distance,
    );

    const boundingBox = this.getBoundingBox(bounds[0], bounds[1]);

    if (editMode) {
      this.setState({
        newMarkerPosition: {
          latitude,
          longitude,
        },
        boundingBox,
      });
    }
  };

  openSearchModal() {
    RNGooglePlaces.openAutocompleteModal({country: 'PH'}, [
      'address',
      'location',
    ])
      .then((place) => {
        const address = place.address;
        const coordinates = place.location;

        this.panMapToLocation(coordinates);

        this.setState({
          address,
          newMarkerPosition: {...coordinates},
          editMode: true,
        });
      })
      .catch((error) => console.log(error.message));
  }

  render() {
    const {navigation} = this.props;
    const {
      markerPosition,
      distance,
      centerOfScreen,
      mapData,
      mapReady,
      editMode,
      loading,
      boundingBox,
    } = this.state;

    return (
      <View style={{flex: 1}}>
        <StatusBar translucent backgroundColor="transparent" />

        {mapReady && (
          <MapView
            style={{...StyleSheet.absoluteFillObject}}
            ref={(map) => {
              this.map = map;
            }}
            onRegionChangeComplete={this.handleRegionChange}
            showsUserLocation
            followsUserLocation
            onMapReady={() => {
              this._onMapReady();
            }}
            initialRegion={mapData}>
            {!editMode && markerPosition && (
              <Marker
                ref={(marker) => {
                  this.marker = marker;
                }}
                tracksViewChanges={false}
                coordinate={markerPosition}>
                <View>
                  <Icon color={colors.primary} name="map-pin" />
                </View>
              </Marker>
            )}
            {boundingBox && (
              <Polygon
                coordinates={boundingBox}
                fillColor="rgba(233, 30, 99, 0.3)"
                strokeColor="rgba(0,0,0,0.5)"
                strokeWidth={1}
              />
            )}
          </MapView>
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
            <Icon color={colors.primary} name="map-pin" />
          </View>
        )}

        {editMode ? (
          <View
            style={{
              padding: 20,
              position: 'absolute',
              alignSelf: 'center',
              justifyContent: 'center',
              bottom: 20,
            }}>
            <Card
              style={{
                borderdistance: 16,
                overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255, 0.6)',
              }}>
              <CardItem style={{flexDirection: 'column'}}>
                <Text style={{alignSelf: 'flex-start', marginBottom: 5}}>
                  Delivery distance
                </Text>
                <View
                  style={{
                    width: '100%',
                  }}>
                  <Slider
                    step={1}
                    minimumValue={0}
                    maximumValue={100}
                    value={distance}
                    thumbTintColor={colors.accent}
                    onValueChange={(value) => this.setState({distance: value})}
                  />
                  <Text style={{alignSelf: 'center'}}>{distance} KM</Text>
                </View>
              </CardItem>
              <CardItem style={{alignSelf: 'center'}}>
                <Card
                  style={{
                    borderdistance: 16,
                    overflow: 'hidden',
                    backgroundColor: '#eee',
                  }}>
                  <CardItem
                    style={{
                      backgroundColor: '#eef',
                    }}>
                    <Text note style={{margin: 6, width: '100%'}}>
                      Tip: Pan around the map to move your store's location!
                    </Text>
                  </CardItem>
                </Card>
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
                    titleStyle={{color: colors.icons, paddingRight: 5}}
                    icon={<Icon name="x" color={colors.icons} />}
                    iconRight
                    onPress={() => this.handleCancelChanges()}
                    buttonStyle={{backgroundColor: colors.primary}}
                    containerStyle={{marginRight: 20}}
                  />
                  <Button
                    title="Save Changes"
                    titleStyle={{color: colors.icons, paddingRight: 5}}
                    icon={<Icon name="save" color={colors.icons} />}
                    iconRight
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

        <BaseHeader
          backButton
          navigation={navigation}
          title="Delivery Area"
          rightComponent={
            <Button
              type="clear"
              icon={<Icon name="search" color={colors.icons} />}
              titleStyle={{color: colors.icons}}
              buttonStyle={{borderdistance: 24}}
              onPress={() => this.openSearchModal()}
            />
          }
        />

        {loading && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                flex: 1,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
            <ActivityIndicator animating color={colors.primary} size="large" />
          </View>
        )}
      </View>
    );
  }
}
export default DeliveryAreaScreen;
