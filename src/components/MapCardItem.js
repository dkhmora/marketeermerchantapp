import {CardItem} from 'native-base';
import React, {Component} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {View, Image} from 'react-native';
import {inject, observer} from 'mobx-react';
import {Icon} from 'react-native-elements';
import {colors} from '../../assets/colors';
import FastImage from 'react-native-fast-image';

@inject('ordersStore')
@inject('detailsStore')
@observer
class MapCardItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onMapReady() {
    this.fitMarkers();

    this.customerMarker.showCallout();
  }

  fitMarkers() {
    const {selectedOrder} = this.props.ordersStore;
    const {storeDetails} = this.props.detailsStore;

    this.map.fitToCoordinates(
      [
        {
          latitude: selectedOrder.deliveryCoordinates.latitude,
          longitude: selectedOrder.deliveryCoordinates.longitude,
        },
        {
          latitude: storeDetails.storeLocation.latitude,
          longitude: storeDetails.storeLocation.longitude,
        },
      ],
      {
        edgePadding: {left: 40, right: 40, top: 100, bottom: 100},
        animated: true,
      },
    );
  }

  render() {
    const {selectedOrder} = this.props.ordersStore;
    const {storeDetails} = this.props.detailsStore;
    const {
      onTouchStart,
      onTouchEnd,
      onTouchCancel,
      riderCoordinates,
      vehicleType,
    } = this.props;
    console.log(riderCoordinates);

    return (
      <CardItem
        style={{
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}>
        <View style={{flex: 1, borderRadius: 10, overflow: 'hidden'}}>
          <MapView
            onTouchStart={() => onTouchStart()}
            onTouchEnd={() => onTouchEnd()}
            onTouchCancel={() => onTouchCancel()}
            provider="google"
            style={{
              height: 300,
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

            {riderCoordinates && (
              <Marker
                ref={(marker) => {
                  this.riderMarker = marker;
                }}
                image={
                  vehicleType === 'Motorbike'
                    ? require('../../assets/images/motorbike.png')
                    : require('../../assets/images/car.png')
                }
                style={{width: 26, height: 28}}
                title="Rider Location"
                tracksViewChanges={false}
                coordinate={riderCoordinates}
              />
            )}
          </MapView>
        </View>
      </CardItem>
    );
  }
}

export default MapCardItem;
