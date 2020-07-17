import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {GiftedChat} from 'react-native-gifted-chat';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {persist} from 'mobx-persist';

const ordersCollection = firestore().collection('orders');
class OrdersStore {
  @persist('list') @observable orders = [];
  @persist @observable maxOrderUpdatedAt = 0;
  @observable orderMessages = [];
  @observable unsubscribeGetMessages = null;
  @observable unsubscribeSetOrders = null;

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
        .collection('orders')
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

  @action async setOrders(merchantId) {
    console.log(
      'this.maxOrderUpdatedAt',
      this.maxOrderUpdatedAt,
      this.orderMessages,
      merchantId,
    );

    console.log(this.maxOrderUpdatedAt < firestore.Timestamp.now().toMillis());
    console.log(firestore.Timestamp.now().toMillis());

    this.unsubscribeSetOrders = ordersCollection
      .where('merchantId', '==', merchantId)
      .where('updatedAt', '>', this.maxOrderUpdatedAt)
      .orderBy('updatedAt', 'desc')
      .onSnapshot((querySnapshot) => {
        if (querySnapshot) {
          querySnapshot.forEach((doc, index) => {
            const order = {...doc.data(), orderId: doc.id};

            console.log(order);

            if (order.updatedAt > this.maxOrderUpdatedAt) {
              this.maxOrderUpdatedAt = order.updatedAt;
            }

            const existingOrderIndex = this.orders
              .slice()
              .findIndex((existingOrder) => existingOrder.orderId === doc.id);

            if (this.orders.length > 0) {
              console.log(
                this.orders[0].orderId,
                doc.id,
                this.orders[0].orderId === doc.id,
              );
            }

            console.log('existingOrderIndex', existingOrderIndex);

            if (existingOrderIndex >= 0) {
              this.orders[existingOrderIndex] = order;
            } else {
              this.orders.push(order);
            }
          });

          console.log(this.orders);
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
          updatedAt: firestore.Timestamp.now().toMillis(),
        };

        return {newOrderStatus};
      })
      .then(({newOrderStatus}) => {
        orderRef
          .update({
            orderStatus: newOrderStatus,
            updatedAt: firestore.Timestamp.now().toMillis(),
          })
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
          updatedAt: firestore.Timestamp.now().toMillis(),
        };

        return newOrderStatus;
      })
      .then((newOrderStatus) => {
        orderRef.update({orderStatus: newOrderStatus});
      });
  }
}

export default OrdersStore;
