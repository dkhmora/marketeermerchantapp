import React, {Component} from 'react';
import MapView, {Circle, Marker} from 'react-native-maps';
import {View, StatusBar, StyleSheet, PermissionsAndroid} from 'react-native';
import {Button, Icon, Text, Item} from 'native-base';
import {observer, inject} from 'mobx-react';
import {observable} from 'mobx';
import Geolocation from '@react-native-community/geolocation';

@inject('authStore')
@inject('detailsStore')
@observer
class DeliveryAreaScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newMarkerPosition: null,
      ready: false,
    };

    const {coordinates} = this.props.detailsStore.storeDetails;
    console.log(coordinates);

    if (coordinates) {
      const {_latitude, _longitude} = coordinates;
      this.state.markerPosition = {latitude: _latitude, longitude: _longitude};
    }
  }

  componentDidMount() {
    const {coordinates} = this.props.detailsStore.storeDetails;

    if (!coordinates) {
      console.log('setInitialMarkerPosition');
      this.setInitialMarkerPosition();
    } else {
      this.setState({ready: true});
    }
  }

  async setInitialMarkerPosition() {
    await Geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          markerPosition: {
            latitude: parseFloat(position.coords.latitude),
            longitude: parseFloat(position.coords.longitude),
          },
          ready: true,
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
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ).then((granted) => {
      console.log(granted); // just to ensure that permissions were granted
    });
  };

  setMarkerPosition(e) {
    this.setState({newMarkerPosition: e.nativeEvent.coordinate});
  }

  handleSetStoreLocation() {
    const {updateCoordinates} = this.props.detailsStore;
    const {merchantId} = this.props.authStore;
    const {markerPosition, newMarkerPosition} = this.state;

    if (!newMarkerPosition) {
      console.log('markerPosition');
      updateCoordinates(
        merchantId,
        markerPosition.latitude,
        markerPosition.longitude,
      );
    } else {
      updateCoordinates(
        merchantId,
        newMarkerPosition.latitude,
        newMarkerPosition.longitude,
      );
    }
  }

  render() {
    const {navigation} = this.props;
    const {markerPosition, ready} = this.state;

    return (
      <View style={StyleSheet.absoluteFillObject}>
        <StatusBar translucent backgroundColor="transparent" />

        {ready && (
          <MapView
            style={{flex: 1}}
            ref={(map) => {
              this.map = map;
            }}
            showsUserLocation
            followsUserLocation
            onMapReady={() => {
              this._onMapReady();
            }}
            initialRegion={{
              ...markerPosition,
              latitudeDelta: 0.04,
              longitudeDelta: 0.05,
            }}>
            <Marker
              draggable
              coordinate={markerPosition}
              onDrag={(e) => this.setMarkerPosition(e)}
            />
            <Circle
              center={markerPosition}
              radius={10000}
              fillColor="rgba(233, 30, 99, 0.3)"
              strokeColor="rgba(0,0,0,0.5)"
              zIndex={2}
              strokeWidth={2}
            />
          </MapView>
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
            bottom: '30%',
          }}>
          <Button
            onPress={() => this.handleSetStoreLocation()}
            style={{borderRadius: 24, overflow: 'hidden', top: '100%'}}>
            <Text>Update Store Location</Text>
          </Button>
        </View>
      </View>
    );
  }
}
export default DeliveryAreaScreen;
