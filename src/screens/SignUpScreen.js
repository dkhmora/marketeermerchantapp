import React from 'react';
import {Text, Container, Button, Grid, Row, Input, Item} from 'native-base';

export const SignUpScreen = ({navigation}) => {
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
            <Input placeholder="Email/Phone Number" />
          </Item>
          <Item rounded style={{marginTop: 18}}>
            <Input placeholder="Password" />
          </Item>
          <Button
            full
            style={{marginTop: 36, borderRadius: 24}}
            onPress={() =>
              navigation.dangerouslyGetParent().navigate('SignUp')
            }>
            <Text>Sign Up</Text>
          </Button>
          <Button
            full
            style={{marginTop: 12, borderRadius: 24}}
            onPress={() => navigation.navigate('Login')}>
            <Text>Login</Text>
          </Button>
        </Row>
      </Grid>
    </Container>
  );
};
