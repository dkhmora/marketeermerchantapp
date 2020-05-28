// Firebase Auth Functions
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

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

const merchantDocId = firestore()
  .collection('merchant_users')
  .where(auth().currentUser.uid, '==', true)
  .get()
  .then((snapshot) => {
    if (snapshot.empty) {
      auth().signOut();
      console.log('Error: The user does not match with any merchants');
    } else {
      snapshot.forEach((doc) => {
        return doc.id;
      });
    }
  });

export {signIn, signOut, merchantDocId};
