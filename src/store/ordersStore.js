import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {GiftedChat} from 'react-native-gifted-chat';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

const ordersCollection = firestore().collection('orders');
class OrdersStore {
  @observable orders = [];
  @observable orderItems = [];
  @observable pendingOrders = [];
  @observable paidOrders = [];
  @observable unpaidOrders = [];
  @observable shippedOrders = [];
  @observable completedOrders = [];
  @observable cancelledOrders = [];
  @observable orderMessages = [];
  @observable unsubscribeGetMessages = null;

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
    this.unsubscribeGetMessages = firestore()
      .collection('order_chats')
      .doc(orderId)
      .onSnapshot((documentSnapshot) => {
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
    console.log(merchantId);
    ordersCollection
      .where('merchantId', '==', merchantId)
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

  @action setUnpaidOrders(merchantId) {
    ordersCollection
      .where('merchantId', '==', merchantId)
      .where('orderStatus.unpaid.status', '==', true)
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc, index) => {
          data.push(doc.data());
          data[index].orderId = doc.id;
        });
        this.unpaidOrders = data;
      });
  }

  @action setPaidOrders(merchantId) {
    ordersCollection
      .where('merchantId', '==', merchantId)
      .where('orderStatus.paid.status', '==', true)
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc, index) => {
          data.push(doc.data());
          data[index].orderId = doc.id;
        });
        this.paidOrders = data;
      });
  }

  @action setShippedOrders(merchantId) {
    ordersCollection
      .where('merchantId', '==', merchantId)
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
    ordersCollection
      .where('merchantId', '==', merchantId)
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
    ordersCollection
      .where('merchantId', '==', merchantId)
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

  @action async setOrderStatus(orderId) {
    const statusArray = [
      'pending',
      'unpaid',
      'paid',
      'shipped',
      'completed',
      'cancelled',
    ];
    const orderRef = firestore().collection('orders').doc(orderId);

    await orderRef
      .get()
      .then((documentReference) => {
        const {orderStatus, paymentMethod} = documentReference.data();
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

        return newOrderStatus;
      })
      .then((newOrderStatus) => {
        orderRef.update({orderStatus: newOrderStatus});
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
