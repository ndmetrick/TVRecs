import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { getAllOtherUsers } from '../../redux/actions';
import Profile from './Profile';

const Search = (props) => {
  const [users, setUsers] = useState([]);
  const [matchingUsers, setMatchingUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        await getAllOtherUsers();
        setUsers(props.otherUsers);
      } catch (err) {
        console.error(err);
      }
    };
    getUsers();
    return () => {
      setUsers([]);
      setMatchingUsers([]);
    };
  }, []);

  const getMatchingUsers = (searchInput) => {
    const matches = users.filter((user) => {
      return user.username.includes(searchInput.toLowerCase());
    });
    setMatchingUsers(matches);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.boldText}>Search for any user</Text>
      <TextInput
        style={styles.inputText}
        label="Enter username here"
        onChangeText={(searchInput) => getMatchingUsers(searchInput)}
        mode="outlined"
        outlineColor="#586BA4"
        activeOutlineColor="#586BA4"
      />
      <View style={styles.optionContainer}>
        <FlatList
          horizontal={false}
          data={matchingUsers}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                props.navigation.navigate("TV rec'er", { uid: item.id })
              }
            >
              <View style={styles.otherUser}>
                <Text style={styles.optionsText}>{item.username}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flex: 1,
    marginHorizontal: 2,
  },
  optionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 10,
    marginLeft: 10,
  },
  text: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  boldText: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputText: {
    margin: 10,
    textAlign: 'center',
    fontSize: 20,
  },
  optionsText: {
    marginRight: 10,
    marginLeft: 10,
    fontSize: 18,
  },
  otherUser: {
    marginBottom: 5,
    marginTop: 5,
    padding: 2,
  },
});

const mapStateToProps = (store) => ({
  otherUsers: store.allOtherUsers.usersInfo,
});
const mapDispatch = (dispatch) => {
  return {
    getAllOtherUsers: () => dispatch(getAllOtherUsers()),
  };
};
export default connect(mapStateToProps, mapDispatch)(Search);
