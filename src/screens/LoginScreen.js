import React from 'react';
import {Text, Container, Button} from 'native-base';

export const LoginScreen = ({navigation}) => {
  return (
    <Container>
      <Text>Login</Text>
      <Button onPress={() => navigation.navigate('SignUp')}>
        <Text>Go To Sign Up</Text>
      </Button>
      <Button
        onPress={() => navigation.dangerouslyGetParent().navigate('Home')}>
        <Text>Go To Home</Text>
      </Button>
    </Container>
  );
};
