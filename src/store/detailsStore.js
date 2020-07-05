import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

class DetailsStore {
  @observable storeDetails = {};

  @action async updateCoordinates(
    merchantId,
    lowerRange,
    upperRange,
    locationCoordinates,
    address,
  ) {
    console.log('yes', address);
    await firestore()
      .collection('merchants')
      .doc(merchantId)
      .update({
        deliveryCoordinates: {
          lowerRange,
          upperRange,
          ...locationCoordinates,
          address,
        },
      })
      .then(() => console.log('Successfully updated merchant coordinates'))
      .catch((err) => console.log(err));
  }

  @action setStoreDetails(merchantId) {
    firestore()
      .collection('merchants')
      .doc(merchantId)
      .onSnapshot((documentSnapshot) => {
        if (documentSnapshot.exists) {
          this.storeDetails = documentSnapshot.data();
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
    address,
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
        address,
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
