import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, StyleSheet } from 'react-native';
import firebase from 'firebase';

const Login = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      const result = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      console.log(result);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.inputText}
        placeholder="Email"
        onChangeText={(email) => setEmail(email)}
        value={email}
      />
      <TextInput
        style={styles.inputText}
        placeholder="Password"
        onChangeText={(password) => setPassword(password)}
        secureTextEntry={true}
        value={password}
      />

      <Button style={styles.button} onPress={() => onLogin()} title="Sign in" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    marginHorizontal: 2,
  },
  text: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputText: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  button: {
    textAlign: 'center',
    backgroundColor: '#4281A4',
    marginVertical: 8,
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#6F98AE',
    borderBottomWidth: 2,
  },
});

export default Login;
