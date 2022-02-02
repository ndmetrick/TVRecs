import React, { useEffect, useState, useReducer } from 'react'
import { connect } from 'react-redux'
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { TextInput } from 'react-native-paper'
import { changeUserTagsAndDescription } from '../../redux/actions'

function PickUserTags(props) {
  const [likeTags, setLikeTags] = useState([])
  const [dislikeTags, setDislikeTags] = useState([])
  const [describeTags, setDescribeTags] = useState([])
  const [selectedTags, setSelectedTags] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [description, setDescription] = useState('')

  useEffect(() => {
    console.log('tags', props.dislikeTags, props.describeTags)
    setLikeTags(props.likeTags)
    setDislikeTags(props.dislikeTags)
    setDescribeTags(props.describeTags)
    const selected = {}
    props.currentUserTags.forEach((tag) => {
      selected[tag.id] = true
    })
    setSelectedTags(selected)
    if (props.currentUser.description) {
      setDescription(props.currentUser.description)
    }
    setLoaded(true)
    return () => {
      setLikeTags([])
      setDislikeTags([])
      setDescribeTags([])
      setLoaded(false)
      setSelectedTags(null)
      setDescription('')
    }
  }, [loaded])

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
        (tag.type === 'profile' || tag.type === 'unassigned')
          ? styles.likeTag
          : selectedTags[tag.id] === true &&
            (tag.type === 'profile' || tag.type === 'unassigned')
          ? styles.highlightLikeTag
          : selectedTags[tag.id] !== true && tag.type === 'warning'
          ? styles.dislikeTag
          : selectedTags[tag.id] === true && tag.type === 'warning'
          ? styles.highlightDislikeTag
          : selectedTags[tag.id] !== true && tag.type === 'profile-describe'
          ? styles.describeTag
          : styles.highlightDescribeTag

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

  const saveDescriptionAndTags = async () => {
    const chosenTags = []
    for (const tagId in selectedTags) {
      if (selectedTags[tagId] === true) {
        chosenTags.push(tagId)
      }
    }
    await props.changeUserTagsAndDescription(chosenTags, description)
    return props.navigation.navigate('Settings')
  }

  if (!loaded || !likeTags || !dislikeTags || !describeTags) {
    console.log('this one is where i am')
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  } else if (!likeTags.length || !dislikeTags.length || !selectedTags) {
    console.log('i got this far')
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.text}>
          If you'd like, add a tv bio with anything you aren't able to represent
          with tags -- things about the shows you like and/or the kind of
          television watcher you are and/or the role TV plays in your life:
        </Text>
        <TextInput
          style={styles.inputText}
          label="tv bio (optional)"
          placeholder="Write a tv bio. . ."
          onChangeText={(description) => setDescription(description)}
          mode="outlined"
          outlineColor="#340068"
          activeOutlineColor="#340068"
          multiline={true}
          value={description}
        />
        <Text style={styles.text}>
          Pick some tags that describe genres/attributes of the kinds of shows
          you like best:
        </Text>
        <View style={[styles.cardContent, styles.tagsContent]}>
          {displayTags(likeTags)}
        </View>
        <Text style={styles.text}>
          Pick some tags that describe any deal breakers or triggers (i.e., the
          kinds of things that, if shows contain them, you end up choosing not
          to watch them / you find yourself needing to be very careful with
          watching them):
        </Text>
        <View style={[styles.cardContent, styles.tagsContent]}>
          {displayTags(dislikeTags)}
        </View>
        <Text style={styles.text}>
          Pick some tags that describe the kind of television watcher you are:
        </Text>
        <View style={[styles.cardContent, styles.tagsContent]}>
          {displayTags(describeTags)}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={saveDescriptionAndTags}
          >
            <Text style={styles.buttonText}>Save tv bio and tags</Text>
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
    marginBottom: 30,
    marginRight: 10,
    marginLeft: 10,
  },
  text: { textAlign: 'left', fontSize: 18 },
  tagText: {
    fontSize: 14,
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
    marginBottom: 8,
  },
  tagStyle: {
    marginTop: 4,
    marginHorizontal: 8,
    backgroundColor: '#FF3F00',
    borderWidth: 0,
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
    marginBottom: 10,
  },
  inputText: {
    margin: 10,
    textAlign: 'center',
    fontSize: 20,
  },
  tagsContent: {
    marginTop: 10,
    flexWrap: 'wrap',
  },
  highlightLikeTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#008DD5',
    marginTop: 5,
  },
  likeTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#9BC1BC',
    marginTop: 5,
  },
  highlightDislikeTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#E24E1B',
    marginTop: 5,
  },
  dislikeTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#F2A541',
    marginTop: 5,
  },
  highlightDescribeTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#7B5D96',
    marginTop: 5,
  },
  describeTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#B3A7BB',
    marginTop: 5,
  },
})

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  currentUserTags: store.currentUser.userTags,
  dislikeTags: store.allOtherUsers.dislikeTags,
  describeTags: store.allOtherUsers.describeTags,
  likeTags: store.allOtherUsers.userTags,
})

const mapDispatchToProps = (dispatch) => {
  return {
    changeUserTagsAndDescription: (tagIds, description) =>
      dispatch(changeUserTagsAndDescription(tagIds, description)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(PickUserTags)
