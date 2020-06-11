import React, {Component} from 'react';
import {Text, Container, Button, Grid, Row, Input, Item} from 'native-base';
import {inject, observer} from 'mobx-react';

@inject('authStore')
@observer
class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };
  }

  render() {
    const {signIn} = this.props.authStore;
    const { email, password } = this.state;
    const { navigation } = this.props;

    return (
      <Container>
        <Grid style={{padding: 18}}>
          <Row
            size={7}
            style={{
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexDirection: 'column',
            }}>
            <Text>Marketeer.ph</Text>
            <Text>for Merchants</Text>
            <Text style={{marginTop: '40%'}}>Welcome!</Text>
          </Row>
          <Row
            size={8}
            style={{
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <Item rounded>
              <Input
                placeholder="Email/Phone Number"
                onChangeText={(email) => this.setState({email})}
              />
            </Item>
            <Item rounded style={{marginTop: 18}}>
              <Input
                secureTextEntry
                placeholder="Password"
                onChangeText={(password) => this.setState({password})}
              />
            </Item>
            <Button
              full
              style={{marginTop: 36, borderRadius: 24}}
              onPress={() => signIn(email, password)}>
              <Text>Login</Text>
            </Button>
            <Button
              full
              bordered
              style={{marginTop: 18, borderRadius: 24}}
              onPress={() => navigation.navigate('SignUp')}>
              <Text>Sign Up</Text>
            </Button>
          </Row>
        </Grid>
      </Container>
    );
  }
}

export default LoginScreen;
