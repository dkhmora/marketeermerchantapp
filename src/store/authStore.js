import {observable, action} from 'mobx';

class AuthStore {
  @observable merchantId = 'testest';

  @action setMerchantId(id) {
    this.merchantId = id;
  }
}

export default AuthStore;
