import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';

class AuthStore {
  @observable merchantId = 'testest';

  @action setMerchantId(id) {
    this.merchantId = id;
  }
}

class OrderStore {
  @observable orders = [];
  @observable pendingOrders = [];
  @observable acceptedOrders = [];
  @observable shippedOrders = [];
  @observable completedOrders = [];
  @observable cancelledOrders = [];

  @action setOrders(merchantId) {
    console.log('Galing sa setOrders', AuthStore.merchantId);
    firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('orders')
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push(doc.data());
        });
        this.orders = data;
      });
  }

  @action setPendingOrders(merchantId) {
    firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('orders')
      .where('orderStatus.pending.status', '==', true)
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc, index) => {
          data.push(doc.data());
          data[index].orderId = doc.id;
        });
        console.log('this ius data', data);
        this.pendingOrders = data;
      });
  }

  @action setAcceptedOrders(merchantId) {
    firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('orders')
      .where('orderStatus.accepted.status', '==', true)
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push(doc.data());
        });
        console.log('pending', data);
        this.acceptedOrders = data;
      });
  }

  @action setShippedOrders(merchantId) {
    firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('orders')
      .where('orderStatus.shipped.status', '==', true)
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push(doc.data());
        });
        console.log('pending', data);
        this.shippedOrders = data;
      });
  }

  @action setCompletedOrders(merchantId) {
    firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('orders')
      .where('orderStatus.completed.status', '==', true)
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc, index) => {
          data.push(doc.data());
          data[index].orderId = doc.id;
        });
        console.log('completed', data);
        this.completedOrders = data;
      });
  }

  @action setCancelledOrders(merchantId) {
    firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('orders')
      .where('orderStatus.cancelled.status', '==', true)
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push(doc.data());
        });
        console.log('pending', data);
        this.cancelledOrders = data;
      });
  }
}

class DetailsStore {
  @observable storeDetails = {};
  @observable storeCategories = [];

  @action setStoreDetails(merchantId) {
    firestore()
      .collection('merchants')
      .doc(merchantId)
      .onSnapshot((documentSnapshot) => {
        console.log(documentSnapshot.data());
        const storeDetails = {
          deliveryDescription: documentSnapshot.data().deliveryDescription,
          storeDescription: documentSnapshot.data().storeDescription,
          storeImageUrl: documentSnapshot.data().storeImageUrl,
          storeName: documentSnapshot.data().storeName,
          visible: documentSnapshot.data().visible,
        };

        this.storeDetails = storeDetails;

        console.log(this.storeDetails);

        this.storeCategories = documentSnapshot.data().item_categories;
      });
  }
}

export {AuthStore, DetailsStore, OrderStore};
