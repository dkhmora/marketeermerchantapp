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

    const {coordinates} = this.props.detailsStore.storeDetails;
    console.log(coordinates);

    const {_latitude, _longitude} = coordinates;

    this.state = {
      markerPosition: {latitude: _latitude, longitude: _longitude},
      newMarkerPosition: null,
      marginBottom: 1,
      initialRegion: '',
    };
  }

  componentDidMount() {
    const {coordinates} = this.props.detailsStore.storeDetails;

    if (!coordinates) {
      console.log('setInitialMarkerPosition');
      this.setInitialMarkerPosition();
    }
  }

  async setInitialMarkerPosition() {
    await Geolocation.getCurrentPosition(
      (position) => {
        let region = {
          latitude: parseFloat(position.coords.latitude),
          longitude: parseFloat(position.coords.longitude),
        };

        this.setState({markerPosition: {...region}});
      },
      (error) => console.log(error),
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
      this.setState({marginBottom: 0});
      console.log(granted); // just to ensure that permissions were granted
    });
  };

  setMarkerPosition(e) {
    this.setState({newMarkerPosition: e.nativeEvent.coordinate});
  }

  handleSetStoreLocation() {
    const {updateCoordinates} = this.props.detailsStore;
    const {newMarkerPosition} = this.state;

    updateCoordinates(
      this.props.authStore.merchantId,
      newMarkerPosition.latitude,
      newMarkerPosition.longitude,
    );
  }

  render() {
    const {navigation} = this.props;

    const {markerPosition} = this.state;

    return (
      <View style={StyleSheet.absoluteFillObject}>
        <StatusBar translucent backgroundColor="transparent" />

        <MapView
          style={{flex: 1, marginBottom: this.state.marginBottom}}
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
