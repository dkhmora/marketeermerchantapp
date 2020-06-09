import React, {Component} from 'react';
import MapView, {Circle, Marker} from 'react-native-maps';
import {View, StatusBar, StyleSheet, PermissionsAndroid} from 'react-native';
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
      newMarkerPosition: null,
      ready: false,
      editMode: false,
    };

    const {coordinates, deliveryRadius} = this.props.detailsStore.storeDetails;

    if (coordinates) {
      const {_latitude, _longitude} = coordinates;
      this.state.markerPosition = {latitude: _latitude, longitude: _longitude};
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

      this.setState({markerPosition: this.state.newMarkerPosition});
    }
    this.setState({editMode: false});
  }

  handleCancelChanges() {
    this.setState({
      newMarkerPosition: this.state.markerPosition,
      editMode: false,
    });
    this.markerRef.current.animateMarkerToCoordinate(this.state.markerPosition);
  }

  render() {
    const {navigation} = this.props;
    const {markerPosition, radius, ready, editMode} = this.state;

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
              ref={this.markerRef}
              draggable={this.state.editMode}
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
              onPress={() => this.setState({editMode: true})}
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
