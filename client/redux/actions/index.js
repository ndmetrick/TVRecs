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
      dispatch({
        type: types.GET_CURRENT_USER,
        currentUser: user.data,
      });
    } catch (err) {
      console.error(err);
    }
  };
}

export function getUserShows() {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const user = await axios.get(`${baseUrl}/api/users/shows`, headers);
      dispatch({
        type: types.GET_USER_SHOWS,
        userShows: user.data,
      });
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

export function addShow(showInfo) {
  return async (dispatch) => {
    try {
      const headers = await getToken();
      const addedShow = await axios.put(
        `${baseUrl}/api/users/addShow`,
        showInfo,
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

export function deleteShow(showId) {
  return async (dispatch) => {
    try {
      console.log('showId in store', showId);
      const headers = await getToken();
      const deletedShow = await axios.put(
        `${baseUrl}/api/users/deleteShow`,
        { showId },
        headers
      );
      if (deletedShow) {
        dispatch({ type: types.DELETE_SHOW, userShow: deletedShow.data });
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
      const headers = await getToken();
      const followed = await axios.put(
        `${baseUrl}/api/users/follow`,
        uid,
        headers
      );
      if (followed) {
        dispatch({ type: types.FOLLOW, followed: followed.data });
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
      const unfollowed = await axios.delete(
        `${baseUrl}/api/users/unfollow`,
        uid,
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

export function clearData() {
  return (dispatch) => {
    dispatch({ type: types.CLEAR_DATA });
  };
}

export function getSingleUser(userId) {
  return async (dispatch) => {
    try {
      const user = await axios.get(`/api/users/${userId}`);
      dispatch({ type: types.GET_SINGLE_USER, user });
    } catch (e) {
      console.error(e);
    }
  };
}

export default {
  getCurrentUser,
  getSingleUser,
  addShow,
  deleteShow,
  follow,
  unfollow,
  clearData,
};
