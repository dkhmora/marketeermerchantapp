import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';

class DetailsStore {
  @observable storeDetails = {};
  @observable storeCategories = [];

  @action setStoreDetails(merchantId) {
    firestore()
      .collection('merchants')
      .doc(merchantId)
      .onSnapshot((documentSnapshot) => {
        this.storeDetails = documentSnapshot.data();
        this.storeCategories = documentSnapshot.data().itemCategories;
        console.log(this.storeDetails);
      });
  }
}

export default DetailsStore;
