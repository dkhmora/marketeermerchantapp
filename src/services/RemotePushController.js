import {useEffect} from 'react';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

const RemotePushController = (props) => {
  useEffect(() => {
    PushNotification.configure({
      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        // process the notification here
        if (notification.type === 'order_message') {
          const {orderId} = notification;

          props.navigation.navigate('Order Chat', {
            orderId,
          });
        }

        if (notification.type === 'new_order') {
          const {orderId} = notification;

          props.navigation.navigate('Order Details', {
            orderId,
            notification: true,
          });
        }

        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      // Android only: GCM or FCM Sender ID
      senderID: '1549607298',
      popInitialNotification: true,
      requestPermissions: true,
      vibrate: true,
      vibration: 300,
      playSound: true,
      sound: 'default',
    });
  }, [props.navigation]);

  return null;
};

export default RemotePushController;
