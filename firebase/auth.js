// Firebase Auth Functions
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const merchantsCollection = firestore().collection('merchant_users');

function signIn(email, password) {
  auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log('Successfully signed in!');
    })
    .catch((err) => {
      console.error(`Error: Something went wrong - ${err}`);
    });
}

function signOut() {
  auth()
    .signOut()
    .then(() => {
      console.log('Successfully signed out!');
    });
}

export {signIn, signOut};
