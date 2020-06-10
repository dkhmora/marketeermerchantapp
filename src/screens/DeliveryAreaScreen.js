import React, {Component} from 'react';
import MapView, {Circle, Marker} from 'react-native-maps';
import {
  View,
  StatusBar,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import {
  Button,
  Icon,
  Text,
  Item,
  Input,
  Label,
  Card,
  CardItem,
} from 'native-base';
import {observer, inject} from 'mobx-react';
import {observable} from 'mobx';
import Geolocation from '@react-native-community/geolocation';

@inject('authStore')
@inject('detailsStore')
@observer
class DeliveryAreaScreen extends Component {
  constructor(props) {
    super(props);

    this.markerRef = React.createRef();

    this.state = {
      mapReady: false,
      editMode: false,
      cameraMoved: false,
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
    console.log(
      'center',
      Dimensions.get('window').height,
      '-',
      StatusBar.currentHeight,
      (Dimensions.get('window').height - StatusBar.currentHeight) / 2,
    );
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

  setMarkerPosition(e) {
    this.setState({markerPosition: e.nativeEvent.coordinate});
  }

  handleSetStoreLocation() {
    const {updateCoordinates} = this.props.detailsStore;
    const {merchantId} = this.props.authStore;
    const {newMarkerPosition} = this.state;

    updateCoordinates(
      merchantId,
      newMarkerPosition.latitude,
      newMarkerPosition.longitude,
    );

    this.setState({
      editMode: false,
      circlePosition: newMarkerPosition,
      markerPosition: newMarkerPosition,
    });
  }

  handleEditDeliveryArea() {
    this.setState({
      mapData: {...this.state.markerPosition},
      newMarkerPosition: this.state.markerPosition,
      editMode: true,
    });
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
      setTimeout(() => {
        this.setState({cameraMoved: true});
        console.log('yes');
      }, 800);
    }
  }

  handleCancelChanges() {
    this.setState({
      mapData: {...this.state.markerPosition},
      newMarkerPosition: null,
      editMode: false,
      cameraMoved: false,
    });
  }

  handleRegionChange = (mapData) => {
    if (this.state.editMode && this.state.cameraMoved) {
      this.setState({
        newMarkerPosition: {
          latitude: mapData.latitude,
          longitude: mapData.longitude,
        },
      });
    }
  };

  render() {
    const {navigation} = this.props;
    const {markerPosition, radius, mapReady, editMode} = this.state;

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
            initialRegion={this.state.mapData}>
            {!editMode && (
              <Marker
                ref={this.markerRef}
                tracksViewChanges={false}
                coordinate={markerPosition}
                onDrag={(e) => this.setMarkerPosition(e)}>
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
              center={this.state.circlePosition}
              radius={10000}
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
              top: this.state.centerOfScreen,
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
                    Delivery Radius (Kilometers)
                  </Text>
                  <Item
                    style={{
                      flex: 1,
                      borderColor: 'transparent',
                    }}>
                    <Input
                      value={radius.toString()}
                      keyboardType="numeric"
                      style={{
                        borderRadius: 24,
                        borderColor: '#E91E63',
                        borderWidth: 1,
                      }}
                    />
                  </Item>
                </CardItem>
                <CardItem>
                  <Card
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      backgroundColor: '#eee',
                    }}>
                    <CardItem style={{backgroundColor: '#eef'}}>
                      <Text note style={{margin: 6}}>
                        Tip: Tap and Hold the Red Marker to drag it around!
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
