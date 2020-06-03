import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';

class DetailsStore {
  @observable storeDetails = {};

  @action setStoreDetails(merchantId) {
    firestore()
      .collection('merchants')
      .doc(merchantId)
      .onSnapshot((documentSnapshot) => {
        this.storeDetails = documentSnapshot.data();
      });
  }
}

export default DetailsStore;
