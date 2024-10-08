import {observable, action, toJS} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {GiftedChat} from 'react-native-gifted-chat';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {persist} from 'mobx-persist';
import Toast from '../components/Toast';
import {functions} from '../util/variables';

const ordersCollection = firestore().collection('orders');
class OrdersStore {
  @persist('list') @observable orders = [];
  @persist @observable maxOrderUpdatedAt = 0;
  @observable orderMessages = null;
  @observable unsubscribeGetOrder = null;
  @observable unsubscribeSetOrders = null;
  @observable cancelOrderModal = false;
  @observable selectedOrder = null;
  @observable selectedCancelOrder = null;
  @observable mrspeedyBottomSheet = null;
  @observable mrspeedyBottomSheetSnapIndex = null;
  @observable getCourierInterval = null;

  @action clearGetCourierInterval() {
    clearInterval(this.getCourierInterval);
    this.getCourierInterval = null;
  }

  @action async getMrspeedyOrderPriceEstimate({
    subTotal,
    deliveryLatitude,
    deliveryLongitude,
    storeLatitude,
    storeLongitude,
    deliveryAddress,
    vehicleType,
    orderWeight,
    storeAddress,
    paymentMethod,
  }) {
    const storeLocation = {
      latitude: storeLatitude,
      longitude: storeLongitude,
    };

    const deliveryLocation = {
      latitude: deliveryLatitude,
      longitude: deliveryLongitude,
    };

    return await functions
      .httpsCallable('getMerchantMrSpeedyDeliveryPriceEstimate')({
        subTotal,
        deliveryLocation,
        deliveryAddress,
        storeLocation,
        vehicleType,
        orderWeight,
        storeAddress,
        paymentMethod,
      })
      .then((response) => {
        return response;
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async getImageUrl(imageRef) {
    const ref = storage().ref(imageRef);
    const link = await ref.getDownloadURL().catch((err) => {
      Toast({text: err.message, type: 'danger'});
      return null;
    });

    return link;
  }

  @action async sendImage(orderId, customerUserId, storeId, user, imagePath) {
    const messageId = uuidv4();
    const imageRef = `/images/orders/${orderId}/order_chat/${messageId}`;
    const storageRef = storage().ref(imageRef);

    await storageRef
      .putFile(imagePath, {
        customMetadata: {
          customerUserId,
          storeId,
        },
      })
      .then(() => {
        return this.getImageUrl(imageRef);
      })
      .then(
        (imageLink) =>
          imageLink &&
          this.createImageMessage(orderId, messageId, user, imageLink),
      )
      .catch((err) => Toast({text: err.message, type: 'danger'}));
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
      .update({
        messages: firestore.FieldValue.arrayUnion(message),
        userUnreadCount: firestore.FieldValue.increment(1),
        updatedAt: firestore.Timestamp.now().toMillis(),
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  @action async sendMessage(orderId, message) {
    const createdAt = Date.parse(message.createdAt);
    message.createdAt = createdAt;

    await firestore()
      .collection('orders')
      .doc(orderId)
      .update({
        messages: firestore.FieldValue.arrayUnion(message),
        userUnreadCount: firestore.FieldValue.increment(1),
        updatedAt: firestore.Timestamp.now().toMillis(),
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  @action getOrder(orderId) {
    this.orderMessages = null;
    this.selectedOrder = null;

    if (orderId) {
      this.unsubscribeGetOrder = firestore()
        .collection('orders')
        .doc(orderId)
        .onSnapshot((documentSnapshot) => {
          if (documentSnapshot) {
            if (documentSnapshot.exists) {
              this.orderMessages = [];

              this.selectedOrder = {...documentSnapshot.data(), orderId};

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

  @action async markMessagesAsRead(orderId) {
    return firestore().collection('orders').doc(orderId).update({
      storeUnreadCount: 0,
      updatedAt: firestore.Timestamp.now().toMillis(),
    });
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
          return [];
        }
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async setOrders(storeId) {
    this.unsubscribeSetOrders = ordersCollection
      .where('storeId', '==', storeId)
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
            .sort((a, b) => b.updatedAt - a.updatedAt);
        }
      });
  }

  @action async setOrderStatus(
    orderId,
    storeId,
    merchantId,
    mrspeedyBookingData,
  ) {
    return await functions
      .httpsCallable('changeOrderStatus')({
        orderId,
        storeId,
        merchantId,
        mrspeedyBookingData,
      })
      .then((response) => {
        return response;
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async cancelOrder(orderId, cancelReason) {
    return await functions
      .httpsCallable('cancelOrder')({orderId, cancelReason})
      .then((response) => {
        return response;
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async cancelMrspeedyBooking(orderId) {
    return await functions
      .httpsCallable('cancelMrSpeedyOrder')({orderId})
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async rebookMrspeedyBooking({mrspeedyBookingData, orderId}) {
    return await functions
      .httpsCallable('rebookMrSpeedyBooking')({mrspeedyBookingData, orderId})
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async getMrSpeedyCourierInfo(mrspeedyOrderId) {
    return await functions
      .httpsCallable('getMrSpeedyCourierInfo')({mrspeedyOrderId})
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }
}

export default OrdersStore;
