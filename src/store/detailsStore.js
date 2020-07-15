import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import '@react-native-firebase/functions';
import Toast from '../components/Toast';

const functions = firebase.app().functions('asia-northeast1');
class DetailsStore {
  @observable storeDetails = {};
  @observable unsubscribeSetStoreDetails = null;

  @action async getStoreReviews(merchantId) {
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
    merchantId,
    lowerRange,
    upperRange,
    locationCoordinates,
    boundingBox,
    address,
  ) {
    return firestore()
      .collection('merchants')
      .doc(merchantId)
      .update({
        deliveryCoordinates: {
          lowerRange,
          upperRange,
          ...locationCoordinates,
          boundingBox,
          address,
        },
      });
  }

  @action async setStoreDetails() {
    const userId = auth().currentUser.uid;

    this.unsubscribeSetStoreDetails = firestore()
      .collection('merchants')
      .where(`admins.${userId}`, '==', true)
      .onSnapshot((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc, index) => {
            this.storeDetails = {
              ...doc.data(),
              merchantId: doc.id,
            };
          });
        } else {
          auth()
            .signOut()
            .then(() => {
              Toast({
                text:
                  'Error, user account is not set as admin. Please contact Marketeer support.',
                type: 'danger',
                duration: 10000,
              });
            });
        }
      });
  }

  @action async deleteImage(image) {
    await storage()
      .ref(image)
      .delete()
      .then(() => {
        console.log(`Image at ${image} successfully deleted!`);
      });
  }

  @action async uploadImage(merchantId, imagePath, type, currentImagePath) {
    const fileExtension = imagePath.split('.').pop();
    const imageRef = `/images/merchants/${merchantId}/${type}.${fileExtension}`;

    const merchantRef = firestore().collection('merchants').doc(merchantId);

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
      .then(() => merchantRef.update({[`${type}Image`]: imageRef}))
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
    merchantId,
    storeName,
    storeDescription,
    freeDelivery,
    vacationMode,
    paymentMethods,
    shippingMethods,
    deliveryType,
  ) {
    await firestore()
      .collection('merchants')
      .doc(merchantId)
      .update({
        storeName,
        storeDescription,
        freeDelivery,
        vacationMode,
        paymentMethods,
        shippingMethods,
        deliveryType,
      })
      .then(() => console.log('Merchant details successfully updated!'))
      .catch((err) => {
        console.log(`Something went wrong. Error: ${err}`);
      });
  }
}

export default DetailsStore;
