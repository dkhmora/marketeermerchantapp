import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {GiftedChat} from 'react-native-gifted-chat';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {create, persist} from 'mobx-persist';

const ordersCollection = firestore().collection('orders');
class OrdersStore {
  @persist('list') @observable pendingOrders = [];
  @persist('list') @observable paidOrders = [];
  @persist('list') @observable unpaidOrders = [];
  @persist('list') @observable shippedOrders = [];
  @persist('list') @observable completedOrders = [];
  @persist('list') @observable cancelledOrders = [];
  @observable orderMessages = [];
  @observable unsubscribeGetMessages = null;
  @observable unsubscribeSetCancelledOrders = null;
  @observable unsubscribeSetCompletedOrders = null;
  @observable unsubscribeSetPaidOrders = null;
  @observable unsubscribeSetUnpaidOrders = null;
  @observable unsubscribeSetPendingOrders = null;
  @observable unsubscribeSetAcceptedOrders = null;

  @action async getImageUrl(imageRef) {
    const ref = storage().ref(imageRef);
    const link = await ref.getDownloadURL();

    return link;
  }

  @action async sendImage(orderId, user, imagePath) {
    const messageId = uuidv4();
    const imageRef = `/images/orders/${orderId}/order_chat/${messageId}`;

    await storage()
      .ref(imageRef)
      .putFile(imagePath)
      .then(() => {
        return this.getImageUrl(imageRef);
      })
      .then((imageLink) =>
        this.createImageMessage(orderId, messageId, user, imageLink),
      )
      .then(() => console.log('Image successfully uploaded and sent!'))
      .catch((err) => console.log(err));
  }

  @action async createImageMessage(orderId, messageId, user, imageLink) {
    const createdAt = new Date().getTime();
    const message = {
      _id: messageId,
      image: imageLink,
      user,
      createdAt,
    };

    await firestore()
      .collection('order_chats')
      .doc(orderId)
      .update('messages', firestore.FieldValue.arrayUnion(message))
      .then(() => console.log('Successfully sent the message'))
      .catch((err) => console.log(err));
  }

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
    this.orderMessages = [];

    if (orderId) {
      this.unsubscribeGetMessages = firestore()
        .collection('order_chats')
        .doc(orderId)
        .onSnapshot((documentSnapshot) => {
          if (documentSnapshot) {
            if (documentSnapshot.exists) {
              if (
                documentSnapshot.data().messages.length <= 0 &&
                this.orderMessages.length > 0
              ) {
                this.orderMessages = GiftedChat.append(
                  this.orderMessages,
                  documentSnapshot.data().messages,
                );
              } else {
                this.orderMessages = documentSnapshot.data().messages.reverse();
              }
            } else {
              firestore()
                .collection('order_chats')
                .doc(orderId)
                .set({messages: []});
            }
          }
        });
    }
  }

  @action async getOrderItems(orderId) {
    console.log(orderId);
    return await firestore()
      .collection('order_items')
      .doc(orderId)
      .get()
      .then((documentReference) => {
        if (documentReference.exists) {
          return documentReference.data().items;
        } else {
          return null;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  @action setPendingOrders(merchantId) {
    const startPoint =
      this.pendingOrders.length > 0
        ? this.pendingOrders[0].merchantOrderNumber
        : 0;

    this.unsubscribeSetPendingOrders = ordersCollection
      .where('merchantId', '==', merchantId)
      .where('orderStatus.pending.status', '==', true)
      .orderBy('merchantOrderNumber', 'desc')
      .endBefore(startPoint)
      .onSnapshot((querySnapshot) => {
        if (querySnapshot) {
          querySnapshot.forEach((doc, index) => {
            const item = {...doc.data(), orderId: doc.id};

            this.pendingOrders.push(item);
          });
        }
      });
  }

  @action setUnpaidOrders(merchantId) {
    const startPoint =
      this.unpaidOrders.length > 0
        ? this.unpaidOrders[0].merchantOrderNumber
        : 0;
    console.log(this.unpaidOrders, startPoint);

    this.unsubscribeSetUnpaidOrders = ordersCollection
      .where('merchantId', '==', merchantId)
      .where('orderStatus.unpaid.status', '==', true)
      .orderBy('merchantOrderNumber', 'desc')
      .endBefore(startPoint)
      .onSnapshot((querySnapshot) => {
        if (querySnapshot) {
          querySnapshot.forEach((doc, index) => {
            const item = {...doc.data(), orderId: doc.id};

            this.unpaidOrders.push(item);
          });
        }
      });
  }

  @action setPaidOrders(merchantId) {
    const startPoint =
      this.paidOrders.length > 0 ? this.paidOrders[0].merchantOrderNumber : 0;

    this.unsubscribeSetPaidOrders = ordersCollection
      .where('merchantId', '==', merchantId)
      .where('orderStatus.paid.status', '==', true)
      .orderBy('merchantOrderNumber', 'desc')
      .endBefore(startPoint)
      .onSnapshot((querySnapshot) => {
        if (querySnapshot) {
          querySnapshot.forEach((doc, index) => {
            const item = {...doc.data(), orderId: doc.id};

            this.paidOrders.push(item);
          });
        }
      });
  }

  @action setShippedOrders(merchantId) {
    const startPoint =
      this.shippedOrders.length > 0
        ? this.shippedOrders[0].merchantOrderNumber
        : 0;

    this.unsubscribeSetShippedOrders = ordersCollection
      .where('merchantId', '==', merchantId)
      .where('orderStatus.shipped.status', '==', true)
      .orderBy('merchantOrderNumber', 'desc')
      .endBefore(startPoint)
      .onSnapshot((querySnapshot) => {
        if (querySnapshot) {
          querySnapshot.forEach((doc, index) => {
            const item = {...doc.data(), orderId: doc.id};

            this.shippedOrders.push(item);
          });
        }
      });
  }

  @action setCompletedOrders(merchantId) {
    const startPoint =
      this.completedOrders.length > 0
        ? this.completedOrders[0].merchantOrderNumber
        : 0;

    this.unsubscribeSetCompletedOrders = ordersCollection
      .where('merchantId', '==', merchantId)
      .where('orderStatus.completed.status', '==', true)
      .orderBy('merchantOrderNumber', 'desc')
      .endBefore(startPoint)
      .onSnapshot((querySnapshot) => {
        if (querySnapshot) {
          querySnapshot.forEach((doc, index) => {
            const item = {...doc.data(), orderId: doc.id};

            this.completedOrders.push(item);
          });
        }
      });
  }

  @action setCancelledOrders(merchantId) {
    const startPoint =
      this.cancelledOrders.length > 0
        ? this.cancelledOrders[0].merchantOrderNumber
        : 0;

    this.unsubscribeSetCancelledOrders = ordersCollection
      .where('merchantId', '==', merchantId)
      .where('orderStatus.cancelled.status', '==', true)
      .orderBy('merchantOrderNumber', 'desc')
      .endBefore(startPoint)
      .onSnapshot((querySnapshot) => {
        if (querySnapshot) {
          querySnapshot.forEach((doc, index) => {
            const item = {...doc.data(), orderId: doc.id};

            this.cancelledOrders.push(item);
          });
        }
      });
  }

  @action async setOrderStatus(orderId, merchantId, limit) {
    const statusArray = [
      'pending',
      'unpaid',
      'paid',
      'shipped',
      'completed',
      'cancelled',
    ];
    const orderRef = firestore().collection('orders').doc(orderId);
    console.log(orderId);

    await orderRef
      .get()
      .then((documentReference) => {
        const {orderStatus, paymentMethod} = documentReference.data();
        console.log('what');
        console.log(documentReference.data());
        let newOrderStatus = {};
        let currentStatus;
        Object.keys(orderStatus).map((item, index) => {
          if (orderStatus[`${item}`].status) {
            currentStatus = item;
          }
        });

        let nextStatusIndex = statusArray.indexOf(currentStatus) + 1;

        if (paymentMethod === 'COD' && currentStatus === 'pending') {
          nextStatusIndex = 2;
        }

        const nextStatus = statusArray[nextStatusIndex];

        newOrderStatus = orderStatus;

        newOrderStatus[`${currentStatus}`].status = false;

        newOrderStatus[`${nextStatus}`] = {
          status: true,
          updatedAt: new Date().toISOString(),
        };

        return {newOrderStatus};
      })
      .then(({newOrderStatus}) => {
        orderRef
          .update({orderStatus: newOrderStatus})
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        console.log(err);
      });
  }

  @action async cancelOrder(orderId, cancelReason) {
    const orderRef = firestore().collection('orders').doc(orderId);

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
