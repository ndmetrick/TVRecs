import axios from 'axios';
import types from '../constants';
import { SnapshotViewIOSComponent } from 'react-native';
require('firebase/firestore');

// REWRITE WITH AUTH0 if using
const getToken = () => {
  const token = window.localStorage.getItem('token');
  const headers = {
    headers: {
      authorization: token,
    },
  };
  return headers;
};

export function getCurrentUser() {
  return async (dispatch) => {
    try {
      const user = await axios.get(`/api/auth/login`);
      dispatch({
        type: types.GET_CURRENT_USER,
        currentUser: user.data(),
      });
    } catch (err) {
      console.error(err);
    }
  };
}

export function addUser() {
  return async (dispatch) => {
    try {
      const user = await axios.post('/api/auth/signup');
      dispatch({ type: types.GET_CURRENT_USER, currentUser: user.data() });
    } catch (e) {
      console.error(e);
    }
  };
}

export function addShow(showName, imageUrl, streaming, purchase) {
  return async (dispatch) => {
    try {
      const showAdded = await axios.put();
      if (showAdded) {
        dispatch({ type: types.USER_STATE_CHANGE, currentUser: user.data() });
      } else {
        console.log('User does not exist');
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export function getUsersFollowing() {
  return async (dispatch) => {
    try {
      const users = await axios.get(`/api/users/usersFollowing`, getToken());
      dispatch({
        type: types.GET_USERS_FOLLOWING,
        usersFollowing: users.data(),
      });
    } catch (err) {
      console.error(err);
    }
  };
}

export function getUserFollowers() {
  return async (dispatch) => {
    try {
      const user = await axios.get(`/api/users/userFollowers`, getToken());
      dispatch({
        type: types.GET_USER_FOLLOWERS,
        currentUser: user.data(),
      });
    } catch (err) {
      console.error(err);
    }
  };
}

export function getCurrentUserShows() {
  return async (dispatch) => {
    try {
      const user = await axios.get(`/api/users/currentUser`, getToken());
      dispatch({
        type: types.GET_CURRENT_USER,
        currentUser: user.data(),
      });
    } catch (err) {
      console.error(err);
    }
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
  getToken,
  getUsersFollowing,
  getUserFollowers,
  getCurrentUserShows,
};
