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
import {Button, Icon, Text, Item, Input, Card, CardItem} from 'native-base';
import {Slider} from 'react-native-elements';
import {observer, inject} from 'mobx-react';
import Geolocation from '@react-native-community/geolocation';

@inject('authStore')
@inject('detailsStore')
@observer
class DeliveryAreaScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapReady: false,
      editMode: false,
      radius: 0,
      initialRadius: 0,
      newMarkerPosition: null,
      centerOfScreen: (Dimensions.get('window').height - 17) / 2,
    };

    const {coordinates, deliveryRadius} = this.props.detailsStore.storeDetails;

    if (coordinates) {
      const {_latitude, _longitude} = coordinates;
      this.state.markerPosition = {latitude: _latitude, longitude: _longitude};
      this.state.circlePosition = {latitude: _latitude, longitude: _longitude};
      this.state.mapData = {
        latitude: _latitude,
        longitude: _longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.05,
      };
    }

    if (deliveryRadius) {
      this.state.radius = deliveryRadius;
    }
  }

  componentDidMount() {
    const {coordinates} = this.props.detailsStore.storeDetails;

    if (!coordinates) {
      this.setInitialMarkerPosition();
    } else {
      this.setState({mapReady: true});
    }
  }

  async setInitialMarkerPosition() {
    await Geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: parseFloat(position.coords.latitude),
          longitude: parseFloat(position.coords.longitude),
        };

        this.setState({
          markerPosition: {
            ...coords,
          },
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
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
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

  handleSetStoreLocation() {
    const {updateCoordinates} = this.props.detailsStore;
    const {merchantId} = this.props.authStore;
    const {newMarkerPosition, radius} = this.state;

    updateCoordinates(
      merchantId,
      newMarkerPosition.latitude,
      newMarkerPosition.longitude,
      radius,
    );

    this.setState({
      editMode: false,
      circlePosition: newMarkerPosition,
      markerPosition: newMarkerPosition,
    });
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
          zoom: 15,
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
      <View style={StyleSheet.absoluteFillObject}>
        <StatusBar translucent backgroundColor="transparent" />

        {mapReady && (
          <MapView
            style={{flex: 1}}
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
            {!editMode && (
              <Marker
                ref={(marker) => {
                  this.marker = marker;
                }}
                tracksViewChanges={false}
                coordinate={markerPosition}>
                <View>
                  <Icon
                    style={{
                      color: '#B11C01',
                      fontSize: 34,
                    }}
                    name="pin"
                    solid
                  />
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
            <Icon
              style={{
                color: '#B11C01',
                fontSize: 34,
              }}
              name="pin"
              solid
            />
          </View>
        )}
        <View
          style={{
            position: 'absolute',
            alignSelf: 'flex-start',
            justifyContent: 'flex-start',
            top: '-7%',
          }}>
          <Button
            transparent
            onPress={() => navigation.openDrawer()}
            style={{marginTop: 100}}>
            <Icon name="menu" style={{fontSize: 32}} />
          </Button>
        </View>
        <View
          style={{
            position: 'absolute',
            alignSelf: 'center',
            justifyContent: 'center',
            bottom: '5%',
          }}>
          {editMode ? (
            <View style={{flexDirection: 'column'}}>
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
                      onValueChange={(value) => this.setState({radius: value})}
                    />
                    <Text style={{alignSelf: 'center'}}>{radius} KM</Text>
                  </View>
                </CardItem>
                <CardItem>
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
                  <View style={{flexDirection: 'row'}}>
                    <Button
                      iconLeft
                      rounded
                      danger
                      onPress={() => this.handleCancelChanges()}
                      style={{marginRight: 20}}>
                      <Icon name="close" />
                      <Text>Cancel Changes</Text>
                    </Button>
                    <Button
                      iconLeft
                      rounded
                      success
                      onPress={() => this.handleSetStoreLocation()}>
                      <Icon name="save" />
                      <Text>Save Changes</Text>
                    </Button>
                  </View>
                </CardItem>
              </Card>
            </View>
          ) : (
            <Button
              iconLeft
              onPress={() => this.handleEditDeliveryArea()}
              style={{borderRadius: 24, overflow: 'hidden'}}>
              <Icon name="create" />
              <Text>Edit Delivery Area</Text>
            </Button>
          )}
        </View>
      </View>
    );
  }
}
export default DeliveryAreaScreen;
