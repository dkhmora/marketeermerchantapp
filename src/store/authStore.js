import {observable, action} from 'mobx';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

const fcmCollection = firestore().collection('merchant_fcm');
class AuthStore {
  @observable merchantId = '';
  @observable subscribedToNotifications = false;

  @action setMerchantId(id) {
    this.merchantId = id;
  }

  @action async signIn(email, password) {
    await auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => console.log('signed in succesfully'))
      .catch((err) => console.log(err));
  }

  @action async signOut() {
    await auth().signOut();
  }

  @action async checkNotificationSubscriptionStatus() {
    await messaging()
      .getToken()
      .then((token) =>
        fcmCollection
          .doc(this.merchantId)
          .get()
          .then((document) => {
            if (document.data().fcmTokens.includes(token)) {
              this.subscribedToNotifications = true;
            } else {
              this.subscribedToNotifications = false;
            }
          }),
      );
  }

  @action async subscribeToNotifications() {
    if (Platform.OS === 'ios') {
      const authorizationStatus = await messaging().requestPermission();

      if (authorizationStatus) {
        console.log('Permission status:', authorizationStatus);
        await messaging()
          .getToken()
          .then((token) =>
            fcmCollection
              .doc(this.merchantId)
              .get()
              .then((document) => {
                if (document.exists) {
                  fcmCollection
                    .doc(this.merchantId)
                    .update(
                      'fcmTokens',
                      firestore.FieldValue.arrayUnion(token),
                    );
                } else {
                  fcmCollection.doc(this.merchantId).set({fcmTokens: [token]});
                }
              }),
          )
          .catch((err) => console.log(err));
      }
    } else {
      await messaging()
        .getToken()
        .then((token) =>
          fcmCollection
            .doc(this.merchantId)
            .update('fcmTokens', firestore.FieldValue.arrayUnion(token)),
        )
        .catch((err) => console.log(err));
    }
  }

  @action async unsubscribeToNotifications() {
    await messaging()
      .getToken()
      .then((token) =>
        fcmCollection
          .doc(this.merchantId)
          .update('fcmTokens', firestore.FieldValue.arrayRemove(token)),
      )
      .catch((err) => console.log(err));
  }
}

export default AuthStore;
