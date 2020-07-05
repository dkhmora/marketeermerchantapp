import React, {Component} from 'react';
import MapView, {Circle, Marker} from 'react-native-maps';
import {
  View,
  StatusBar,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Dimensions,
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

@inject('authStore')
@inject('detailsStore')
@observer
class DeliveryAreaScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapReady: false,
      editMode: false,
      address: null,
      radius: 0,
      initialRadius: 0,
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

  getGeohashRange = (latitude, longitude, distance) => {
    const bounds = geolib.getBoundsOfDistance(
      {latitude, longitude},
      distance * 1000,
    );

    const lower = geohash.encode(bounds[0].latitude, bounds[0].longitude, 20);
    const upper = geohash.encode(bounds[1].latitude, bounds[1].longitude, 20);

    return {
      lower,
      upper,
    };
  };

  decodeGeohash() {
    const {deliveryCoordinates} = this.props.detailsStore.storeDetails;
    const {lowerRange, upperRange, latitude, longitude} = deliveryCoordinates;

    const lower = geohash.decode(lowerRange);
    const upper = geohash.decode(upperRange);

    const radius = Math.round(
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
      markerPosition: {latitude, longitude},
      circlePosition: {latitude, longitude},
      mapData: {
        latitude,
        longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.05,
      },
      radius,
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
          circlePosition: {
            ...coords,
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
    }
  };

  async handleSetStoreLocation() {
    const {updateCoordinates} = this.props.detailsStore;
    const {merchantId} = this.props.authStore;
    const {newMarkerPosition, radius, address} = this.state;

    const range = this.getGeohashRange(
      newMarkerPosition.latitude,
      newMarkerPosition.longitude,
      radius,
    );

    if (!address) {
      this.setState(
        {
          address: await this.getAddressFromCoordinates({...newMarkerPosition}),
        },
        () => {
          updateCoordinates(
            merchantId,
            range.lower,
            range.upper,
            newMarkerPosition,
            this.state.address,
          );
        },
      );
    } else {
      updateCoordinates(
        merchantId,
        range.lower,
        range.upper,
        newMarkerPosition,
        this.state.address,
      );
    }

    this.setState({
      editMode: false,
      circlePosition: newMarkerPosition,
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
      initialRadius: this.state.radius,
      editMode: true,
    });

    this.panMapToMarker();
  }

  handleCancelChanges() {
    const {markerPosition, initialRadius} = this.state;

    this.setState({
      mapData: {...markerPosition, latitudeDelta: 0.04, longitudeDelta: 0.05},
      newMarkerPosition: null,
      radius: initialRadius,
      editMode: false,
    });

    this.panMapToMarker();
  }

  handleRegionChange = (mapData) => {
    const {editMode} = this.state;
    const {latitude, longitude} = mapData;

    if (editMode) {
      this.setState({
        newMarkerPosition: {
          latitude,
          longitude,
        },
        circlePosition: {
          latitude,
          longitude,
        },
      });
    }
  };

  async getAddressFromCoordinates({latitude, longitude}) {
    const HERE_API_KEY = '1VW7QLMp_GdQMOkjyBDpnKd8j6W5g049H7A1mUkpQmY';

    console.log(latitude, longitude);

    const details = await new Promise((resolve) => {
      const url = `https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?apiKey=${HERE_API_KEY}&mode=retrieveAddresses&prox=${latitude},${longitude}`;
      fetch(url)
        .then((res) => res.json())
        .then((resJson) => {
          // the response had a deeply nested structure :/
          if (
            resJson &&
            resJson.Response &&
            resJson.Response.View &&
            resJson.Response.View[0] &&
            resJson.Response.View[0].Result &&
            resJson.Response.View[0].Result[0]
          ) {
            resolve(resJson.Response.View[0].Result[0].Location.Address.Label);
          } else {
            resolve();
          }
        })
        .catch((e) => {
          console.log('Error in getAddressFromCoordinates', e);
          resolve();
        });
    });

    console.log(details);
    return details;
  }

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
        // place represents user's selection from the
        // suggestions and it is a simplified Google Place object.
      })
      .catch((error) => console.log(error.message)); // error is a Javascript Error object
  }

  render() {
    const {navigation} = this.props;
    const {
      markerPosition,
      radius,
      circlePosition,
      centerOfScreen,
      mapData,
      mapReady,
      editMode,
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
            <Circle
              center={circlePosition}
              radius={radius * 1000}
              fillColor="rgba(233, 30, 99, 0.3)"
              strokeColor="rgba(0,0,0,0.5)"
              zIndex={2}
              strokeWidth={2}
            />
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
                borderRadius: 16,
                overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255, 0.6)',
              }}>
              <CardItem style={{flexDirection: 'column'}}>
                <Text style={{alignSelf: 'flex-start', marginBottom: 5}}>
                  Delivery Radius
                </Text>
                <View
                  style={{
                    width: '100%',
                  }}>
                  <Slider
                    step={1}
                    minimumValue={0}
                    maximumValue={100}
                    value={radius}
                    thumbTintColor={colors.accent}
                    onValueChange={(value) => this.setState({radius: value})}
                  />
                  <Text style={{alignSelf: 'center'}}>{radius} KM</Text>
                </View>
              </CardItem>
              <CardItem style={{alignSelf: 'center'}}>
                <Card
                  style={{
                    borderRadius: 16,
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
              buttonStyle={{borderRadius: 24}}
              onPress={() => this.openSearchModal()}
            />
          }
        />
      </View>
    );
  }
}
export default DeliveryAreaScreen;
