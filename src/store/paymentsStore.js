import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import 'react-native-get-random-values';
import Toast from '../components/Toast';
import crashlytics from '@react-native-firebase/crashlytics';
import {functions} from '../util/variables';

class PaymentsStore {
  @observable payments = [];
  @observable availablePaymentMethods = {};
  @observable additionalPaymentMethods = {
    BOG: {
      longName: 'Bogus Bank',
      shortName: 'Bogus Bank',
      remarks: 'For Development Only',
      cost: 0,
      currencies: 'PHP',
      status: 'A',
      surcharge: 0,
    },
  };

  @action async getTopUpPaymentLink({topUpAmount, email, processId}) {
    return await functions
      .httpsCallable('getMerchantTopUpPaymentLink')({
        topUpAmount,
        email,
        processId,
      })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async getAvailablePaymentMethods() {
    return await firestore()
      .collection('application')
      .doc('client_config')
      .get()
      .then(async (document) => {
        if (document.exists) {
          const data = document.data();
          this.storeCategories = data.storeCategories.sort(
            (a, b) => a.name > b.name,
          );
          let sortedAvailablePaymentMethods = {};

          await Object.entries(data.availablePaymentMethods)
            .sort((a, b) => a[1].longName > b[1].longName)
            .map(([key, value], index) => {
              sortedAvailablePaymentMethods[key] = value;
            });

          this.availablePaymentMethods = {
            // ...this.additionalPaymentMethods,
            ...sortedAvailablePaymentMethods,
          };

          return this.availablePaymentMethods;
        }
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async getMerchantTopups({merchantId, lastVisible, retrieveLimit}) {
    if (lastVisible) {
      return await firestore()
        .collection('merchant_topups')
        .where('merchantId', '==', merchantId)
        .orderBy('createdAt', 'desc')
        .startAfter(lastVisible)
        .limit(retrieveLimit)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            querySnapshot.forEach((documentSnapshot, index) => {
              this.payments.push(documentSnapshot.data());
            });
          }
          if (querySnapshot.size < retrieveLimit) {
            return true;
          }

          return false;
        })
        .catch((err) => {
          crashlytics().recordError(err);
          Toast({text: err.message, type: 'danger'});
        });
    }

    return await firestore()
      .collection('merchant_topups')
      .where('merchantId', '==', merchantId)
      .orderBy('createdAt', 'desc')
      .limit(retrieveLimit)
      .get()
      .then(async (querySnapshot) => {
        if (!querySnapshot.empty) {
          const list = [];

          await querySnapshot.forEach((documentSnapshot, index) => {
            list.push(documentSnapshot.data());
          });

          this.payments = list;
        }

        if (querySnapshot.size < retrieveLimit) {
          return true;
        }

        return false;
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }
}

export default PaymentsStore;
