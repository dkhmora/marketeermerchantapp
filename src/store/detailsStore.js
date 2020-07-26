import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import '@react-native-firebase/functions';
import Toast from '../components/Toast';
import {Platform} from 'react-native';

const functions = firebase.app().functions('asia-northeast1');
const merchantsCollection = firestore().collection('merchants');
class DetailsStore {
  @observable storeDetails = {};
  @observable subscribedToNotifications = false;
  @observable unsubscribeSetStoreDetails = null;

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
        console.log(err);
      });
  }

  @action async getAddressFromCoordinates({latitude, longitude}) {
    return await functions
      .httpsCallable('getAddressFromCoordinates')({latitude, longitude})
      .then((response) => {
        return response.data.locationDetails;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  @action updateCoordinates(
    lowerRange,
    upperRange,
    locationCoordinates,
    boundingBox,
    address,
  ) {
    return this.merchantRef.update({
      deliveryCoordinates: {
        lowerRange,
        upperRange,
        ...locationCoordinates,
        boundingBox,
        address,
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

            const token = await messaging().getToken();

            if (documentSnapshot.data().fcmTokens) {
              if (documentSnapshot.data().fcmTokens.includes(token)) {
                this.subscribedToNotifications = true;
              } else {
                this.subscribedToNotifications = false;
              }
            } else {
              this.subscribedToNotifications = false;
            }
          } else {
            Toast({
              text: 'Store Details are still empty.',
              type: 'warning',
              duration: 5000,
            });
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

    if (!this.subscribedToNotifications) {
      if (authorizationStatus) {
        await messaging()
          .getToken()
          .then((token) => {
            this.merchantRef.update(
              'fcmTokens',
              firestore.FieldValue.arrayUnion(token),
            );
          })
          .catch((err) => console.log(err));
      }
    }
  }

  @action async unsubscribeToNotifications() {
    if (this.subscribedToNotifications) {
      await messaging()
        .getToken()
        .then((token) =>
          this.merchantRef.update(
            'fcmTokens',
            firestore.FieldValue.arrayRemove(token),
          ),
        )
        .catch((err) => console.log(err));
    }
  }

  @action async deleteImage(image) {
    await storage()
      .ref(image)
      .delete()
      .then(() => {
        console.log(`Image at ${image} successfully deleted!`);
      });
  }

  @action async uploadImage(imagePath, type, currentImagePath) {
    const {merchantId} = this.storeDetails;
    const fileExtension = imagePath.split('.').pop();
    const imageRef = `/images/merchants/${merchantId}/${type}.${fileExtension}`;

    await storage()
      .ref(imageRef)
      .putFile(imagePath)
      .then(() =>
        console.log(
          `${_.capitalize(
            type,
          )} image for ${merchantId} successfully uploaded!`,
        ),
      )
      .then(() =>
        this.merchantRef.update({
          [`${type}Image`]: imageRef,
          updatedAt: firestore.Timestamp.now().toMillis(),
        }),
      )
      .then(() =>
        console.log(
          `Merchant ${_.capitalize(type)} image path successfully set!`,
        ),
      )
      .then(() => {
        if (!(imageRef === currentImagePath)) {
          this.deleteImage(currentImagePath);
        }
      })
      .catch((err) => console.log(err));
  }

  @action async updateStoreDetails(
    storeName,
    storeDescription,
    freeDelivery,
    vacationMode,
    paymentMethods,
    shippingMethods,
    deliveryType,
    ownDeliveryServiceFee,
  ) {
    await this.merchantRef
      .update({
        storeName,
        storeDescription,
        freeDelivery,
        vacationMode,
        paymentMethods,
        shippingMethods,
        deliveryType,
        ownDeliveryServiceFee,
        updatedAt: firestore.Timestamp.now().toMillis(),
      })
      .then(() => console.log('Merchant details successfully updated!'))
      .catch((err) => {
        console.log(`Something went wrong. Error: ${err}`);
      });
  }
}

export default DetailsStore;
