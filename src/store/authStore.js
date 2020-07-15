import {observable, action} from 'mobx';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

const fcmCollection = firestore().collection('merchant_fcm');
class AuthStore {
  @observable subscribedToNotifications = false;
  @observable unsubscribeCheckOrderNotificationStatus = null;
  @observable appReady = true;

  @action async signIn(email, password) {
    return await auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => console.log('signed in succesfully'))
      .catch((err) => console.log(err));
  }

  @action async signOut() {
    return await messaging()
      .deleteToken()
      .then(() => {
        auth().signOut();
      });
  }

  @action checkNotificationSubscriptionStatus(merchantId) {
    this.unsubscribeCheckOrderNotificationStatus = firestore()
      .collection('merchant_fcm')
      .doc(merchantId)
      .onSnapshot(async (documentSnapshot) => {
        if (documentSnapshot) {
          if (documentSnapshot.exists) {
            const token = await messaging().getToken();

            if (documentSnapshot.data().fcmTokens.includes(token)) {
              this.subscribedToNotifications = true;
            } else {
              this.subscribedToNotifications = false;
            }
          }
        }
      });
  }

  @action async subscribeToNotifications(merchantId) {
    let authorizationStatus = null;

    if (Platform.OS === 'ios') {
      authorizationStatus = await messaging().requestPermission();
    } else {
      authorizationStatus = true;
    }

    if (!this.subscribedToNotifications) {
      if (authorizationStatus) {
        await messaging()
          .getToken()
          .then((token) => {
            fcmCollection
              .doc(merchantId)
              .update('fcmTokens', firestore.FieldValue.arrayUnion(token));
          })
          .catch((err) => console.log(err));
      }
    }
  }

  @action async unsubscribeToNotifications(merchantId) {
    if (this.subscribedToNotifications) {
      await messaging()
        .getToken()
        .then((token) =>
          fcmCollection
            .doc(merchantId)
            .update('fcmTokens', firestore.FieldValue.arrayRemove(token)),
        )
        .catch((err) => console.log(err));
    }
  }
}

export default AuthStore;
