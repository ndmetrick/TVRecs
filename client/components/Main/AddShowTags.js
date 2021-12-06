import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { changeShowTags } from '../../redux/actions';

import TagGroup, { Tag } from 'react-native-tag-group';

function AddShowTags(props) {
  const temp = [
    'romantic comedy',
    'action',
    'thriller',
    'queer',
    'cute',
    'warm',
    'suspenseful',
    'mystery',
    'complex',
    'comforting',
    'about parenthood',
    'lesbian',
    'transgender',
    'non-binary',
    'gay',
    'bisexual',
    'unusual',
    'funny',
    'music',
    'diverse cast',
    'verisimilar',
    'silly',
    'smart',
    'give me all the silliness',
    'serious',
    'drama',
  ];
  const [warningTagNames, setWarningTagNames] = useState([]);
  const [tvTagNames, setTVTagNames] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [userShow, setUserShow] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [allTags, setAllTags] = useState([]);
  let tagGroup = useRef();

  useEffect(() => {
    setAllTags(props.allTags);
    setUserShow(props.route.params.userShow);
    const tvNames = [];
    const warningNames = [];
    for (let i = 0; i < allTags.length; i++) {
      const tag = allTags[i];
      if (tag.type === 'tv' || tag.type === 'unassigned') {
        tvNames.push(tag.name);
      }
      if (tag.type === 'warning') {
        warningNames.push(tag.name);
      }
    }
    // const sortedTags = [tvNames, warningNames];
    console.log('warningnames', warningNames);
    console.log('tvnames', tvNames);
    setWarningTagNames(warningNames);
    setTVTagNames(tvNames);
    setLoaded(true);
    return () => {
      setUserShow(null);
      setWarningTagNames([]);
      setTVTagNames([]);
      setLoaded(false);
    };
  }, [userShow, loaded]);

  // onTagPress() {
  //   let selectedIndex = this.tagGroup.getSelectedIndex();
  //   if (selectedIndex !== -1) {
  //     this.setState({ selectedTags: selectedIndex });
  //   }
  // }

  const unselectAll = () => {
    if (TagGroup.getSelectedIndex() !== -1) {
      for (let i = 0; i < tvTagNames.length; i++) {
        tagGroup.unselect(i);
      }
    }
  };

  const chooseTags = async () => {
    const chosenTagIds = selectedTags
      .map((tagName) => {
        console.log('tagName', tagName);
        console.log(allTags);
        return allTags.filter((tag) => {
          console.log(tag.name, tagName);
          return tag.name === tagName;
        })[0];
      })
      .map((tag) => tag.id);
    console.log('chosenTags', chosenTagIds);
    await props.changeShowTags(chosenTagIds, userShow.id);
    Alert.alert(
      'Show added',
      `${userShow.show.name} was added to your ${
        userShow.show.toWatch === false ? "rec'd shows" : 'watch list'
      }`,
      {
        text: 'OK',
      }
    );
    return props.navigation.navigate('Profile');
  };

  // const tags = this.props.tags.map((tag) => tag.name);
  // const tagKey = this.props.tags.map((tag, index) => {
  //   index: tag.id;
  // });

  if (!warningTagNames) {
    return (
      <View>
        <Text>We're finding your tags</Text>
      </View>
    );
  } else if (!warningTagNames.length) {
    return (
      <View>
        <Text>We inding your tags</Text>
      </View>
    );
  } else {
    console.log('loaded', loaded, warningTagNames, userShow);
  }

  return (
    <View>
      <Text>Pick some tags</Text>
      <SafeAreaView style={styles.container}>
        <TagGroup
          ref={(ref) => (tagGroup = ref)}
          style={styles.tagGroup}
          source={tvTagNames}
          onSelectedTagChange={(selected) => setSelectedTags(selected)}
        />

        <View style={styles.controller}></View>

        <Tag
          onPress={unselectAll}
          text={'Unselect All'}
          touchableOpacity
          tagStyle={styles.buttonContainer}
          textStyle={styles.buttonText}
        />

        <Tag
          onPress={chooseTags}
          text={'Save tags'}
          touchableOpacity
          tagStyle={styles.buttonContainer}
          textStyle={styles.buttonText}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},

  title: {
    color: '#FF3F00',
    fontSize: 20,
    textAlign: 'center',
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
