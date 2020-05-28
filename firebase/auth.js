// Firebase Auth Functions
import auth from '@react-native-firebase/auth';

function signIn(email, password) {
  auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) =>
      console.log(
        `User Account with email: ${userCredential.user.email} successfully logged in!`,
      ),
    )
    .catch((err) => {
      console.error(`Error: Something went wrong - ${err}`);
    });
}

export {signIn};
