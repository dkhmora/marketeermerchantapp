import {observable, action} from 'mobx';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';
import 'react-native-get-random-values';
import Toast from '../components/Toast';

const functions = firebase.app().functions('asia-northeast1');

class PaymentsStore {
  @observable payments = [];

  @action async getPaymentLink({totalAmount, email, processId}) {
    return await functions
      .httpsCallable('getMerchantPaymentLink')({
        amount: totalAmount,
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
}

export default PaymentsStore;
