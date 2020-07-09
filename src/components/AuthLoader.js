import React, {setState} from 'react';
import {StyleSheet} from 'react-native';
import AnimatedLoader from 'react-native-animated-loader';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {inject, observer} from 'mobx-react';

@inject('authStore')
@inject('ordersStore')
@inject('itemsStore')
@inject('detailsStore')
@observer
class AuthLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {visible: true, user: null};
  }

  onAuthStateChanged(user) {
    const merchantAdminsCollection = firestore().collection('merchant_admins');
    const {visible} = this.state;

    if (auth().currentUser != null) {
      console.log('auth', auth().currentUser);
      const currentUserId = auth().currentUser.uid;

      merchantAdminsCollection
        .where(`${currentUserId}`, '==', true)
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            this.props.authStore.signOut();

            console.log('Error: The user does not match with any merchants');
          } else {
            snapshot.forEach((doc) => {
              const merchantId = doc.id.trim();

              this.props.authStore.setMerchantId(merchantId);
              this.props.detailsStore.setStoreDetails(merchantId);

              console.log(
                `Current user is assigned to Merchant with doc id "${merchantId}"`,
              );
            });

            this.setState({user});

            if (visible) {
              this.setState({visible: false});
            }
          }
        })
        .catch((err) => {
          console.log(`Error: Cannot read documents - ${err}`);
        });
    }

    if (visible) {
      this.setState({visible: false});
    }
  }

  componentDidMount() {
    const subscriber = auth().onAuthStateChanged(
      this.onAuthStateChanged.bind(this),
    );

    return subscriber;
  }

  componentDidUpdate() {
    const {navigation} = this.props;
    const {merchantId} = this.props.authStore;
    const {user} = this.state;

    if (!user) {
      navigation.navigate('Auth');
    } else {
      navigation.navigate('Home', {
        merchantId,
      });
    }
  }

  render() {
    const {visible} = this.state;

    return (
      <AnimatedLoader
        visible={visible}
        overlayColor="rgba(255,255,255,0.75)"
        source={require('../../assets/loader.json')}
        animationStyle={styles.lottie}
        speed={1}
      />
    );
  }
}

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
});

export default AuthLoader;
