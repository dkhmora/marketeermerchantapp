import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';

const functions = firebase.app().functions('asia-northeast1');
class DetailsStore {
  @observable storeDetails = {};
  @observable unsubscribeSetStoreDetails = null;

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
          address,
        },
      });
  }

  @action setStoreDetails(merchantId) {
    if (merchantId) {
      this.unsubscribeSetStoreDetails = firestore()
        .collection('merchants')
        .doc(merchantId)
        .onSnapshot((documentSnapshot) => {
          if (documentSnapshot) {
            if (documentSnapshot.exists) {
              this.storeDetails = documentSnapshot.data();
            }
          }
        });
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
