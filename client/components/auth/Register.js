import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, StyleSheet } from 'react-native';
import firebase from 'firebase/app';

const Register = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const onRegister = async () => {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      firebase
        .firestore()
        .collection('users')
        .doc(firebase.auth().currentUser.uid)
        .set({
          firstName,
          lastName,
          email,
        });
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
      <TextInput
        style={styles.inputText}
        placeholder="First Name"
        onChangeText={(firstName) => setFirstName(firstName)}
        value={firstName}
      />
      <TextInput
        style={styles.inputText}
        placeholder="Last Name"
        onChangeText={(lastName) => setLastName(lastName)}
        value={lastName}
      />

      <Button
        style={styles.button}
        onPress={() => onRegister()}
        title="Sign up"
      />
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

export default Register;
