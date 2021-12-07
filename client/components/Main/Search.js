import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
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
    console.log('other users', users, props.otherUsers);
    return () => {
      setUsers([]);
      setMatchingUsers([]);
    };
  }, []);

  const getMatchingUsers = (searchInput) => {
    const matches = users.filter((user) =>
      user.username.includes(searchInput.toLowerCase())
    );
    setMatchingUsers(matches);
  };

  return (
    <View>
      <TextInput
        placeholder="Type in a new TV friend..."
        onChangeText={(searchInput) => getMatchingUsers(searchInput)}
      />

      <FlatList
        numColumns={1}
        horizontal={false}
        data={matchingUsers}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate('OtherUser', { uid: item.id })
            }
          >
            <Text>{item.username}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const mapStateToProps = (store) => ({
  otherUsers: store.allOtherUsers.usersInfo,
});
const mapDispatch = (dispatch) => {
  return {
    getAllOtherUsers: () => dispatch(getAllOtherUsers()),
  };
};
export default connect(mapStateToProps, mapDispatch)(Search);
