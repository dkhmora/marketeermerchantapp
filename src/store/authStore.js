import {observable, action, computed} from 'mobx';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import Toast from '../components/Toast';

class AuthStore {
  @observable appReady = true;

  @computed get userEmail() {
    return auth().currentUser.email;
  }

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
          Toast({
            text: 'Error, invalid password. No details have been changed.',
            type: 'danger',
          });
        }

        if (err.code === 'auth/wrong-password') {
          Toast({
            text: 'Error, wrong password. Please try again.',
            type: 'danger',
          });
        }

        console.log(err.message);
      });
  }
}

export default AuthStore;
