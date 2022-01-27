import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { connect } from 'react-redux'
import {
  addShow,
  switchShow,
  changeShowTagsAndDescription,
} from '../../redux/actions'

function SaveShow(props) {
  const [userShow, setUserShow] = useState({})
  const [loading, setLoading] = useState(true)
  const [previous, setPrevious] = useState(null)
  const [fromCurrentUserShow, setFromCurrentUserShow] = useState(false)
  const [showInfo, setShowInfo] = useState(null)
  const [tags, setTags] = useState(null)
  const [description, setDescription] = useState(null)

  useEffect(() => {
    const { showData } = props.route.params
    if (props.route.params.previous === 'SingleShow') {
      console.log('fromcurrent:', props.route.params.fromCurrentUserShow)
      const { fromCurrentUserShow } = props.route.params
      if (!fromCurrentUserShow) {
        setFromCurrentUserShow(false)
        setPrevious('SingleShow')
        setShowInfo(showData)
        if (showData.keep === true) {
          setDescription(showData.description)
          setTags(showData.tags)
        }
      } else if (fromCurrentUserShow) {
        setFromCurrentUserShow(true)
        setPrevious('SingleShow')
        setShowInfo(showData)
        if (showData.keep === false) {
          setDescription('')
          setTags([])
        }
      }
    } else if (props.route.params.previous === 'AddShow') {
      setFromCurrentUserShow(true)
      setPrevious('AddShow')
      setShowInfo(showData)
    }
    const saveShowData = async () => {
      try {
        if (props.route.params.fromCurrentUserShow === true) {
          const show = await props.switchShow(
            showData.userShow.id,
            showData.type
          )
          setUserShow(show)
          setLoading(false)
        } else {
          const show = await props.addShow(showData, showData.type)
          setUserShow(show)
          setLoading(false)
        }
      } catch (err) {
        console.log(err)
      }
    }
    saveShowData()
    return () => {
      setUserShow({})
      setLoading(true)
      setShowInfo(null)
      setFromCurrentUserShow(false)
      setPrevious(null)
      setDescription(null)
      setTags(null)
    }
  }, [props.route.params])

  const skipTags = async () => {
    try {
      if (previous === 'AddShow') {
        props.navigation.navigate('CurrentUser')
      } else if (fromCurrentUserShow) {
        if (showInfo.keep === true) {
          props.navigation.navigate('CurrentUser')
        } else {
          await changeShowTagsAndDescription(tags, userShow.id, description)
        }
      } else {
        if (showInfo.keep === false) {
          props.navigation.pop()
        } else {
          const tagIds = tags.map((tag) => tag.id)
          await changeShowTagsAndDescription(
            tagIds,
            userShow.id,
            showInfo.description
          )
          props.navigation.pop()
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const displayUserShowInfo = () => {
    return (
      <Text style={styles.text}>
        <Text style={{ fontWeight: 'bold' }}>{userShow.show.name}</Text> has
        been added to your{' '}
        {userShow.type === 'watch'
          ? 'Watch'
          : userShow.type === 'seen'
          ? 'Filter out'
          : 'Rec'}{' '}
        list{' '}
      </Text>
    )
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  const image = { uri: userShow.show.imageUrl }
  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {displayUserShowInfo()}
        <Image
          source={image}
          style={{ height: 300, resizeMode: 'contain', margin: 5 }}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              props.navigation.navigate('Add/Change Tags', {
                userShow,
                tags,
                description,
                previous: 'SaveShow',
              })
            }
          >
            <Text style={styles.buttonText}>
              Next: add description and tags
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={skipTags}>
            <Text style={styles.buttonText}>Skip description/tags</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

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
  },
  inputText: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    margin: 5,
    fontWeight: '500',
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#340068',
    marginTop: 5,
  },
})

const mapStateToProps = (state) => ({
  watchShows: state.currentUser.toWatch,
  seenShows: state.currentUser.seen,
  currentUser: state.currentUser.userInfo,
  currentUserShows: state.currentUser.userShows,
})

const mapDispatch = (dispatch) => {
  return {
    addShow: (showInfo, type) => dispatch(addShow(showInfo, type)),
    switchShow: (userShowId, newType) =>
      dispatch(switchShow(userShowId, newType)),
    changeShowTagsAndDescription: (tagIds, userShowId, description) =>
      dispatch(changeShowTagsAndDescription(tagIds, userShowId, description)),
  }
}
export default connect(mapStateToProps, mapDispatch)(SaveShow)
