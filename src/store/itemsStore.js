import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';
import Toast from '../components/Toast';
import {v4 as uuidv4} from 'uuid';
import {persist} from 'mobx-persist';

const functions = firebase.app().functions('asia-northeast1');
class ItemsStore {
  @persist('list') @observable storeItems = [];
  @persist @observable maxItemsUpdatedAt = 0;
  @observable itemCategories = [];
  @observable categoryItems = new Map();
  @observable unsubscribeSetStoreItems = null;
  @observable editItemModal = false;
  @observable selectedItem = null;

  @action async editItem(merchantId, newItem, additionalStock) {
    const item = this.selectedItem;
    const merchantItemsRef = firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('items')
      .doc(item.doc);
    const timeStamp = firestore.Timestamp.now().toMillis();

    const fileExtension = newItem.image ? newItem.image.split('.').pop() : null;
    const imageRef = newItem.image
      ? `/images/merchants/${merchantId}/items/${item.itemId}_${timeStamp}.${fileExtension}`
      : null;

    if (newItem.image) {
      await this.uploadImage(imageRef, newItem.image);
    }

    return firestore().runTransaction(async (transaction) => {
      const merchantItemsDocument = await transaction.get(merchantItemsRef);

      if (merchantItemsDocument.exists) {
        let dbItems = [...merchantItemsDocument.data().items];

        const dbItemIndex = dbItems.findIndex(
          (dbItem) => item.itemId === dbItem.itemId,
        );

        if (dbItemIndex >= 0) {
          dbItems[dbItemIndex].stock += additionalStock;
          dbItems[dbItemIndex].name = newItem.name;
          dbItems[dbItemIndex].description = newItem.description;
          dbItems[dbItemIndex].price = newItem.price;
          dbItems[dbItemIndex].category = newItem.category;
          dbItems[dbItemIndex].unit = newItem.unit;
          dbItems[dbItemIndex].updatedAt = timeStamp;

          if (newItem.image) {
            dbItems[dbItemIndex].image = imageRef;
          }

          await dbItems.sort((a, b) => a.name > b.name);

          transaction.update(merchantItemsRef, {
            items: dbItems,
            updatedAt: timeStamp,
          });

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

  @action setStoreItems(merchantId, itemCategories) {
    //this.maxItemsUpdatedAt = 0;
    //this.storeItems = [];
    this.unsubscribeSetStoreItems = firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('items')
      .where('updatedAt', '>', this.maxItemsUpdatedAt)
      .orderBy('updatedAt', 'desc')
      .onSnapshot(async (querySnapshot) => {
        if (!querySnapshot.empty) {
          await querySnapshot.docChanges().forEach(async (change, index) => {
            const newItems = change.doc.data().items;

            if (this.storeItems.length > 0) {
              this.storeItems = await this.storeItems.filter(
                (storeItem) => storeItem.doc !== change.doc.id,
              );
            }

            await this.storeItems.push(...newItems);

            if (change.doc.data().updatedAt > this.maxItemsUpdatedAt) {
              this.maxItemsUpdatedAt = change.doc.data().updatedAt;
            }
          });

          this.storeItems = await this.storeItems
            .slice()
            .sort((a, b) => a.name > b.name);

          itemCategories.map((category) => {
            this.setCategoryItems(category);
          });
        }
        this.storeItems = await this.storeItems
          .slice()
          .sort((a, b) => a.name > b.name);

        itemCategories.map((category) => {
          this.setCategoryItems(category);
        });

        this.itemCategories = itemCategories;
      });
  }

  @action async uploadImage(imageRef, imagePath) {
    if (imageRef && imagePath) {
      return await storage()
        .ref(imageRef)
        .putFile(imagePath)
        .then(() => console.log('Image successfully uploaded!'))
        .catch((err) => console.error(err));
    }
  }

  @action async addStoreItem(merchantId, item, imagePath) {
    const itemId = uuidv4();
    const timeStamp = firestore.Timestamp.now().toMillis();

    const fileExtension = imagePath ? imagePath.split('.').pop() : null;
    const imageRef = imagePath
      ? `/images/merchants/${merchantId}/items/${itemId}_${timeStamp}.${fileExtension}`
      : null;
    const itemExists = this.storeItems
      .slice()
      .findIndex((existingItem) => existingItem.name === item.name);

    const newItem = {
      ...item,
      image: imageRef,
      itemId,
      createdAt: timeStamp,
      updatedAt: timeStamp,
    };

    if (itemExists === -1) {
      return await this.uploadImage(imageRef, imagePath).then(async () => {
        return await functions
          .httpsCallable('addStoreItem')({item: JSON.stringify(newItem)})
          .then((response) => {
            if (response.data.s === 200) {
              Toast({
                text: `"${newItem.name}" successfully added to Item List!`,
                buttonText: 'Okay',
              });
            } else {
              Toast({
                text: `Error: ${response.data.m} (${response.data.s})!`,
                type: 'danger',
              });
            }

            return response.data;
          })
          .catch((err) => {
            Toast({
              text: `Error: ${err}!`,
              type: 'danger',
            });
          });
      });
    } else {
      return Toast({
        text: `Error: You already have an item named "${newItem.name}"!`,
        type: 'danger',
      });
    }
  }

  /*
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
    const itemId = uuidv4();
    const merchantItemsRef = firestore()
      .collection('merchant_items')
      .doc(merchantId);
    const timeStamp = firestore.Timestamp.now().toMillis();

    const fileExtension = imagePath ? imagePath.split('.').pop() : null;
    const imageRef = imagePath
      ? `/images/merchants/${merchantId}/items/${itemId}_${timeStamp}.${fileExtension}`
      : null;
    const itemExists = this.storeItems
      .slice()
      .findIndex((item) => item.name === name);

    if (itemExists === -1) {
      return await this.uploadImage(imageRef, imagePath)
        .then(async () => {
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
              updatedAt: timeStamp,
              createdAt: timeStamp,
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
  */

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
      .collection('merchants')
      .doc(merchantId)
      .collection('items')
      .doc(item.doc);

    return await firestore().runTransaction((transaction) => {
      const timeStamp = firestore.Timestamp.now().toMillis();
      const merchantItems = transaction.get(merchantItemsRef).data().items;

      const itemSnapshot = merchantItems.find(
        (merchantItem) => merchantItem.itemId === item.itemId,
      );

      transaction.update(merchantItemsRef, {
        items: firestore.FieldValue.arrayRemove(itemSnapshot),
        updatedAt: timeStamp,
      });
    });
  }
}

export default ItemsStore;
