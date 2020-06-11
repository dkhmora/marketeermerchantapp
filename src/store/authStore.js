import {observable, action} from 'mobx';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

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
    messaging()
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
    messaging()
      .getToken()
      .then((token) =>
        fcmCollection
          .doc(this.merchantId)
          .update('fcmTokens', firestore.FieldValue.arrayUnion(token)),
      )
      .catch((err) => console.log(err));
  }

  @action async unsubscribeToNotifications() {
    messaging()
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
