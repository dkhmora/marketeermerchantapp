import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import {GiftedChat} from 'react-native-gifted-chat';

class OrdersStore {
  @observable orders = [];
  @observable orderItems = [];
  @observable pendingOrders = [];
  @observable acceptedOrders = [];
  @observable shippedOrders = [];
  @observable completedOrders = [];
  @observable cancelledOrders = [];
  @observable orderMessages = [];

  @action async sendMessage(orderId, message) {
    const createdAt = Date.parse(message.createdAt);
    message.createdAt = createdAt;

    await firestore()
      .collection('order_chats')
      .doc(orderId)
      .update('messages', firestore.FieldValue.arrayUnion(message))
      .then(() => console.log('Successfully sent the message'))
      .catch((err) => console.log(err));
  }

  @action getMessages(orderId) {
    firestore()
      .collection('order_chats')
      .doc(orderId)
      .onSnapshot((documentSnapshot) => {
        if (documentSnapshot.data().messages.length <= 0) {
          this.orderMessages = GiftedChat.append(
            this.orderMessages,
            documentSnapshot.data().messages,
          );
        } else {
          this.orderMessages = documentSnapshot.data().messages.reverse();
        }
      });
  }

  @action async setOrderItems(orderId) {
    await firestore()
      .collection('order_items')
      .doc(orderId)
      .get()
      .then((documentReference) => {
        return (this.orderItems = documentReference.data().items);
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

  @action async setOrderStatus(merchantId, orderId) {
    const statusArray = [
      'pending',
      'accepted',
      'shipped',
      'completed',
      'cancelled',
    ];
    const orderRef = firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('orders')
      .doc(orderId);

    await orderRef
      .get()
      .then((documentReference) => {
        const {orderStatus} = documentReference.data();
        let newOrderStatus = {};
        let currentStatus;
        Object.keys(orderStatus).map((item, index) => {
          if (orderStatus[`${item}`].status) {
            currentStatus = item;
          }
        });

        const nextStatusIndex = statusArray.indexOf(currentStatus) + 1;
        const nextStatus = statusArray[nextStatusIndex];

        newOrderStatus = orderStatus;

        newOrderStatus[`${currentStatus}`].status = false;

        newOrderStatus[`${nextStatus}`] = {
          status: true,
          updatedAt: new Date().toISOString(),
        };

        return newOrderStatus;
      })
      .then((newOrderStatus) => {
        orderRef.update({orderStatus: newOrderStatus});
      });
  }

  @action async cancelOrder(merchantId, orderId, cancelReason) {
    const orderRef = firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('orders')
      .doc(orderId);

    await orderRef
      .get()
      .then((documentReference) => {
        const {orderStatus} = documentReference.data();
        let newOrderStatus = {};
        let currentStatus;
        Object.keys(orderStatus).map((item, index) => {
          if (orderStatus[`${item}`].status) {
            currentStatus = item;
          }
        });

        newOrderStatus = orderStatus;

        newOrderStatus[`${currentStatus}`].status = false;

        newOrderStatus.cancelled = {
          status: true,
          reason: cancelReason,
          updatedAt: new Date().toISOString(),
        };

        return newOrderStatus;
      })
      .then((newOrderStatus) => {
        orderRef.update({orderStatus: newOrderStatus});
      });
  }
}

export default OrdersStore;
