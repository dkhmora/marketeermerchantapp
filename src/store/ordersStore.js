import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';
import {GiftedChat} from 'react-native-gifted-chat';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {persist} from 'mobx-persist';
import Toast from '../components/Toast';

const functions = firebase.app().functions('asia-northeast1');
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
      .collection('orders')
      .doc(orderId)
      .update('messages', firestore.FieldValue.arrayUnion(message))
      .then(() => console.log('Successfully sent the message'))
      .catch((err) => console.log(err));
  }

  @action async sendMessage(orderId, message) {
    const createdAt = Date.parse(message.createdAt);
    message.createdAt = createdAt;

    await firestore()
      .collection('orders')
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
    this.unsubscribeSetOrders = ordersCollection
      .where('merchantId', '==', merchantId)
      .where('updatedAt', '>', this.maxOrderUpdatedAt)
      .orderBy('updatedAt', 'desc')
      .onSnapshot(async (querySnapshot) => {
        if (querySnapshot) {
          await querySnapshot.forEach((doc, index) => {
            const order = {...doc.data(), orderId: doc.id};

            if (order.updatedAt > this.maxOrderUpdatedAt) {
              this.maxOrderUpdatedAt = order.updatedAt;
            }

            const existingOrderIndex = this.orders
              .slice()
              .findIndex((existingOrder) => existingOrder.orderId === doc.id);

            if (existingOrderIndex >= 0) {
              this.orders[existingOrderIndex] = order;
            } else {
              this.orders.push(order);
            }
          });

          this.orders = this.orders
            .slice()
            .sort((a, b) => b.merchantOrderNumber - a.merchantOrderNumber);
        }
      });
  }

  @action async setOrderStatus(orderId, merchantId) {
    return await functions
      .httpsCallable('changeOrderStatus')({orderId, merchantId})
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  @action async cancelOrder(orderId, merchantId, cancelReason) {
    return await functions
      .httpsCallable('cancelOrder')({orderId, merchantId, cancelReason})
      .then((response) => {
        console.log(response.data);

        return response.data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

export default OrdersStore;
