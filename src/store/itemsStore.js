import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Toast from '../components/Toast';
import {v4 as uuidv4} from 'uuid';
class ItemsStore {
  @observable storeItems = [];
  @observable itemCategories = [];
  @observable categoryItems = new Map();
  @observable unsubscribeSetStoreItems = null;
  @observable changeStockModal = false;
  @observable selectedItem = null;

  @action async changeStock(merchantId, item, newStock) {
    const merchantItemsRef = firestore()
      .collection('merchant_items')
      .doc(merchantId);
    const newItem = {...item};
    newItem.stock = newStock;
    newItem.updatedAt = firestore.Timestamp.now().toMillis();

    return firestore().runTransaction(async (transaction) => {
      const merchantItemsDocument = await transaction.get(merchantItemsRef);

      if (merchantItemsDocument.exists) {
        let dbItems = [...merchantItemsDocument.data().items];

        const dbItemIndex = dbItems.findIndex(
          (dbItem) => item.itemId === dbItem.itemId,
        );

        if (dbItemIndex >= 0) {
          dbItems[dbItemIndex] = newItem;

          await transaction.update(merchantItemsRef, {items: dbItems});

          Toast({
            text: `Successfully updated ${item.name}'s stock!`,
          });
        } else {
          Toast({
            text: 'Error: Item was not found.',
            type: 'danger',
            duration: 10000,
          });
        }
      }
    });
  }

  @action setCategoryItems(category) {
    const items = this.storeItems.filter((item) => item.category === category);

    this.categoryItems.set(category, items);
  }

  @action async deleteItemCategory(merchantId, category) {
    const merchantItemsRef = firestore()
      .collection('merchant_items')
      .doc(merchantId);

    await merchantItemsRef
      .update('itemCategories', firestore.FieldValue.arrayRemove(category))
      .then(() => console.log('Item deleted!'))
      .catch((err) => console.error(err));
  }

  @action async addItemCategory(merchantId, newCategory) {
    const formattedCategory = _.capitalize(newCategory);

    await firestore()
      .collection('merchant_items')
      .doc(merchantId)
      .get()
      .then((documentSnapshot) => {
        if (
          !documentSnapshot.data().itemCategories.includes(formattedCategory)
        ) {
          documentSnapshot.ref
            .update(
              'itemCategories',
              firestore.FieldValue.arrayUnion(formattedCategory),
            )
            .then(() =>
              console.log(
                `Successfully added new category "${formattedCategory}"`,
              ),
            );
        } else {
          console.error(`${formattedCategory} already exists`);
        }
      })
      .catch((err) => console.error(err));
  }

  @action setStoreItems(merchantId) {
    this.unsubscribeSetStoreItems = firestore()
      .collection('merchant_items')
      .doc(merchantId)
      .onSnapshot((documentSnapshot) => {
        this.storeItems = documentSnapshot.data().items;
        this.itemCategories = documentSnapshot.data().itemCategories;

        documentSnapshot.data().itemCategories.map((category) => {
          this.setCategoryItems(category);
        });
      });
  }

  @action async uploadImage(imageRef, imagePath) {
    return await storage()
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
    const fileExtension = imagePath ? imagePath.split('.').pop() : null;
    const imageRef = imagePath
      ? `/images/merchants/${merchantId}/items/${name}.${fileExtension}`
      : null;
    const itemExists = this.storeItems
      .slice()
      .findIndex((item) => item.name === name);

    if (itemExists === -1) {
      return await this.uploadImage(imageRef, imagePath)
        .then(async () => {
          const timestampNow = firestore.Timestamp.now().toMillis();
          const itemId = uuidv4();

          await merchantItemsRef.update({
            items: firestore.FieldValue.arrayUnion({
              category,
              name,
              description,
              unit,
              price,
              stock,
              sales: 0,
              image: imageRef,
              itemId,
              updatedAt: timestampNow,
              createdAt: timestampNow,
            }),
          });
        })
        .then(() =>
          Toast({
            text: `"${name}" successfully added to Item List!`,
            buttonText: 'Okay',
          }),
        )
        .catch((err) => console.error(err));
    } else {
      return Toast({
        text: `Error: You already have an item named "${name}"!`,
        type: 'danger',
      });
    }
  }

  @action async deleteImage(image) {
    await storage()
      .ref(image)
      .delete()
      .then(() => {
        console.log(`Image at ${image} successfully deleted!`);
      });
  }

  @action async deleteStoreItem(merchantId, item) {
    const merchantItemsRef = firestore()
      .collection('merchant_items')
      .doc(merchantId);

    await merchantItemsRef
      .update('items', firestore.FieldValue.arrayRemove(item))
      // .then(() =>  this.deleteImage(item.image)) TODO: Create crontask to auto delete unused item images after a period of time
      .then(() => console.log('Item deleted!'))
      .catch((err) => console.error(err));
  }
}

export default ItemsStore;
