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

function signOut({navigation}) {
  auth()
    .signOut()
    .then(() => {
      console.log(navigation.dangerouslyGetParent());
      navigation.navigate('Auth');
      console.log('Successfully signed out!');
    });
}

export {signIn, signOut};
