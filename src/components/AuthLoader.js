import React, {setState} from 'react';
import {StyleSheet} from 'react-native';
import AnimatedLoader from 'react-native-animated-loader';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {inject} from 'mobx-react';

const merchantsCollection = firestore().collection('merchants');
@inject('authStore')
@inject('orderStore')
@inject('detailsStore')
class AuthLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {visible: true, user: null};
  }

  onAuthStateChanged(user) {
    if (auth().currentUser != null) {
      const currentUserId = auth().currentUser.uid;
      merchantsCollection
        .where(`admins.${currentUserId}`, '==', true)
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            auth().signOut();
            console.log('Error: The user does not match with any merchants');
          } else {
            snapshot.forEach((doc) => {
              this.props.authStore.setMerchantId(doc.id.trim());
              this.props.detailsStore.setStoreDetails(doc.id.trim());
              console.log(
                `Current user is assigned to Merchant with doc id "${this.props.authStore.merchantId}"`,
              );
            });
            this.setState({user: user});
            if (this.state.visible) {
              this.setState({visible: false});
            }
          }
        })
        .catch((err) => {
          console.log(`Error: Cannot read documents - ${err}`);
        });
    }
    if (this.state.visible) {
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
    if (!this.state.user) {
      this.props.navigation.navigate('Auth');
    } else {
      this.props.navigation.navigate('Home', {
        merchantId: this.props.authStore.merchantId,
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
