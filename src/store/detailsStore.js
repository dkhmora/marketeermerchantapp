import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

class DetailsStore {
  @observable storeDetails = {};

  @action setStoreDetails(merchantId) {
    firestore()
      .collection('merchants')
      .doc(merchantId)
      .onSnapshot((documentSnapshot) => {
        this.storeDetails = documentSnapshot.data();
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
      .catch((err) => console.error(err));
  }

  @action async deleteImage(image) {
    await storage()
      .ref(image)
      .delete()
      .then(() => {
        console.log(`Image at ${image} successfully deleted!`);
      });
  }
}

export default DetailsStore;
