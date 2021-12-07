import * as AuthSession from 'expo-auth-session';
import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../../redux/actions';

const auth0ClientId = 'rMIdw36DYTg1ZmOuux0xDfUvj0rbO6u3';
const authorizationEndpoint = 'https://dev--5p-bz53.us.auth0.com/authorize';

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });

const Login = (props) => {
  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      redirectUri,
      clientId: auth0ClientId,
      // id_token will return a JWT token
      responseType: 'id_token',
      // retrieve the user's profile
      scopes: ['openid', 'profile'],
      prompt: 'login',
      extraParams: {
        // ideally, this will be a random value
        nonce: 'nonce',
      },
    },
    { authorizationEndpoint }
  );

  useEffect(() => {
    const getUser = async () => {
      try {
        if (result) {
          if (result.error) {
            Alert.alert(
              'Authentication error',
              result.params.error_description || 'something went wrong'
            );
            return;
          }
          if (result.type === 'success') {
            //ADD TRY/CATCH and async
            // Retrieve the JWT token and decode it
            const jwtToken = result.params.id_token;
            await AsyncStorage.setItem('token', jwtToken);
            await props.login();
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
  }, [result]);

  return (
    <View style={styles.container}>
      <Button
        style={styles.button}
        disabled={!request}
        title="Log in with Auth0"
        onPress={() => promptAsync({ useProxy })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
  button: {
    textAlign: 'center',
    backgroundColor: '#4281A4',
    marginVertical: 8,
    marginBottom: 8,
    marginRight: 10,
    marginLeft: 10,
  },
});

const mapDispatchToProps = (dispatch) => {
  return {
    login: () => dispatch(getCurrentUser()),
  };
};

export default connect(null, mapDispatchToProps)(Login);
