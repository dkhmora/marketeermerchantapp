import {observable, action, computed} from 'mobx';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import Toast from '../components/Toast';
import firebase from '@react-native-firebase/app';

const functions = firebase.app().functions('asia-northeast1');
class AuthStore {
  @observable appReady = true;

  @computed get userEmail() {
    return auth().currentUser.email;
  }

  @action async signIn(email, password) {
    return await auth()
      .signInWithEmailAndPassword(email, password)
      .catch((err) =>
        Toast({text: err.message, type: 'danger', duration: 5000}),
      );
  }

  @action async signOut() {
    return await messaging()
      .deleteToken()
      .then(() => {
        return auth().signOut();
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger', duration: 5000});
      });
  }

  @action async resetPassword(email) {
    return await functions
      .httpsCallable('sendPasswordResetLinkToStoreUser')({email})
      .then((response) => {
        if (response.data.s === 200) {
          return Toast({text: response.data.m, duration: 5000});
        }

        return Toast({text: response.data.m, type: 'danger', duration: 5000});
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger', duration: 5000});
      });
  }

  @action async changePassword({currentPassword, newPassword}) {
    const currentUser = auth().currentUser;

    const recentCredentials = auth.EmailAuthProvider.credential(
      currentUser.email,
      currentPassword,
    );

    await currentUser
      .reauthenticateWithCredential(recentCredentials)
      .then(() => {
        currentUser.updatePassword(newPassword);
      })
      .then(() => {
        Toast({text: 'Successfully changed password!'});
      })
      .catch((err) => {
        if (err.code === 'auth/invalid-password') {
          return Toast({
            text: 'Error, invalid password. No details have been changed.',
            type: 'danger',
          });
        }

        if (err.code === 'auth/wrong-password') {
          return Toast({
            text: 'Error, wrong password. Please try again.',
            type: 'danger',
          });
        }

        return Toast({
          text: err.message,
          type: 'danger',
        });
      });
  }
}

export default AuthStore;
