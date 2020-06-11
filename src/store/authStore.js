import {observable, action} from 'mobx';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
class AuthStore {
  @observable merchantId = 'testest';

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

  @action async subscribeToNotifications() {
    const fcmCollection = firestore().collection('merchant_fcm');

    messaging()
      .getToken()
      .then((value) =>
        fcmCollection
          .doc(this.props.authStore.merchantId)
          .update('fcmTokens', firestore.FieldValue.arrayUnion(value)),
      );
  }
}

export default AuthStore;
