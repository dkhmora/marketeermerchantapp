import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';
import Toast from '../components/Toast';
import {v4 as uuidv4} from 'uuid';
import {persist} from 'mobx-persist';
import crashlytics from '@react-native-firebase/crashlytics';

const functions = firebase.app().functions('asia-northeast1');
const publicStorageBucket = firebase.app().storage('gs://marketeer-public');
class ItemsStore {
  @persist('list') @observable storeItems = [];
  @observable categoryItems = new Map();
  @observable unsubscribeSetStoreItems = null;
  @observable editItemModal = false;
  @observable selectedItem = null;
  @observable loaded = false;

  @action async editItem(
    storeId,
    item,
    additionalStock,
    itemOptions,
    imagePath,
  ) {
    const storeItemsRef = firestore()
      .collection('stores')
      .doc(storeId)
      .collection('items')
      .doc(item.doc);
    const timeStamp = firestore.Timestamp.now().toMillis();

    const fileExtension = imagePath ? imagePath.split('.').pop() : null;
    const imageRef = imagePath
      ? `/images/stores/${storeId}/items/${item.itemId}_${timeStamp}.${fileExtension}`
      : null;

    if (imagePath) {
      await this.uploadImage(imageRef, imagePath);
    }

    return firestore()
      .runTransaction(async (transaction) => {
        const storeItemsDocument = await transaction.get(storeItemsRef);

        if (storeItemsDocument.exists) {
          let dbItems = [...storeItemsDocument.data().items];

          const dbItemIndex = dbItems.findIndex(
            (dbItem) => item.itemId === dbItem.itemId,
          );

          if (dbItemIndex >= 0) {
            item.updatedAt = timeStamp;
            item.stock = Math.max(0, additionalStock + item.stock);

            if (imagePath) {
              item.image = imageRef;
            }

            if (itemOptions) {
              item.options = itemOptions;
            }

            dbItems[dbItemIndex] = item;

            await dbItems.sort((a, b) => a.name > b.name);

            transaction.update(storeItemsRef, {
              items: dbItems,
              updatedAt: timeStamp,
            });
          } else {
            Toast({
              text: 'Error: Item was not found.',
              type: 'danger',
              duration: 10000,
            });
          }
        }
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action setCategoryItems(category) {
    const items = this.storeItems.filter((item) => item.category === category);

    this.categoryItems.set(category, items);
  }

  @action async deleteItemCategory(storeId, category) {
    const storeItemsRef = firestore().collection('stores').doc(storeId);

    await storeItemsRef
      .update('itemCategories', firestore.FieldValue.arrayRemove(category))
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  @action async addItemCategory(storeId, newCategory) {
    const formattedCategory = _.capitalize(newCategory);

    await firestore()
      .collection('stores')
      .doc(storeId)
      .get()
      .then((documentSnapshot) => {
        if (
          (documentSnapshot.data().itemCategories &&
            !documentSnapshot
              .data()
              .itemCategories.includes(formattedCategory)) ||
          !documentSnapshot.data().itemCategories
        ) {
          documentSnapshot.ref.update(
            'itemCategories',
            firestore.FieldValue.arrayUnion(formattedCategory),
          );
        } else {
          Toast({text: `${formattedCategory} already exists`, type: 'danger'});
        }
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action setStoreItems(storeId, itemCategories) {
    this.unsubscribeSetStoreItems = firestore()
      .collection('stores')
      .doc(storeId)
      .collection('items')
      .orderBy('updatedAt', 'desc')
      .onSnapshot(async (querySnapshot) => {
        if (querySnapshot && !querySnapshot.empty) {
          await new Promise((res, rej) => {
            querySnapshot.docChanges().forEach(async (change, index) => {
              const newItems = change.doc.data().items;

              await new Promise((resolve, reject) => {
                this.storeItems = this.storeItems.filter(
                  (storeItem) => storeItem.doc !== change.doc.id,
                );

                resolve();
              })
                .then(() => {
                  this.storeItems.push(...newItems);
                })
                .then(() => {
                  res();
                });
            });
          })
            .then(async () => {
              this.storeItems = await this.storeItems
                .slice()
                .sort((a, b) => a.name > b.name);
            })
            .then(async () => {
              await itemCategories.map((category) => {
                this.setCategoryItems(category);
              });
            })
            .then(() => {
              this.loaded = true;
            });
        } else {
          this.loaded = true;
        }
      });
  }

  @action async uploadImage(imageRef, imagePath) {
    if (imageRef && imagePath) {
      return await publicStorageBucket
        .ref(imageRef)
        .putFile(imagePath)
        .catch((err) => {
          crashlytics().recordError(err);
          Toast({text: err.message, type: 'danger'});
        });
    }
  }

  @action async addStoreItem(storeId, item, itemOptions, imagePath) {
    const itemId = uuidv4();
    const timeStamp = firestore.Timestamp.now().toMillis();

    const fileExtension = imagePath ? imagePath.split('.').pop() : null;
    const imageRef = imagePath
      ? `/images/stores/${storeId}/items/${itemId}_${timeStamp}.${fileExtension}`
      : null;

    let newItem = {
      ...item,
      image: imageRef,
      itemId,
      createdAt: timeStamp,
      updatedAt: timeStamp,
    };

    if (itemOptions) {
      newItem.options = itemOptions;
    }

    if (imagePath) {
      await this.uploadImage(imageRef, imagePath);
    }

    return await await functions
      .httpsCallable('addStoreItem')({
        item: JSON.stringify(newItem),
        storeId,
      })
      .then((response) => {
        if (response.data.s === 200) {
          Toast({
            text: `"${newItem.name}" successfully added to Item List!`,
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
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async deleteImage(image) {
    await publicStorageBucket
      .ref(image)
      .delete()
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async deleteStoreItem(storeId, item) {
    const storeItemsRef = firestore()
      .collection('stores')
      .doc(storeId)
      .collection('items')
      .doc(item.doc);

    return await firestore()
      .runTransaction(async (transaction) => {
        const timeStamp = firestore.Timestamp.now().toMillis();
        const storeItems = (await transaction.get(storeItemsRef)).data().items;

        const itemSnapshot = await storeItems.find(
          (storeItem) => storeItem.itemId === item.itemId,
        );

        transaction.update(storeItemsRef, {
          items: firestore.FieldValue.arrayRemove(itemSnapshot),
          itemNumber: firestore.FieldValue.increment(-1),
          updatedAt: timeStamp,
        });
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }
}

export default ItemsStore;
