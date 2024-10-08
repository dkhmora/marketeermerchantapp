import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import '@react-native-firebase/functions';
import Toast from '../components/Toast';
import {Platform} from 'react-native';
import {persist} from 'mobx-persist';
import crashlytics from '@react-native-firebase/crashlytics';
import {functions} from '../util/variables';

const storesCollection = firestore().collection('stores');
const publicStorageBucket = firebase.app().storage('gs://marketeer-public');
class DetailsStore {
  @observable storeDetails = {};
  @observable merchantDetails = {};
  @persist('list') @observable disbursementPeriods = [];
  @persist @observable lastDisbursementPeriodUpdatedAt = 0;
  @observable unsubscribeSetStoreDetails = null;
  @observable unsubscribeSetMerchantDetails = null;
  @persist @observable subscribedToNotifications = false;
  @persist @observable firstLoad = true;

  @computed get storeRef() {
    const {storeId} = this.storeDetails;

    return storesCollection.doc(storeId);
  }

  @action async setStoreDeliveryArea({distance, midPoint}) {
    const {storeId} = this.storeDetails;

    return await functions
      .httpsCallable('setStoreDeliveryArea')({
        distance,
        midPoint,
        storeId,
      })
      .then((response) => {
        if (response.data.s === 200) {
          Toast({
            text: response.data.m,
          });
        } else {
          Toast({
            text: response.data.m,
            type: 'danger',
          });
        }

        return response.data;
      })
      .catch((err) => {
        crashlytics().recordError(err);

        Toast({
          text: `Error: ${err}!`,
          type: 'danger',
        });
      });
  }

  @action async setDisbursementPeriods() {
    const {merchantId} = this.merchantDetails;

    return await firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('disbursement_periods')
      .where('updatedAt', '>', this.lastDisbursementPeriodUpdatedAt)
      .orderBy('updatedAt', 'desc')
      .get()
      .then((querySnapshot) => {
        return querySnapshot.forEach((doc, index) => {
          const disbursementData = doc.data();
          const disbursementIndex = this.disbursementPeriods.findIndex(
            (disbursement) =>
              disbursement.startDate === disbursementData.startDate,
          );

          if (disbursementIndex >= 0) {
            this.disbursementPeriods[disbursementIndex] = disbursementData;
          } else {
            this.disbursementPeriods.push(disbursementData);
          }

          if (
            this.lastDisbursementPeriodUpdatedAt < disbursementData.updatedAt
          ) {
            this.lastDisbursementPeriodUpdatedAt = disbursementData.updatedAt;
          }
        });
      })
      .catch((err) => {
        crashlytics().recordError(err);

        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async setMerchantDetails(merchantId) {
    if (merchantId && !this.unsubscribeSetMerchantDetails) {
      this.unsubscribeSetMerchantDetails = firestore()
        .collection('merchants')
        .doc(merchantId)
        .onSnapshot(async (documentSnapshot) => {
          if (!documentSnapshot.empty) {
            this.merchantDetails = {
              ...documentSnapshot.data(),
              merchantId,
            };
          }
        });
    }
  }

  @action async getStoreReviews() {
    const {storeId} = this.storeDetails;
    const storeOrderReviewsRef = firestore()
      .collection('stores')
      .doc(storeId)
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
        crashlytics().recordError(err);

        Toast({text: err.message, type: 'danger'});
      });
  }

  @action updateCoordinates(lowerRange, upperRange, boundingBox) {
    return this.storeRef
      .update({
        deliveryCoordinates: {
          lowerRange,
          upperRange,
          boundingBox,
        },
        updatedAt: firestore.Timestamp.now().toMillis(),
      })
      .catch((err) => {
        crashlytics().recordError(err);

        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async setStoreDetails(storeId) {
    if (storeId && !this.unsubscribeSetStoreDetails) {
      this.unsubscribeSetStoreDetails = firestore()
        .collection('stores')
        .doc(storeId)
        .onSnapshot(async (documentSnapshot) => {
          if (!documentSnapshot.empty) {
            this.storeDetails = {
              ...documentSnapshot.data(),
              storeId,
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
      this.storeDetails?.fcmTokens === undefined ||
      !this.storeDetails.fcmTokens.includes(token)
    ) {
      if (authorizationStatus) {
        return await this.storeRef
          .update('fcmTokens', firestore.FieldValue.arrayUnion(token))
          .then(() => {
            this.subscribedToNotifications = true;
          })
          .catch((err) => {
            crashlytics().recordError(err);
            Toast({text: err.message, type: 'danger'});
          });
      }
    }
  }

  @action async unsubscribeToNotifications() {
    if (this.subscribedToNotifications) {
      await messaging()
        .getToken()
        .then((token) =>
          this.storeRef
            .update('fcmTokens', firestore.FieldValue.arrayRemove(token))
            .then(() => {
              this.subscribedToNotifications = false;
            }),
        )
        .catch((err) => {
          crashlytics().recordError(err);
          Toast({text: err.message, type: 'danger'});
        });
    }
  }

  @action async deleteImage(imageRef) {
    return await publicStorageBucket
      .ref(imageRef)
      .delete()
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async uploadImage(imagePath, type) {
    const {storeId} = this.storeDetails;
    const fileExtension = imagePath.split('.').pop();
    const imageRef = `/images/stores/${storeId}/${type}.${fileExtension}`;

    return await publicStorageBucket
      .ref(imageRef)
      .putFile(imagePath)
      .then(() => imageRef)
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async updateStoreDetails(values) {
    let finalValues = {
      ...values,
      updatedAt: firestore.Timestamp.now().toMillis(),
    };

    if (values.displayImage) {
      finalValues.displayImage = await this.uploadImage(
        values.displayImage,
        'display',
      );
    }

    if (values.coverImage) {
      finalValues.coverImage = await this.uploadImage(
        values.coverImage,
        'cover',
      );
    }

    return await this.storeRef.set(finalValues, {merge: true}).catch((err) => {
      crashlytics().recordError(err);
      Toast({text: `Something went wrong. Error: ${err}`, type: 'danger'});
    });
  }
}

export default DetailsStore;
