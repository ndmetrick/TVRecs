import React, { useEffect, useState, useReducer } from 'react'
import { connect } from 'react-redux'
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { TextInput } from 'react-native-paper'
import { changeShowTagsAndDescription } from '../../redux/actions'

function AddShowTags(props) {
  // const [warningTags, setWarningTags] = useState([]);
  // const [tvTags, setTVTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState({})
  const [userShow, setUserShow] = useState(null)
  const [loaded, setLoaded] = useState(false)
  // const [multilineChecked, setMultilineChecked] = useState(false);
  const [description, setDescription] = useState('')

  useEffect(() => {
    const { previous } = props.route.params
    // setAllTags(props.allTags);
    setUserShow(props.route.params.userShow)
    const tags =
      previous === 'SaveShow' && props.route.params.tags
        ? props.route.params.tags
        : props.route.params.userShow.tags
    const selected = {}
    tags.forEach((tag) => {
      selected[tag.id] = true
    })
    setSelectedTags(selected)
    const prevDescription =
      previous === 'SaveShow' && props.route.params.description
        ? props.route.params.description
        : props.route.params.userShow.description
    setDescription(prevDescription)
    // const tv = [];
    // const warnings = [];
    // for (let i = 0; i < allTags.length; i++) {
    //   const tag = allTags[i];
    //   if (tag.type === 'tv' || tag.type === 'unassigned') {
    //     tv.push(tag);
    //   }
    //   if (tag.type === 'warning') {
    //     warnings.push(tag);
    //   }
    // }
    console.log('in this one', props.warningTags, props.tvTags)

    // setWarningTags(warnings);
    // setTVTags(tv);
    setLoaded(true)
    return () => {
      setUserShow(null)
      // setWarningTags([]);
      // setTVTags([]);
      setLoaded(false)
      setSelectedTags({})
      setDescription('')
      // setMultilineChecked(false);
    }
  }, [userShow, loaded])

  // const unselectAll = () => {
  //   if (TagGroup.getSelectedIndex() !== -1) {
  //     for (let i = 0; i < tvTagNames.length; i++) {
  //       tagGroup.unselect(i);
  //     }
  //   }
  // };

  const selectTag = (tag) => {
    if (selectedTags[tag.id] === true) {
      const swap = { ...selectedTags, [tag.id]: false }
      setSelectedTags(swap)
    } else {
      const swap = { ...selectedTags, [tag.id]: true }
      setSelectedTags(swap)
    }
  }

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
          : styles.highlightWarningTag

      return (
        <TouchableOpacity
          key={key}
          style={tagStyle}
          onPress={() => selectTag(tag)}
        >
          <Text style={styles.tagText}>{tag.name}</Text>
        </TouchableOpacity>
      )
    })
  }

  const chooseTags = async () => {
    const chosenTags = []
    for (const tagId in selectedTags) {
      if (selectedTags[tagId] === true) {
        chosenTags.push(tagId)
      }
    }
    await props.changeShowTagsAndDescription(
      chosenTags,
      userShow.id,
      description
    )
    return props.navigation.navigate('CurrentUser')
  }

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  } else if (!selectedTags) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.text}>
          Describe anything about the show you would like potential viewers to
          know in addition to the tag options below
        </Text>
        <TextInput
          style={styles.inputText}
          label="description (optional)"
          placeholder="Write a description of the show. . ."
          onChangeText={(description) => setDescription(description)}
          mode="outlined"
          outlineColor="#340068"
          activeOutlineColor="#340068"
          multiline={true}
          value={description}
        />
        <Text style={styles.text}>
          Pick some tags that you feel describe the show how you experience it:
        </Text>
        <View style={[styles.cardContent, styles.tagsContent]}>
          {displayTags(props.tvTags)}
        </View>

        <Text style={styles.text}>Pick some warning tags:</Text>
        <View style={[styles.cardContent, styles.tagsContent]}>
          {displayTags(props.warningTags)}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={chooseTags}>
            <Text style={styles.buttonText}>Save description and tags</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flex: 1,
    // justifyContent: 'center',
    marginHorizontal: 2,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    margin: 10,
  },
  tagText: {
    fontSize: 13.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    color: '#FF3F00',
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#340068',
    marginTop: 5,
    marginBottom: 20,
  },
  tagGroup: {
    marginTop: 16,
    marginHorizontal: 10,
    marginBottom: 8,
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
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 10,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    margin: 5,
    fontWeight: '500',
    color: 'white',
  },
  cardContent: {
    flexDirection: 'row',
    marginLeft: 10,
  },

  tagsContent: {
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
    backgroundColor: '#F2A541',
    marginTop: 5,
  },
  highlightTvTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#21A179',
    marginTop: 5,
  },
  highlightWarningTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#E24E1B',
    marginTop: 5,
  },
})

const mapStateToProps = (store) => ({
  allTags: store.allOtherUsers.allTags,
  currentUser: store.currentUser.userInfo,
  userShows: store.currentUser.userShows,
  warningTags: store.allOtherUsers.warningTags,
  tvTags: store.allOtherUsers.tvTags,
})

const mapDispatchToProps = (dispatch) => {
  return {
    changeShowTagsAndDescription: (tagIds, userShowId, description) =>
      dispatch(changeShowTagsAndDescription(tagIds, userShowId, description)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(AddShowTags)
