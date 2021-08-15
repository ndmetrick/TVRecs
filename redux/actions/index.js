import firebase from 'firebase/app';
import types from '../constants';
import { SnapshotViewIOSComponent } from 'react-native';
require('firebase/firestore');

export function getUser() {
  return async (dispatch) => {
    try {
      const user = await firebase
        .firestore()
        .collection('users')
        .doc(firebase.auth().currentUser.uid)
        .get();
      if (user.exists) {
        dispatch({ type: types.USER_STATE_CHANGE, currentUser: user.data() });
      } else {
        console.log('User does not exist');
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

export function getUserShows() {
  return async (dispatch) => {
    try {
      const userShows = await firebase
        .firestore()
        .collection('shows')
        .doc(firebase.auth().currentUser.uid)
        .collection('userShows')
        .orderBy('creation', 'asc')
        .get();
      let shows = userShows.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data };
      });
      dispatch({ type: types.USER_SHOWS_STATE_CHANGE, shows });
    } catch (e) {
      console.error(e);
    }
  };
}

// export function getUserShowDetails(docId) {
//   return async (dispatch) => {
//     try {
//       const userShowDetails = await firebase
//         .firestore()
//         .collection('shows')
//         .doc(firebase.auth().currentUser.uid)
//         .collection('userShows')
//         .doc(docId)
//         .get();
//       let show = { id: userShowDetails.id, ...userShowDetails.data };
//       dispatch({ type: types.USER_SHOW_DETAILS, show });
//     } catch (e) {
//       console.error(e);
//     }
//   };
// }

export function getUserFollowing() {
  return async (dispatch) => {
    try {
      await firebase
        .firestore()
        .collection('following')
        .doc(firebase.auth().currentUser.uid)
        .collection('userFollowing')
        .onSnapshot((snapshot) => {
          let following = snapshot.docs.map((doc) => {
            const id = doc.id;
            return id;
          });
          dispatch({ type: types.USER_FOLLOWING_STATE_CHANGE, following });
          following.forEach((followedUser) => {
            dispatch(getUsersData(followedUser));
          });
        });
    } catch (e) {
      console.error(e);
    }
  };
}

export function getUsersData(uid) {
  return async (dispatch, getState) => {
    try {
      const foundInUsers = getState().usersState.users.some(
        (user) => user.uid === uid
      );
      if (!foundInUsers) {
        const userInfo = await firebase
          .firestore()
          .collection('users')
          .doc(uid)
          .get();

        if (userInfo.exists) {
          let user = userInfo.data();
          user.uid = userInfo.id;
          dispatch({ type: types.USERS_DATA_STATE_CHANGE, user });
          dispatch(getUsersFollowingShows(uid));
        } else {
          console.log('does not exist');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export function getUsersFollowingShows(userId) {
  return async (dispatch, getState) => {
    try {
      const followedShows = await firebase
        .firestore()
        .collection('shows')
        .doc(userId)
        .collection('userShows')
        .orderBy('creation', 'asc')
        .get();
      const uid = followedShows.query.EP.path.segments[1];
      const user = getState().usersState.users.find((user) => user.uid === uid);

      let shows = followedShows.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data, user };
      });

      dispatch({ type: types.USERS_SHOWS_STATE_CHANGE, shows, uid });
    } catch (e) {
      console.error(e);
    }
  };
}

export default {
  getUser,
  clearData,
  getUserShows,
  getUserFollowing,
  getUsersData,
  getUsersFollowingShows,
};
