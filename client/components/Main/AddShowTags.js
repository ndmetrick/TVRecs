import React, { useEffect, useState, useReducer } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  FlatList,
  Button,
  Alert,
} from 'react-native';
import { changeShowTags } from '../../redux/actions';

function AddShowTags(props) {
  const [warningTags, setWarningTags] = useState([]);
  const [tvTags, setTVTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  const [userShow, setUserShow] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    setAllTags(props.allTags);
    setUserShow(props.route.params.userShow);
    const selected = {};
    props.route.params.userShow.tags.forEach((tag) => {
      selected[tag.id] = true;
    });
    setSelectedTags(selected);
    const tv = [];
    const warnings = [];
    for (let i = 0; i < allTags.length; i++) {
      const tag = allTags[i];
      if (tag.type === 'tv' || tag.type === 'unassigned') {
        tv.push(tag);
      }
      if (tag.type === 'warning') {
        warnings.push(tag);
      }
    }

    setLoaded(true);
    setWarningTags(warnings);
    setTVTags(tv);
    setLoaded(true);
    return () => {
      setUserShow(null);
      setWarningTags([]);
      setTVTags([]);
      setLoaded(false);
      setSelectedTags({});
    };
  }, [userShow, loaded]);

  // const unselectAll = () => {
  //   if (TagGroup.getSelectedIndex() !== -1) {
  //     for (let i = 0; i < tvTagNames.length; i++) {
  //       tagGroup.unselect(i);
  //     }
  //   }
  // };

  const selectTag = (tag) => {
    if (selectedTags[tag.id] === true) {
      const swap = { ...selectedTags, [tag.id]: false };
      setSelectedTags(swap);
    } else {
      const swap = { ...selectedTags, [tag.id]: true };
      setSelectedTags(swap);
    }
  };

  const displayTags = (tags) => {
    return tags.map((tag, key) => {
      const tagStyle =
        selectedTags[tag.id] !== true &&
        (tag.type === 'tv' || tag.type === 'unassigned')
          ? styles.tvTag
          : selectedTags[tag.id] === true &&
            (tag.type === 'tv' || tag.type === 'unassigned')
          ? styles.highlightTvTag
          : selectedTags[tag.id] !== true && tag.type === 'warning'
          ? styles.warningTag
          : styles.highlightWarningTag;

      return (
        <TouchableOpacity
          key={key}
          style={tagStyle}
          onPress={() => selectTag(tag)}
        >
          <Text>{tag.name}</Text>
        </TouchableOpacity>
      );
    });
  };

  const chooseTags = async () => {
    const chosenTags = [];
    for (const tagId in selectedTags) {
      if (selectedTags[tagId] === true) {
        chosenTags.push(tagId);
      }
    }
    const message =
      props.route.params.previous === 'SaveShow'
        ? `${userShow.show.name} was added to your ${
            userShow.toWatch === false ? "rec'd shows" : 'watch list'
          }`
        : `Your tags for ${userShow.show.name} were updated`;
    await props.changeShowTags(chosenTags, userShow.id);
    Alert.alert('Show added/changed', message, {
      text: 'OK',
    });
    return props.navigation.navigate('Profile');
  };

  if (!loaded || !tvTags) {
    return (
      <View>
        <Text>We're finding your tags</Text>
      </View>
    );
  } else if (!tvTags.length || !selectedTags) {
    return (
      <View>
        <Text>We inding your tags</Text>
      </View>
    );
  } else {
    console.log('loaded', selectedTags);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <Text>
          Pick some tags that you feel describe the show how you experience it
        </Text>
        <View style={[styles.cardContent, styles.tagsContent]}>
          {displayTags(tvTags)}
        </View>

        <Text>Pick some warning tags</Text>
        <View style={[styles.cardContent, styles.tagsContent]}>
          {displayTags(warningTags)}
        </View>

        {/* <Tag
        onPress={unselectAll}
        text={'Unselect All'}
        touchableOpacity
        tagStyle={styles.buttonContainer}
        textStyle={styles.buttonText}
      /> */}
        <View style={styles.button}>
          <Button onPress={chooseTags} title="Save tags" color="white" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flex: 1,
    // justifyContent: 'center',
    marginHorizontal: 2,
  },

  title: {
    color: '#FF3F00',
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    textAlign: 'center',
    backgroundColor: '#4281A4',
    marginVertical: 8,
    marginBottom: 8,
    marginRight: 10,
    marginLeft: 10,
  },
  tagGroup: {
    marginTop: 16,
    marginHorizontal: 10,
    marginBottom: 8,
  },

  controller: {
    borderTopColor: '#ddd',
    borderTopWidth: 0.8,
    paddingTop: 10,
    marginHorizontal: 12,
  },
  modeSwitcher: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeText: {
    color: '#333',
    fontSize: 18,
  },

  tagStyle: {
    marginTop: 4,
    marginHorizontal: 8,
    backgroundColor: '#FF3F00',
    borderWidth: 0,
    marginRight: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  textStyle: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    height: 30,
    alignSelf: 'center',
    marginRight: 8,
  },
  buttonText: {
    color: '#FF7F11',
    fontSize: 16,
  },
  cardContent: {
    flexDirection: 'row',
    marginLeft: 10,
  },

  tagsContent: {
    marginTop: 10,
    flexWrap: 'wrap',
  },
  tvTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: 'lightgreen',
    marginTop: 5,
  },
  warningTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: 'yellow',
    marginTop: 5,
  },
  highlightTvTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: 'darkgreen',
    marginTop: 5,
  },
  highlightWarningTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: 'red',
    marginTop: 5,
  },
});

const mapStateToProps = (store) => ({
  allTags: store.allOtherUsers.allTags,
  currentUser: store.currentUser.userInfo,
  userShows: store.currentUser.userShows,
});

const mapDispatchToProps = (dispatch) => {
  return {
    changeShowTags: (tagIds, userShowId) =>
      dispatch(changeShowTags(tagIds, userShowId)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(AddShowTags);
