import axios from 'axios';
import types from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseUrl = 'http://10.0.0.94:8080';

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    return headers;
  } catch (err) {
    console.error(err);
  }
};

export function getCurrentUser() {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const user = await axios.get(`${baseUrl}/api/users/login`, headers);
      console.log('user', user.data);
      dispatch({
        type: types.GET_CURRENT_USER,
        currentUser: user.data,
      });
    } catch (err) {
      console.error(err);
    }
  };
}

export function getUserShows(uid) {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const userShows = await axios.get(
        `${baseUrl}/api/users/shows/${uid}`,
        headers
      );
      if (userShows.data != -1) {
        console.log('userShows.data = ', userShows.data);
        if (uid === undefined) {
          dispatch({
            type: types.GET_CURRENT_USER_SHOWS,
            userShows: userShows.data,
          });
        } else {
          dispatch({
            type: types.GET_OTHER_USER_SHOWS,
            userShows: userShows.data,
          });
          return userShows.data;
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
}

export function getUserShowsToWatch() {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const toWatch = await axios.get(
        `${baseUrl}/api/users/showsToWatch`,
        headers
      );
      if (toWatch.data != -1) {
        dispatch({
          type: types.GET_TO_WATCH,
          toWatch: toWatch.data,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
}

export function getUserFollowing() {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const user = await axios.get(`${baseUrl}/api/users/following`, headers);
      dispatch({
        type: types.GET_USER_FOLLOWING,
        following: user.data,
      });
    } catch (err) {
      console.error(err);
    }
  };
}

export function getUsersFollowingRecs() {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const recs = await axios.get(`${baseUrl}/api/users/recs`, headers);
      console.log('recs on front end', recs.data);
      dispatch({ type: types.GET_FOLLOWING_RECS, recs: recs.data });
    } catch (e) {
      console.error(e);
    }
  };
}

export function addShow(showInfo, toWatch) {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const addedShow = await axios.put(
        `${baseUrl}/api/users/addShow/${toWatch}`,
        showInfo,
        headers
      );
      if (addedShow) {
        dispatch({ type: types.ADD_SHOW, userShow: addedShow.data, toWatch });
      } else {
        console.log('Something went wrong trying to add show');
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export function switchShow(userShowId, description) {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const addedShow = await axios.put(
        `${baseUrl}/api/users/switchShow`,
        { userShowId, description },
        headers
      );
      if (addedShow) {
        dispatch({ type: types.ADD_SHOW, userShow: addedShow.data });
      } else {
        console.log('Something went wrong trying to add show');
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export function deleteShow(showId, toWatch) {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const deletedShow = await axios.put(
        `${baseUrl}/api/users/deleteShow/`,
        { showId },
        headers
      );
      if (deletedShow) {
        dispatch({
          type: types.DELETE_SHOW,
          userShow: deletedShow.data,
          toWatch,
        });
      } else {
        console.log('Something went wrong trying to delete show');
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export function follow(uid) {
  return async (dispatch) => {
    try {
      console.log('uid', uid);
      const headers = await getToken();
      const followed = await axios.put(
        `${baseUrl}/api/users/follow`,
        { uid: uid },
        headers
      );
      if (followed) {
        dispatch({ type: types.FOLLOW, following: followed.data });
      } else {
        console.log('Something went wrong trying to follow this user');
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export function unfollow(uid) {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const unfollowed = await axios.put(
        `${baseUrl}/api/users/unfollow`,
        { uid: uid },
        headers
      );
      if (unfollowed) {
        dispatch({ type: types.UNFOLLOW, unfollowed: unfollowed.data });
      } else {
        console.log('Something went wrong trying to unfollow this user');
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export function getAllOtherUsers() {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const users = await axios.get(`${baseUrl}/api/users/all`, headers);
      dispatch({ type: types.GET_ALL_OTHER_USERS, users: users.data });
    } catch (e) {
      console.error(e);
    }
  };
}

export function clearData() {
  return (dispatch) => {
    dispatch({ type: types.CLEAR_DATA });
  };
}

export function getOtherUser(userId) {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const user = await axios.get(
        `${baseUrl}/api/users/otherUser/${userId}`,
        headers
      );
      dispatch({ type: types.GET_OTHER_USER, user: user.data });
      return user.data;
    } catch (e) {
      console.error(e);
    }
  };
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
};
