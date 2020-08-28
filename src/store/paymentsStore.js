import {observable, action} from 'mobx';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import 'react-native-get-random-values';
import Toast from '../components/Toast';

const functions = firebase.app().functions('asia-northeast1');

class PaymentsStore {
  @observable payments = [];
  @observable availablePaymentMethods = {};

  @action async getPaymentLink({totalAmount, topUpAmount, email, processId}) {
    return await functions
      .httpsCallable('getMerchantPaymentLink')({
        amount: totalAmount,
        topUpAmount,
        email,
        processId,
      })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async getAvailablePaymentMethods() {
    return await firestore()
      .collection('application')
      .doc('client_config')
      .get()
      .then((document) => {
        this.availablePaymentMethods = document.data().availablePaymentMethods;

        return document.data().availablePaymentMethods;
      });
  }

  @action async getPayments({merchantId, lastVisible, retrieveLimit}) {
    if (lastVisible) {
      return await firestore()
        .collection('merchant_payments')
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

            if (querySnapshot.size < retrieveLimit) {
              return true;
            }
          }

          return false;
        });
    }

    return await firestore()
      .collection('merchant_payments')
      .where('merchantId', '==', merchantId)
      .orderBy('createdAt', 'desc')
      .limit(retrieveLimit)
      .get()
      .then(async (querySnapshot) => {
        const list = [];

        await querySnapshot.forEach((documentSnapshot, index) => {
          list.push(documentSnapshot.data());
        });

        this.payments = list;
      });
  }
}

export default PaymentsStore;
