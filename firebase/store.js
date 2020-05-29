import firestore from '@react-native-firebase/firestore';

async function getStoreDetails(merchantId, {setStoreDetails, setLoading}) {
  await firestore()
    .collection('merchants')
    .doc(merchantId)
    .get()
    .then((doc) => {
      return doc.data();
    })
    .then((data) => setStoreDetails(data))
    .then(() => {
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
    });
}

export {getStoreDetails};
