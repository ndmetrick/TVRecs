import axios from 'axios'
import types from '../constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

// const baseUrl = 'https://tvrecs.herokuapp.com'

// const baseUrl = 'https://10.0.0.98:8080';

const baseUrl = 'http://10.0.0.171:8080'
// const baseUrl = 'http://localhost:8080';

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token')
    if (token) {
      const headers = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
      return headers
    }
    return null
  } catch (err) {
    console.error(err)
  }
}

AsyncStorage.removeItem('token')

export function logout() {
  return async (dispatch) => {
    try {
      await AsyncStorage.removeItem('token')
      dispatch({ type: types.LOGGING_OUT })
    } catch (e) {
      console.log(e)
    }
  }
}

export function getAPIKey(api) {
  return async () => {
    try {
      const key = await axios.get(`${baseUrl}/api/users/keys/${api}`)
      return key.data
    } catch (e) {
      console.log(e)
    }
  }
}

export function getAuthInfo() {
  return async () => {
    try {
      const authInfo = await axios.get(`${baseUrl}/api/users/authInfo`)
      return authInfo.data
    } catch (e) {
      console.log(e)
    }
  }
}

export function getCurrentUser() {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const user = await axios.get(`${baseUrl}/api/users/login`, headers)
      dispatch({
        type: types.GET_CURRENT_USER,
        currentUser: user.data,
      })
    } catch (err) {
      console.error(err)
    }
  }
}

export function addToWatchProviders(watchInfo) {
  return async (dispatch) => {
    try {
      console.log('watchInfo', watchInfo)
      dispatch({
        type: types.ADD_TO_WATCH_PROVIDERS,
        watchInfo,
      })
    } catch (err) {
      console.error(err)
    }
  }
}

export function getUserShows(uid) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      console.log('auth', headers)
      const userShows = await axios.get(
        `${baseUrl}/api/users/shows/${uid}`,
        headers
      )
      if (userShows.data != -1) {
        if (uid === undefined) {
          dispatch({
            type: types.GET_CURRENT_USER_SHOWS,
            userShows: userShows.data,
          })
        } else {
          dispatch({
            type: types.GET_OTHER_USER_SHOWS,
            userShows: userShows.data,
          })
          return userShows.data
        }
      }
    } catch (err) {
      console.error(err)
    }
  }
}

export function getSingleUserShow(uid, showId) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const userShow = await axios.get(
        `${baseUrl}/api/users/singleShow?uid=${uid}&showId=${showId}`,
        headers
      )
      if (userShow.data) {
        return userShow.data
      }
    } catch (err) {
      console.error(err)
    }
  }
}

export function getUserShowsToWatch() {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const toWatch = await axios.get(
        `${baseUrl}/api/users/showsToWatch`,
        headers
      )
      if (toWatch.data != -1) {
        dispatch({
          type: types.GET_TO_WATCH,
          toWatch: toWatch.data,
        })
      }
    } catch (err) {
      console.error(err)
    }
  }
}

export function getUserShowsSeen() {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const seen = await axios.get(`${baseUrl}/api/users/seenShows`, headers)
      if (seen.data != -1) {
        dispatch({
          type: types.GET_SEEN,
          seen: seen.data,
        })
      }
    } catch (err) {
      console.error(err)
    }
  }
}

export function getUserFollowing(uid) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const followed = await axios.get(
        `${baseUrl}/api/users/following/${uid}`,
        headers
      )
      if (followed) {
        console.log('i got to this point and this is following', followed.data)
        if (uid) {
          dispatch({
            type: types.GET_OTHER_USER_FOLLOWING,
            following: followed.data,
          })
          return followed.data
        } else {
          console.log('following', followed.data)
          dispatch({
            type: types.GET_USER_FOLLOWING,
            following: followed.data,
          })
        }
      }
    } catch (err) {
      console.error(err)
    }
  }
}

export function getUsersFollowingRecs() {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const recs = await axios.get(`${baseUrl}/api/users/recs`, headers)
      dispatch({ type: types.GET_FOLLOWING_RECS, recs: recs.data })
    } catch (e) {
      console.error(e)
    }
  }
}

export function addShow(showInfo, type) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const addedShow = await axios.put(
        `${baseUrl}/api/users/addShow/${type}`,
        showInfo,
        headers
      )
      if (addedShow) {
        dispatch({
          type: types.ADD_SHOW,
          userShow: addedShow.data,
          showType: type,
        })
        return addedShow.data
      } else {
        console.log('Something went wrong trying to add show')
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function changeCountry(newCountry) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const updatedUser = await axios.put(
        `${baseUrl}/api/users/changeCountry`,
        { newCountry: newCountry },
        headers
      )
      if (updatedUser) {
        dispatch({
          type: types.GET_CURRENT_USER,
          currentUser: updatedUser.data,
        })
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function changeUserTagsAndDescription(userTagIds, description) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const changedInfo = await axios.put(
        `${baseUrl}/api/users/changeUserTags/`,
        { userTagIds, description },
        headers
      )
      if (changedInfo) {
        dispatch({
          type: types.CHANGE_USER_TAGS,
          tags: changedInfo.data.tags,
          description: changedInfo.data.description,
        })
      } else {
        console.log('Something went wrong trying to add tags')
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function getUserTags(uid) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const tags = await axios.get(
        `${baseUrl}/api/users/getUserTags/${uid}`,
        headers
      )
      if (tags) {
        if (uid) {
          dispatch({ type: types.GET_OTHER_USER_TAGS, tags: tags.data })
          return tags.data
        } else {
          dispatch({ type: types.GET_USER_TAGS, tags: tags.data })
        }
      } else {
        console.log('Something went wrong trying to add tags')
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function getAllTags() {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const tags = await axios.get(`${baseUrl}/api/users/getAllTags/`, headers)
      if (tags) {
        dispatch({ type: types.GET_ALL_TAGS, tags: tags.data })
      } else {
        console.log('Something went wrong trying to get tags')
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function getMatchingUsers(filters) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const users = await axios.put(
        `${baseUrl}/api/users/getMatchingUsers/`,
        { filters },
        headers
      )
      if (users) {
        console.log('users in getmatchingusers', users.data)
        return users.data
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function getMatchingRecs(filters) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const response = await axios.put(
        `${baseUrl}/api/users/getMatchingRecs/`,
        { filters },
        headers
      )
      if (response) {
        if (filters['chooseStreamers']) {
          console.log('i got into this', response.data)
          const { recs, newWatchProviders } = response.data
          dispatch({
            type: types.GET_MATCHING_RECS_AND_WATCH,
            recs,
            newWatchProviders,
          })
          console.log(
            'recs and watch in getmatchingusers',
            recs,
            newWatchProviders
          )
          return response.data
        } else {
          dispatch({ type: types.GET_MATCHING_RECS, recs: response.data })
          console.log('recs in getmatchingusers', response.data)
          return response.data
        }
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function changeShowTagsAndDescription(tagIds, userShowId, description) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      console.log('i got in here')
      const changedUserShow = await axios.put(
        `${baseUrl}/api/users/changeShowTags/`,
        { tagIds, userShowId, description },
        headers
      )
      if (changedUserShow) {
        console.log('front end userShow', changedUserShow.data)
        dispatch({
          type: types.CHANGE_SHOW_TAGS,
          userShow: changedUserShow.data,
        })
      } else {
        console.log('Something went wrong trying to add tags')
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function switchShow(userShowId, newType) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const switchedShow = await axios.put(
        `${baseUrl}/api/users/switchShow`,
        { userShowId, newType },
        headers
      )
      if (switchedShow) {
        console.log(
          'i got to this same place and switchd show is',
          switchedShow.data
        )
        dispatch({
          type: types.SWITCH_SHOW,
          oldType: switchedShow.data.oldType,
          userShow: switchedShow.data.userShow,
        })
        return switchedShow.data.userShow
      } else {
        console.log('Something went wrong trying to add show')
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function deleteShow(showId) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const deletedShow = await axios.put(
        `${baseUrl}/api/users/deleteShow/`,
        { showId },
        headers
      )
      if (deletedShow) {
        dispatch({
          type: types.DELETE_SHOW,
          userShow: deletedShow.data,
        })
      } else {
        console.log('Something went wrong trying to delete show')
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function follow(uid) {
  return async (dispatch) => {
    try {
      console.log('uid', uid)
      const headers = await getToken()
      const followed = await axios.put(
        `${baseUrl}/api/users/follow`,
        { uid: uid },
        headers
      )
      if (followed) {
        dispatch({ type: types.FOLLOW, following: followed.data })
      } else {
        console.log('Something went wrong trying to follow this user')
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function unfollow(uid) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const unfollowed = await axios.put(
        `${baseUrl}/api/users/unfollow`,
        { uid: uid },
        headers
      )
      if (unfollowed) {
        dispatch({ type: types.UNFOLLOW, unfollowed: unfollowed.data })
      } else {
        console.log('Something went wrong trying to unfollow this user')
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export function getAllOtherUsers() {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const users = await axios.get(`${baseUrl}/api/users/all`, headers)
      dispatch({ type: types.GET_ALL_OTHER_USERS, users: users.data })
    } catch (e) {
      console.error(e)
    }
  }
}

export function clearData() {
  return (dispatch) => {
    dispatch({ type: types.CLEAR_DATA })
  }
}

export function getOtherUser(userId) {
  return async (dispatch) => {
    try {
      const headers = await getToken()
      const user = await axios.get(
        `${baseUrl}/api/users/otherUser/${userId}`,
        headers
      )
      dispatch({ type: types.GET_OTHER_USER, user: user.data })
      return user.data
    } catch (e) {
      console.error(e)
    }
  }
}

export default {
  getCurrentUser,
  getOtherUser,
  addShow,
  deleteShow,
  follow,
  unfollow,
  clearData,
  getAllOtherUsers,
  getUserFollowing,
  getUserShows,
  getUsersFollowingRecs,
  getUserTags,
  changeUserTagsAndDescription,
  changeShowTagsAndDescription,
  getAuthInfo,
  getAPIKey,
  logout,
}
