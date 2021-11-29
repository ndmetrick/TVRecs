import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { addShow, deleteShow } from '../../redux/actions';

function SingleShow(props) {
  const [userShow, setUserShow] = useState({});
  const [user, setUser] = useState(null);

  // const [following, setFollowing] = useState(false);

  useEffect(() => {
    const { currentUser } = props;
    const { userShow, userInfo } = props.route.params;

    if (userInfo.id === currentUser.id) {
      setUser(currentUser);
    } else {
      setUser(userInfo);
    }
    setUserShow(userShow);
  }, [props.route.params.userInfo]);

  const addShow = async (
    showName,
    imageUrl,
    streaming,
    description,
    purchase,
    imdbId
  ) => {
    const showData = {
      showName,
      description,
      streaming,
      purchase,
      imageUrl,
      imdbId,
    };
    await props.addShow(showData);
    Alert.alert('Show added', `${showName} was added to your shows`, {
      text: 'OK',
    });
    return props.navigation.navigate('Profile', {
      uid: props.route.params.uid,
      changedState: true,
    });
  };

  const deleteShow = async () => {
    try {
      await props.deleteShow(userShow.show.id);
      return props.navigation.navigate('Profile', {
        uid: props.route.params.userInfo.id,
        changedState: true,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (user === null) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        {/* <Text style={styles.text}>
          {user.firstName} {user.lastName}
        </Text> */}
        <Text style={styles.text}>{user.username}</Text>
      </View>

      <View style={styles.separator} />

      <Image style={styles.image} source={{ uri: userShow.show.imageUrl }} />
      <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 18 }}>
        {userShow.show.showName}
      </Text>
      <View style={styles.extra}>
        {userShow.description ? (
          <Text style={styles.text}>Description: {userShow.description}</Text>
        ) : null}
        {userShow.show.streaming ? (
          <Text style={styles.text}>
            Streaming options: {userShow.show.streaming}
          </Text>
        ) : null}
        {userShow.show.purchase ? (
          <Text style={styles.text}>
            Purchase options: {userShow.show.purchase}
          </Text>
        ) : null}

        {user.id === props.currentUser.id ? (
          <View>
            <Button
              title="Delete show"
              onPress={() =>
                Alert.alert(
                  'About to delete show',
                  'Are you sure you want to delete this show?',
                  [
                    { text: 'Yes', onPress: () => deleteShow() },
                    {
                      text: 'Cancel',
                    },
                  ]
                )
              }
            />
          </View>
        ) : null}

        {props.showList.includes(userShow.show.showName) ? null : (
          <View>
            <Button
              title="Add show"
              onPress={() =>
                addShow(
                  userShow.show.showName,
                  userShow.show.imageUrl,
                  userShow.show.streaming,
                  userShow.show.purchase
                )
              }
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  extra: {
    marginBottom: 25,
    marginLeft: 15,
  },
  containerInfo: {
    margin: 5,
    padding: 5,
    borderStyle: 'solid',
    borderColor: 'blue',
    borderWidth: 2,
  },
  showsList: {
    flex: 1,
  },
  containerImage: {
    flex: 1 / 2,
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#6F98AE',
    borderBottomWidth: 2,
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'left',
    fontSize: 18,
  },
});
const mapState = (store) => ({
  currentUser: store.currentUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  showList: store.currentUser.showList,
  following: store.currentUser.following,
});

const mapDispatch = (dispatch) => {
  return {
    addShow: (showInfo) => dispatch(addShow(showInfo)),
    deleteShow: (showId) => dispatch(deleteShow(showId)),
  };
};

export default connect(mapState, mapDispatch)(SingleShow);
