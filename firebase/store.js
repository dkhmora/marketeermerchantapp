import firestore from '@react-native-firebase/firestore';

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
        setStoreDetails(data);
      } else {
        setCategories(data.item_categories);
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

async function addStoreItem(
  merchantId,
  category,
  name,
  description,
  unit,
  price,
  stock,
) {
  await firestore()
    .collection('merchants')
    .doc(merchantId)
    .collection('items')
    .add({category, name, description, unit, price, stock})
    .then(() => console.log('Item added!'));
}

export {getStoreDetails, getStoreItems, addStoreItem};
