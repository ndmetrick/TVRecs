import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingPage from './components/auth/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Main from './components/Main';
import AddShowTags from './components/Main/AddShowTags';
import SaveShow from './components/Main/SaveShow';
import AddShow from './components/Main/AddShow';
import SingleShow from './components/Main/SingleShow';

import firebase from 'firebase/app';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './redux/reducers';
import thunk from 'redux-thunk';
const store = createStore(rootReducer, applyMiddleware(thunk));

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyByiiBbrPFrCLObYJrQvhxl-SCPNHP23-g',
  authDomain: 'televisionismyfriend.firebaseapp.com',
  projectId: 'televisionismyfriend',
  storageBucket: 'televisionismyfriend.appspot.com',
  messagingSenderId: '838762127917',
  appId: '1:838762127917:web:4c230e11a2043a5a0f0ea4',
  measurementId: 'G-CG4TGRFKZH',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const App = (props) => {
  const Stack = createStackNavigator();

  const [loaded, setLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        setLoggedIn(false);
        setLoaded(true);
      } else {
        setLoggedIn(true);
        setLoaded(true);
      }
    });
  }, []);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text>Your Television Friends are on their way...</Text>
      </View>
    );
  }

  if (!loggedIn) {
    return (
      <NavigationContainer>
        <Stack.Navigator initalRouteName="Landing">
          <Stack.Screen
            name="Landing"
            component={LandingPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <Provider store={store}>
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
    </Provider>
  );
};

export default App;
