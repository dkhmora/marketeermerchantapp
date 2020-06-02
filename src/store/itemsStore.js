import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';

class ItemsStore {
  @observable storeItems = [];
  @computed categoryItems(category) {
    return this.storeItems.filter((item) => item.category === category);
  }

  @action setCategoryItems(merchantId) {
    firestore()
      .collection('merchant_items')
      .doc(merchantId)
      .onSnapshot((documentSnapshot) => {
        this.storeItems = documentSnapshot.data();
        console.log(this.storeItems);
      });
  }
}

export default ItemsStore;
