import * as AuthSession from 'expo-auth-session';
import { connect } from 'react-redux';
import jwtDecode from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { Alert, Button, Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from './client/components/Main';
import AddShowTags from './client/components/Main/AddShowTags';
import SaveShow from './client/components/Main/SaveShow';
import AddShow from './client/components/Main/AddShow';
import SingleShow from './client/components/Main/SingleShow';
import Login from './client/components/auth/Login';
import { addUser, getCurrentUser } from './client/redux/actions';

const auth0ClientId = 'rMIdw36DYTg1ZmOuux0xDfUvj0rbO6u3';
const authorizationEndpoint = 'https://dev--5p-bz53.us.auth0.com/authorize';

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });

const App = (props) => {
  const Stack = createStackNavigator();

  const [loaded, setLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [name, setName] = useState(null);

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
    if (result) {
      if (result.error) {
        Alert.alert(
          'Authentication error',
          result.params.error_description || 'something went wrong'
        );
        return;
      }
      if (result.type === 'success') {
        // Retrieve the JWT token and decode it
        const jwtToken = result.params.id_token;
        const user = jwtDecode(jwtToken);

        const { name } = user;
        setName(name);
        setUser(user);
        const userId = user.sub.slice(6);
        console.log('user', user, userId);
        if (user['https://mynamespace/loginsCount'] < 2) {
          props.addUser();
          console.log('i am new');
        } else {
          props.login();
          console.log('i am returning');
        }
      }
    }
  }, [result]);

  return (
    <>
      {user ? (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen
              name="Main"
              component={Main}
              option={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddShow"
              component={AddShow}
              navigation={props.navigation}
            />
            <Stack.Screen
              name="AddShowTags"
              component={AddShowTags}
              navigation={props.navigation}
            />
            <Stack.Screen
              name="SaveShow"
              component={SaveShow}
              navigation={props.navigation}
            />
            <Stack.Screen
              name="SingleShow"
              component={SingleShow}
              navigation={props.navigation}
            />
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <View style={styles.container}>
          <Button
            disabled={!request}
            title="Log in with Auth0"
            onPress={() => promptAsync({ useProxy })}
          />
        </View>
      )}
    </>
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
});

const mapDispatchToProps = (dispatch) => {
  return {
    addUser: () => dispatch(addUser()),
    login: () => dispatch(getCurrentUser()),
  };
};

export default connect(null, mapDispatchToProps)(App);
