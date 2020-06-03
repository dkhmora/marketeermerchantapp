import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
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

  @action async uploadImage(imageRef, imagePath) {
    await storage()
      .ref(imageRef)
      .putFile(imagePath)
      .then(() => console.log('Image successfully uploaded!'))
      .catch((err) => console.error(err));
  }

  @action async addStoreItem(
    merchantId,
    imagePath,
    category,
    name,
    description,
    unit,
    price,
    stock,
  ) {
    const merchantItemsRef = firestore()
      .collection('merchant_items')
      .doc(merchantId);

    const fileExtension = imagePath.split('.').pop();
    const imageRef = `/images/merchants/${merchantId}/items/${name}.${fileExtension}`;

    await merchantItemsRef
      .update({
        items: firestore.FieldValue.arrayUnion({
          category,
          name,
          description,
          unit,
          price,
          stock,
          sales: 0,
          image: `/images/merchants/${merchantId}/items/${name}.${fileExtension}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      })
      .then(() => {
        this.uploadImage(imageRef, imagePath);
      })
      .then(() => console.log('Item added!'))
      .catch((err) => console.error(err));
  }
}

export default ItemsStore;
