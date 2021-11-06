import axios from 'axios';
import types from '../constants';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { SnapshotViewIOSComponent } from 'react-native';

const baseUrl = process.env.BASEURL;

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
      const user = await axios.get(`${baseUrl}/auth/login`, getToken());
      console.log('user on front end', user.data);
      dispatch({
        type: types.GET_CURRENT_USER,
        currentUser: user.data,
      });
    } catch (err) {
      console.error(err);
    }
  };
}

export function addShow(showInfo) {
  return async (dispatch) => {
    try {
      const showAdded = await axios.put(
        `${baseUrl}/users/addShow`,
        showInfo,
        getToken()
      );
      if (showAdded) {
        dispatch({ type: types.ADD_SHOW, show: showAdded.data });
      } else {
        console.log('Something went wrong trying to add show');
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
