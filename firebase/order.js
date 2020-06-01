import firestore from '@react-native-firebase/firestore';

function getOrders(merchantId, {setItems, setLoading}) {
  firestore()
    .collection('merchants')
    .doc(merchantId)
    .collection('orders')
    .onSnapshot((querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      setItems(data);

      setLoading(false);
    });
}

export {getOrders};
