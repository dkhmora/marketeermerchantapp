import {observable, action} from 'mobx';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

class AuthStore {
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
}

export default AuthStore;
