import {CardItem} from 'native-base';
import React, {Component} from 'react';
import MapView, {AnimatedRegion, Marker} from 'react-native-maps';
import {Platform, View} from 'react-native';
import {inject, observer} from 'mobx-react';
import {Button, Icon} from 'react-native-elements';
import {colors} from '../../assets/colors';
import Toast from './Toast';

@inject('ordersStore')
@inject('detailsStore')
@observer
class MapCardItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialCourierCoordinates: null,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.courierCoordinates !== prevProps.courierCoordinates) {
      if (!this.state.initialCourierCoordinates) {
        this.setState(
          {
            initialCourierCoordinates: new AnimatedRegion({
              ...this.props.courierCoordinates,
              latitudeDelta: 0,
              longitudeDelta: 0,
            }),
          },
          () => {
            this.fitMarkers();
          },
        );
      } else {
        this.animateMarkerToCoordinate(this.props.courierCoordinates);
      }
    }
  }

  onMapReady() {
    this.fitMarkers();

    this.customerMarker.showCallout();
  }

  fitMarkers() {
    const {selectedOrder} = this.props.ordersStore;
    const {storeDetails} = this.props.detailsStore;
    const {courierCoordinates} = this.props;

    const markerCoordinates = [
      {
        latitude: selectedOrder.deliveryCoordinates.latitude,
        longitude: selectedOrder.deliveryCoordinates.longitude,
      },
      {
        latitude: storeDetails.storeLocation.latitude,
        longitude: storeDetails.storeLocation.longitude,
      },
    ];

    if (courierCoordinates) {
      markerCoordinates.push({
        ...courierCoordinates,
      });
    }

    this.map.fitToCoordinates(markerCoordinates, {
      edgePadding: {left: 40, right: 40, top: 100, bottom: 100},
      animated: true,
    });
  }

  animateMarkerToCoordinate(coordinate) {
    const {initialCourierCoordinates} = this.state;

    if (initialCourierCoordinates) {
      initialCourierCoordinates.timing(coordinate).start();
    }
  }

  render() {
    const {selectedOrder} = this.props.ordersStore;
    const {storeDetails} = this.props.detailsStore;
    const {onTouchStart, onTouchEnd, onTouchCancel, vehicleType} = this.props;
    const {initialCourierCoordinates} = this.state;

    return (
      <CardItem
        style={{
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}>
        <View
          style={{
            flex: 1,
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
            overflow: 'hidden',
          }}
          onTouchStart={() => onTouchStart()}
          onTouchEnd={() => onTouchEnd()}
          onTouchCancel={() => onTouchCancel()}>
          <MapView
            provider="google"
            style={{
              height: 400,
              width: '100%',
            }}
            ref={(map) => {
              this.map = map;
            }}
            onMapReady={() => this.onMapReady()}
            initialRegion={{
              latitude: selectedOrder.deliveryCoordinates.latitude,
              longitude: selectedOrder.deliveryCoordinates.longitude,
              latitudeDelta: 0.009,
              longitudeDelta: 0.009,
            }}>
            {selectedOrder.deliveryCoordinates.latitude &&
              selectedOrder.deliveryCoordinates.longitude && (
                <Marker
                  ref={(marker) => {
                    this.customerMarker = marker;
                  }}
                  title="Customer Delivery Location"
                  tracksViewChanges={false}
                  coordinate={{
                    latitude: selectedOrder.deliveryCoordinates.latitude,
                    longitude: selectedOrder.deliveryCoordinates.longitude,
                  }}>
                  <View>
                    <Icon color={colors.accent} name="map-pin" />
                  </View>
                </Marker>
              )}

            {storeDetails.storeLocation.latitude &&
              storeDetails.storeLocation.longitude && (
                <Marker
                  ref={(marker) => {
                    this.storeMarker = marker;
                  }}
                  title={`${storeDetails.storeName} Set Location`}
                  tracksViewChanges={false}
                  coordinate={{
                    latitude: storeDetails.storeLocation.latitude,
                    longitude: storeDetails.storeLocation.longitude,
                  }}>
                  <View>
                    <Icon color={colors.primary} name="map-pin" />
                  </View>
                </Marker>
              )}

            {initialCourierCoordinates && (
              <Marker.Animated
                ref={(marker) => {
                  this.courierMarker = marker;
                }}
                image={
                  vehicleType === 'Motorbike'
                    ? require('../../assets/images/mrspeedy-motorcycle-mapmarker.png')
                    : require('../../assets/images/mrspeedy-car-mapmarker.png')
                }
                style={{width: 26, height: 28}}
                tracksViewChanges={true}
                title="Mr. Speedy Courier Location"
                coordinate={initialCourierCoordinates}
              />
            )}
          </MapView>

          <Button
            onPress={() => this.fitMarkers()}
            icon={<Icon name="map" size={20} color={colors.icons} />}
            containerStyle={{position: 'absolute', right: 5, bottom: 5}}
            buttonStyle={{backgroundColor: colors.primary}}
          />
        </View>
      </CardItem>
    );
  }
}

export default MapCardItem;
