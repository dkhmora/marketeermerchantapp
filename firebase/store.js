import firestore from '@react-native-firebase/firestore';
import {merchantDocId} from './auth';

const merchantCollection = firestore().collection('merchants');

const storeDetails = () => {
  console.log(merchantDocId);
};

const getStoreItems = async (merchantId) => {
  await firestore()
    .collection('merchants')
    .doc(merchantId)
    .collection('items')
    .get()
    .then((querySnapshot) => {
      const data = [];
      console.log('Total users: ', querySnapshot.size);

      querySnapshot.forEach((documentSnapshot) => {
        data.push(documentSnapshot.data());
      });
      return data;
    });
};

export {storeDetails, getStoreItems};
