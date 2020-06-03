import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

async function getStoreDetails(
  merchantId,
  {setStoreDetails, setCategories, setLoading},
) {
  await firestore()
    .collection('merchants')
    .doc(merchantId)
    .get()
    .then((doc) => {
      return doc.data();
    })
    .then((data) => {
      if (setStoreDetails) {
        setStoreDetails({
          deliveryDescription: data.deliveryDescription,
          storeDescription: data.storeDescription,
          storeImageUrl: data.storeImageUrl,
          storeName: data.storeName,
          visible: data.visible,
        });
      } else {
        setCategories(data.itemCategories);
      }
    })
    .then(() => {
      if (setLoading) {
        setLoading(false);
      }
    })
    .catch((err) => console.error(err));
}

async function getStoreItems(merchantId, {setItems, setLoading}) {
  await firestore()
    .collection('merchants')
    .doc(merchantId)
    .collection('items')
    .get()
    .then((querySnapshot) => {
      const data = [];
      console.log('Total number of items: ', querySnapshot.size);

      querySnapshot.forEach((documentSnapshot) => {
        data.push(documentSnapshot.data());
      });
      return data;
    })
    .then((data) => setItems(data))
    .then(() => {
      if (setLoading) {
        setLoading(false);
      }
    })
    .catch((err) => console.error(err));
}

async function uploadImage(imageRef, imagePath) {
  await storage()
    .ref(imageRef)
    .putFile(imagePath)
    .then(() => console.log('Image successfully uploaded!'))
    .catch((err) => console.error(err));
}

async function addStoreItem(
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
    .collection('merchants')
    .doc(merchantId)
    .collection('items');
  await merchantItemsRef
    .add({category, name, description, unit, price, stock})
    .then((doc) => {
      const docId = doc.id;
      const fileExtension = imagePath.split('.').pop();
      const imageRef = `/images/merchants/${merchantId}/items/${docId}.${fileExtension}`;
      uploadImage(imageRef, imagePath);
      return {imageRef, docId};
    })
    .then((image) => {
      merchantItemsRef.doc(image.docId).update({imageUrl: image.imageRef});
    })
    .then(() => console.log('Item added!'))
    .catch((err) => console.error(err));
}

export {getStoreDetails, getStoreItems, addStoreItem};
