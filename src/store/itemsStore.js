import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
class ItemsStore {
  @observable storeItems = [];
  @observable itemCategories = [];
  @observable categoryItems = new Map();

  @action setCategoryItems(category) {
    const items = this.storeItems.filter((item) => item.category === category);
    this.categoryItems.set(category, items);
  }

  @action setItemCategories(merchantId) {
    firestore()
      .collection('merchant_items')
      .doc(merchantId)
      .onSnapshot((documentSnapshot) => {
        this.itemCategories = documentSnapshot.data().itemCategories;
      });
  }

  @action addItemCategory(merchantId, newCategory) {
    firestore()
      .collection('merchant_items')
      .doc(merchantId)
      .get()
      .then((documentSnapshot) => {
        if (!documentSnapshot.data().itemCategories.includes(newCategory)) {
          documentSnapshot.ref
            .update(
              'itemCategories',
              firestore.FieldValue.arrayUnion(newCategory),
            )
            .then(() =>
              console.log(`Successfully added new category "${newCategory}"`),
            );
        } else {
          console.error(`${newCategory} already exists`);
        }
      })
      .catch((err) => console.error(err));
  }

  @action setStoreItems(merchantId) {
    firestore()
      .collection('merchant_items')
      .doc(merchantId)
      .onSnapshot((documentSnapshot) => {
        this.storeItems = documentSnapshot.data().items;

        this.itemCategories.map((category) => {
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
          image: imageRef,
          createdAt: new Date().toISOString(),
        }),
      })
      .then(() => {
        this.uploadImage(imageRef, imagePath);
      })
      .then(() => console.log('Item added!'))
      .catch((err) => console.error(err));
  }

  @action async deleteImage(image) {
    await storage()
      .ref(image)
      .delete()
      .then(() => {
        console.log(`Image at ${image} successfully deleted!`);
      });
  }

  @action async deleteStoreItem(
    merchantId,
    category,
    name,
    description,
    unit,
    price,
    stock,
    sales,
    image,
    createdAt,
  ) {
    const merchantItemsRef = firestore()
      .collection('merchant_items')
      .doc(merchantId);

    await merchantItemsRef
      .update(
        'items',
        firestore.FieldValue.arrayRemove({
          category,
          name,
          description,
          unit,
          price,
          stock,
          sales,
          image,
          createdAt,
        }),
      )
      .then(() => console.log('Item deleted!'))
      .catch((err) => console.error(err));
  }
}

export default ItemsStore;
