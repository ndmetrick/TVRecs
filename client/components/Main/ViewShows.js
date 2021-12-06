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
} from 'react-native';

import { useIsFocused } from '@react-navigation/native';

function ViewShows(props) {
  const [userShows, setUserShows] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isFocused = useIsFocused();

  useEffect(() => {
    const { currentUser, currentUserShows, toWatch, otherUserShows } = props;
    const { userToView } = props.route.params;
    setUser(userToView);
    if (userToView) {
      if (props.route.params.type === 'toWatch') {
        setUserShows(toWatch);
        setLoading(false);
      } else if (userToView.id === currentUser.id) {
        setUserShows(currentUserShows);
        setLoading(false);
      } else if (userToView.id) {
        setUserShows(otherUserShows);
        setLoading(false);
      }
    }
    return () => {
      setUserShows([]);
      setUser(null);
    };
  }, [props.route.params.type, isFocused, props.otherUserShows]);

  if (loading) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View>
        <FlatList
          numColumns={2}
          horizontal={false}
          data={userShows}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <TouchableOpacity
                onPress={() =>
                  props.navigation.navigate('SingleShow', {
                    userInfo: user,
                    userShow: item,
                  })
                }
                style={styles.catalogContainer}
              >
                <Image
                  style={styles.image}
                  source={{ uri: item.show.imageUrl }}
                />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  showsList: {
    flex: 1,
  },
  text: {
    textAlign: 'left',
    fontSize: 18,
  },
  containerImage: {
    flex: 1 / 2,
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
});
const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  otherUser: store.otherUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  otherUserShows: store.otherUser.userShows,
  toWatch: store.currentUser.toWatch,
});

export default connect(mapStateToProps, null)(ViewShows);
