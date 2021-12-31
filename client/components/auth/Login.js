import * as AuthSession from 'expo-auth-session';
import { connect } from 'react-redux';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, getAuthInfo } from '../../redux/actions';

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });

const Login = (props) => {
  const [clientId, setClientId] = useState(null);
  const authorizationEndpoint = 'https://dev--5p-bz53.us.auth0.com/authorize';

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      redirectUri,
      clientId: clientId,
      responseType: 'id_token',
      scopes: ['openid', 'profile'],
      prompt: 'login',
      extraParams: {
        nonce: 'nonce',
      },
    },
    { authorizationEndpoint }
  );

  useEffect(() => {
    const getAuth = async () => {
      try {
        const authInfo = await props.getAuthInfo();
        setClientId(authInfo[0]);
      } catch (e) {
        console.log(e);
      }
    };
    getAuth();
    const getUser = async () => {
      try {
        if (result) {
          if (result.error) {
            console.log(result.error);
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
  }, [result, clientId]);

  console.log('here in login', clientId);

  if (!clientId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    );
  }

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        disabled={!request}
        style={styles.button}
        onPress={() => promptAsync({ useProxy })}
      >
        <Text style={styles.buttonText}>Log in with Auth0</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    margin: 5,
    fontWeight: '500',
    color: 'white',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#586BA4',
    marginTop: 5,
    marginBottom: 10,
  },
});

const mapDispatchToProps = (dispatch) => {
  return {
    login: () => dispatch(getCurrentUser()),
    getAuthInfo: () => dispatch(getAuthInfo()),
  };
};

export default connect(null, mapDispatchToProps)(Login);
