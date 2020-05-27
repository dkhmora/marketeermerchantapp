import React from 'react';
import {
  Text,
  Container,
  Content,
  Header,
  Body,
  Right,
  Left,
  Button,
  Grid,
  Row,
  Col,
} from 'native-base';

export const SignUpScreen = ({navigation}) => {
  return (
    <Container style={{flex: 1}}>
      <Header>
        <Left />
        <Body>
          <Text>Sign Up Screen</Text>
        </Body>
        <Right />
      </Header>

      <Content>
        <Grid>
          <Row>
            <Text style={{textAlign: 'center'}}>Hello World</Text>
          </Row>
          <Row>
            <Button
              rounded
              style={{flex: 1}}
              onPress={() => navigation.navigate('Login')}>
              <Text>Go To Login</Text>
            </Button>
          </Row>
        </Grid>
      </Content>
    </Container>
  );
};
