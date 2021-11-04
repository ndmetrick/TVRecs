import axios from 'axios';
import types from '../constants';
import { SnapshotViewIOSComponent } from 'react-native';

export function getCurrentUser() {
  return async (dispatch) => {
    try {
      console.log('i got to getCurrentUser and next is w');
      const w = await axios.get('/api/users');
      console.log('i did not get stuck yet');
      console.log(w);
      const user = await axios.get(`/auth/login`);
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
      console.log('i got to adduser');
      const user = await axios.post('/auth/signup');
      dispatch({ type: types.GET_CURRENT_USER, currentUser: user.data() });
    } catch (e) {
      console.error(e);
    }
  };
}

export function addShow(showName, imdbId, imageUrl, streaming, purchase) {
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
      const users = await axios.get(`/api/users/usersFollowing`);
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
      const user = await axios.get(`/api/users/userFollowers`);
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
      const user = await axios.get(`/api/users/currentUser`);
      dispatch({
        type: types.GET_CURRENT_USER,
        currentUser: user.data(),
      });
    } catch (err) {
      console.error(err);
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
  getUsersFollowing,
  getUserFollowers,
  getCurrentUserShows,
  clearData,
};
