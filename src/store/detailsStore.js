import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import '@react-native-firebase/functions';
import Toast from '../components/Toast';
import {Platform} from 'react-native';
import {persist} from 'mobx-persist';

const functions = firebase.app().functions('asia-northeast1');
const merchantsCollection = firestore().collection('merchants');
class DetailsStore {
  @observable storeDetails = {};
  @observable unsubscribeSetStoreDetails = null;
  @persist @observable subscribedToNotifications = false;
  @persist @observable firstLoad = true;

  @computed get merchantRef() {
    const {merchantId} = this.storeDetails;

    return merchantsCollection.doc(merchantId);
  }

  @action async getStoreReviews() {
    const {merchantId} = this.storeDetails;
    const storeOrderReviewsRef = firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('order_reviews');

    return await storeOrderReviewsRef
      .get()
      .then((querySnapshot) => {
        const data = [];

        querySnapshot.forEach((doc, index) => {
          if (doc.id !== 'reviewNumber') {
            data.push(...doc.data().reviews);
          }
        });

        return data;
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async getAddressFromCoordinates({latitude, longitude}) {
    return await functions
      .httpsCallable('getAddressFromCoordinates')({latitude, longitude})
      .then((response) => {
        return response.data.locationDetails;
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action updateCoordinates(lowerRange, upperRange, boundingBox) {
    return this.merchantRef.update({
      deliveryCoordinates: {
        lowerRange,
        upperRange,
        boundingBox,
      },
      updatedAt: firestore.Timestamp.now().toMillis(),
    });
  }

  @action async setStoreDetails(merchantId) {
    if (merchantId && !this.unsubscribeSetStoreDetails) {
      this.unsubscribeSetStoreDetails = merchantsCollection
        .doc(merchantId)
        .onSnapshot(async (documentSnapshot) => {
          if (!documentSnapshot.empty) {
            this.storeDetails = {
              ...documentSnapshot.data(),
              merchantId,
            };
          }
        });
    }
  }

  @action async subscribeToNotifications() {
    let authorizationStatus = null;

    if (Platform.OS === 'ios') {
      authorizationStatus = await messaging().requestPermission();
    } else {
      authorizationStatus = true;
    }

    const token = await messaging().getToken();

    if (
      !this.storeDetails.fcmTokens.includes(token) &&
      !this.subscribedToNotifications
    ) {
      if (authorizationStatus) {
        return await messaging()
          .getToken()
          .then((token) => {
            this.merchantRef
              .update('fcmTokens', firestore.FieldValue.arrayUnion(token))
              .then(() => {
                this.subscribedToNotifications = true;
              });
          })
          .catch((err) => Toast({text: err.message, type: 'danger'}));
      }
    }
  }

  @action async unsubscribeToNotifications() {
    if (this.subscribedToNotifications) {
      await messaging()
        .getToken()
        .then((token) =>
          this.merchantRef
            .update('fcmTokens', firestore.FieldValue.arrayRemove(token))
            .then(() => {
              this.subscribedToNotifications = false;
            }),
        )
        .catch((err) => Toast({text: err.message, type: 'danger'}));
    }
  }

  @action async deleteImage(imageRef) {
    return await storage()
      .ref(imageRef)
      .delete()
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async uploadImage(imagePath, type) {
    const {merchantId} = this.storeDetails;
    const fileExtension = imagePath.split('.').pop();
    const imageRef = `/images/merchants/${merchantId}/${type}.${fileExtension}`;

    return await storage()
      .ref(imageRef)
      .putFile(imagePath)
      .then(() =>
        this.merchantRef.update({
          [`${type}Image`]: imageRef,
          updatedAt: firestore.Timestamp.now().toMillis(),
        }),
      )
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  @action async updateStoreDetails(
    storeDescription,
    freeDelivery,
    vacationMode,
    paymentMethods,
    deliveryMethods,
    deliveryType,
    ownDeliveryServiceFee,
    freeDeliveryMinimum,
  ) {
    await this.merchantRef
      .update({
        storeDescription,
        freeDelivery,
        freeDeliveryMinimum: freeDeliveryMinimum ? freeDeliveryMinimum : 0,
        vacationMode,
        paymentMethods,
        deliveryMethods,
        deliveryType,
        ownDeliveryServiceFee: ownDeliveryServiceFee
          ? ownDeliveryServiceFee
          : 0,
        updatedAt: firestore.Timestamp.now().toMillis(),
      })
      .catch((err) => {
        Toast({text: `Something went wrong. Error: ${err}`, type: 'danger'});
      });
  }
}

export default DetailsStore;
