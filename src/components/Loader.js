import React, {setState} from 'react';
import {StyleSheet} from 'react-native';
import AnimatedLoader from 'react-native-animated-loader';
import auth from '@react-native-firebase/auth';

export default class Loader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {visible: true, user: null};
  }

  onAuthStateChanged(user) {
    this.setState({user: user});
    console.log(user);
    if (this.state.visible) {
      this.setState({visible: false});
    }
  }

  componentDidMount() {
    auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));
  }

  componentDidUpdate() {
    if (!this.state.user) {
      this.props.navigation.navigate('Auth');
    } else {
      this.props.navigation.navigate('Home');
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
