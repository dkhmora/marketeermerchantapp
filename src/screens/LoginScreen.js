import React from 'react';
import {
  Text,
  Container,
  Button,
  Grid,
  Col,
  Row,
  Input,
  Item,
} from 'native-base';

export const LoginScreen = ({navigation}) => {
  return (
    <Container>
      <Grid style={{padding: 18}}>
        <Row
          size={3}
          style={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexDirection: 'column',
          }}>
          <Text>Marketeer.ph</Text>
          <Text>for Merchants</Text>
          <Text style={{marginTop: '20%'}}>Welcome!</Text>
        </Row>
        <Row
          size={5}
          style={{
            justifyContent: 'flex-start',
            flexDirection: 'column',
            paddingTop: '30%',
          }}>
          <Item rounded>
            <Input placeholder="Email/Phone Number" />
          </Item>
          <Item rounded style={{marginTop: 12}}>
            <Input placeholder="Password" />
          </Item>
          <Button
            rounded
            style={{marginTop: 36}}
            onPress={() => navigation.dangerouslyGetParent().navigate('Home')}>
            <Text
              style={{
                width: '100%',
                textAlign: 'center',
              }}>
              Login
            </Text>
          </Button>
          <Button
            rounded
            style={{marginTop: 12}}
            onPress={() => navigation.navigate('SignUp')}>
            <Text
              style={{
                width: '100%',
                textAlign: 'center',
              }}>
              Sign Up
            </Text>
          </Button>
        </Row>
      </Grid>
    </Container>
  );
};
