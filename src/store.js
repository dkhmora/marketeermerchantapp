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
        querySnapshot.forEach((doc, index) => {
          data.push(doc.data());
          data[index].orderId = doc.id;
        });
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
        querySnapshot.forEach((doc, index) => {
          data.push(doc.data());
          data[index].orderId = doc.id;
        });
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
        querySnapshot.forEach((doc, index) => {
          data.push(doc.data());
          data[index].orderId = doc.id;
        });
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
        this.storeDetails = documentSnapshot.data();
        this.storeCategories = documentSnapshot.data().itemCategories;
        console.log(this.storeDetails);
      });
  }
}

export {AuthStore, DetailsStore, OrderStore};