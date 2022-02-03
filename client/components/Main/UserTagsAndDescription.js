import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { logout, changeCountry } from '../../redux/actions'
import { Tabs } from 'react-native-collapsible-tab-view'

function UserTagsAndDescription(props) {
  const { currentUser } = props
  const isFocused = useIsFocused()

  const [user, setUser] = useState(null)
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [userTags, setUserTags] = useState([])

  useEffect(() => {
    if (props.previous === 'Settings') {
      setIsCurrentUser(true)
      setUser(props.currentUser)
    } else {
      setIsCurrentUser(false)
      setUser(props.user)
    }
    const allUserTags =
      props.previous === 'Settings'
        ? props.currentUserTags
        : props.otherUserTags
    if (allUserTags) {
      const like = []
      const dislike = []
      const describe = []
      allUserTags.forEach((tag) => {
        if (tag.type === 'profile-describe') {
          describe.push(tag)
        } else if (tag.type === 'warning' || tag.type === 'profile-dislike') {
          dislike.push(tag)
        } else {
          like.push(tag)
        }
      })
      const tags = []
      tags.like = like
      tags.describe = describe
      tags.dislike = dislike
      // console.log('tagsHere', tags)
      setUserTags(tags)
    }
    return () => {
      setIsCurrentUser(false)
      setUser(null)
      setUserTags([])
    }
  }, [props.currentUser, isFocused])

  if (user === null || !userTags || !userTags.like) {
    console.log('what is happening', userTags.like)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  const displayTags = (tags, type) => {
    const tagStyle =
      type === 'like'
        ? styles.highlightLikeTag
        : type === 'dislike'
        ? styles.highlightDislikeTag
        : styles.highlightDescribeTag

    return tags.map((tag, key) => {
      return (
        <View key={key} style={tagStyle}>
          <Text style={styles.tagText}>{tag.name}</Text>
        </View>
      )
    })
  }

  return (
    <>
      {!isCurrentUser ? (
        <Tabs.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <View>
            {!user.description ? (
              <View style={styles.otherUser}>
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>TV Bio: </Text>None yet
                </Text>
              </View>
            ) : (
              <View style={styles.otherUser}>
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>TV Bio: </Text>
                  {user.description}
                </Text>
              </View>
            )}
            {!userTags.like.length &&
            !userTags.dislike.length &&
            !userTags.describe.length ? (
              <View style={styles.otherUser}>
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>User Tags:</Text> None
                  yet.
                </Text>
              </View>
            ) : (
              <View style={styles.otherUser}>
                <View>
                  {userTags.like.length ? (
                    <View>
                      <Text style={{ ...styles.text, fontWeight: 'bold' }}>
                        These tags describe the kinds of shows {user.username}{' '}
                        likes best:
                      </Text>
                      <View style={[styles.cardContent, styles.tagsContent]}>
                        {displayTags(userTags.like, 'like')}
                      </View>
                    </View>
                  ) : null}

                  {userTags.dislike.length ? (
                    <View>
                      <Text style={{ ...styles.text, fontWeight: 'bold' }}>
                        These tags describe things {user.username} tries to
                        avoid seeing:
                      </Text>
                      <View style={[styles.cardContent, styles.tagsContent]}>
                        {displayTags(userTags.dislike, 'dislike')}
                      </View>
                    </View>
                  ) : null}

                  {userTags.describe.length ? (
                    <View>
                      <Text style={{ ...styles.text, fontWeight: 'bold' }}>
                        These tags describe the kind of television watcher{' '}
                        {user.username} is:
                      </Text>
                      <View style={[styles.cardContent, styles.tagsContent]}>
                        {displayTags(userTags.describe, 'describe')}
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>
            )}
          </View>
        </Tabs.ScrollView>
      ) : (
        // <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Text style={{ ...styles.text, marginBottom: 5, marginTop: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>TV Bio: </Text>
            {!props.currentUser.description
              ? 'Currently you have no tv bio on your profile. Click the button below if you would like to add one.'
              : props.currentUser.description}
          </Text>
          {!userTags.like.length &&
          !userTags.dislike.length &&
          !userTags.describe.length ? (
            <Text style={styles.text}>
              <Text style={{ fontWeight: 'bold' }}>User Tags:</Text> Currently
              you have no user tags. Click the button below if you would like to
              add some.
            </Text>
          ) : (
            <View>
              {userTags.like.length ? (
                <View>
                  <Text style={{ ...styles.text, fontWeight: 'bold' }}>
                    These tags describe the kinds of shows you like best:
                  </Text>
                  <View style={[styles.cardContent, styles.tagsContent]}>
                    {displayTags(userTags.like, 'like')}
                  </View>
                </View>
              ) : null}

              {userTags.dislike.length ? (
                <View>
                  <Text style={{ ...styles.text, fontWeight: 'bold' }}>
                    These tags describe things you try to avoid seeing:
                  </Text>
                  <View style={[styles.cardContent, styles.tagsContent]}>
                    {displayTags(userTags.dislike, 'dislike')}
                  </View>
                </View>
              ) : null}

              {userTags.describe.length ? (
                <View>
                  <Text style={{ ...styles.text, fontWeight: 'bold' }}>
                    These tags describe the kind of television watcher you are:
                  </Text>
                  <View style={[styles.cardContent, styles.tagsContent]}>
                    {displayTags(userTags.describe, 'describe')}
                  </View>
                </View>
              ) : null}
            </View>
          )}
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 30,
  },
  containerInfo: {
    margin: 5,
    padding: 5,
  },
  text: {
    textAlign: 'left',
    fontSize: 18,
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
  cardContent: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  tagsContent: {
    marginTop: 10,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  highlightLikeTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#008DD5',
    marginTop: 5,
  },
  highlightDislikeTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#E24E1B',
    marginTop: 5,
  },
  highlightDescribeTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#7B5D96',
    marginTop: 5,
  },

  tagText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  otherUser: {
    margin: 10,
  },
})

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  otherUser: store.otherUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  otherUserShows: store.otherUser.userShows,
  following: store.currentUser.following,
  otherUsers: store.allOtherUsers.usersInfo,
  currentUserTags: store.currentUser.userTags,
  otherUserTags: store.otherUser.userTags,
})

export default connect(mapStateToProps)(UserTagsAndDescription)
