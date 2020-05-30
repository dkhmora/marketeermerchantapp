import React, {setState} from 'react';
import {StyleSheet} from 'react-native';
import AnimatedLoader from 'react-native-animated-loader';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const merchantUsersCollection = firestore().collection('merchant_users');
export default class AuthLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {visible: true, user: null, merchantId: null};
  }

  onAuthStateChanged(user) {
    if (auth().currentUser != null) {
      merchantUsersCollection
        .where(auth().currentUser.uid, '==', true)
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            auth().signOut();
            console.log('Error: The user does not match with any merchants');
          } else {
            snapshot.forEach((doc) => {
              this.setState({merchantId: doc.id.trim()});
              console.log(
                `Current user is assigned to Merchant with doc id "${doc.id}"`,
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
        merchantId: this.state.merchantId,
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
