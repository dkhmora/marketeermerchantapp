import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';

class ItemsStore {
  @observable storeItems = [];
  @observable categoryItems = new Map();

  @action setCategoryItems(category) {
    console.log('setCategoryItems', this.storeItems);
    const items = this.storeItems.filter((item) => item.category === category);
    this.categoryItems.set(category, items);
    console.log('sa cat', this.categoryItems.get('Fruit'));
  }

  @action setStoreItems(merchantId, categories) {
    firestore()
      .collection('merchant_items')
      .doc(merchantId)
      .onSnapshot((documentSnapshot) => {
        this.storeItems = documentSnapshot.data().items;
        console.log('snapshot', this.storeItems);
        categories.map((category) => {
          this.setCategoryItems(category);
        });
      });
  }
}

export default ItemsStore;
