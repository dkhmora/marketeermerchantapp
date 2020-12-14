import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';

const functions = firebase.app().functions('asia-northeast1');

console.log(process.env);

if (process.env.DEVMODE === 'true') {
  console.log(
    'Firebase Functions Use Emulator at "http://192.168.86.231:5001"',
  );
  functions.useFunctionsEmulator('http://192.168.86.231:5001');
}

export {functions};
