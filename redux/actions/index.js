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

export function getTags() {
  return async (dispatch) => {
    try {
      const tagsInfo = await firebase.firestore().collection('tags').get();
      let tags = tagsInfo.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data };
      });
      dispatch({ type: types.GET_TAGS, tags });
    } catch (e) {
      console.error(e);
    }
  };
}

export function getUserShows() {
  return async (dispatch) => {
    try {
      firebase
        .firestore()
        .collection('shows')
        .doc(firebase.auth().currentUser.uid)
        .collection('userShows')
        .orderBy('creation', 'asc')
        .onSnapshot((snapshot) => {
          const uid = firebase.auth().currentUser.uid;
          let shows = snapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return { uid, id, ...data };
          });
          dispatch({ type: types.USER_SHOWS_STATE_CHANGE, shows });
        });
    } catch (e) {
      console.error(e);
    }
  };
}

export function getUserSingleShow(showId) {
  return async (dispatch) => {
    try {
      const userShow = await firebase
        .firestore()
        .collection('shows')
        .doc(firebase.auth().currentUser.uid)
        .collection('userShows')
        .doc(showId)
        .get();
      const data = await userShow.data();
      const id = userShow.id;
      const uid = await firebase.auth().currentUser.uid;
      const show = { uid, id, ...data };
      console.log('TYPES', types);
      console.log('sSHOWWHO', show);
      dispatch({ type: types.USER_SHOW_STATE_CHANGE, show });
    } catch (e) {
      console.error(e);
    }
  };
}

export function getUsersSingleShow(uid, showId) {
  return async (dispatch) => {
    try {
      const usersShow = await firebase
        .firestore()
        .collection('shows')
        .doc(uid)
        .collection('userShows')
        .doc(showId)
        .get();
      const data = await usersShow.data();
      const id = usersShow.id;
      const show = { uid, id, ...data };
      dispatch({ type: types.USERS_SHOW_STATE_CHANGE, show });
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

export function getUsersFollowingShows(uid) {
  return async (dispatch, getState) => {
    try {
      const followingShows = await firebase
        .firestore()
        .collection('shows')
        .doc(uid)
        .collection('userShows')
        .orderBy('creation', 'asc')
        .get();
      const user = getState().usersState.users.find((user) => user.uid === uid);
      let shows = followingShows.docs.map((doc) => {
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

// export function getUsersFollowingShows(uid) {
//   return (dispatch, getState) => {
//     firebase
//       .firestore()
//       .collection('shows')
//       .doc(uid)
//       .collection('userShows')
//       .orderBy('creation', 'asc')
//       .get()
//       .then((snapshot) => {
//         const uid = snapshot.query.EP.path.segments[1];
//         const user = getState().usersState.users.find(
//           (user) => user.uid === uid
//         );
//         let shows = snapshot.docs.map((doc) => {
//           const data = doc.data();
//           const id = doc.id;
//           return { id, ...data, user };
//         });
//         dispatch({ type: types.USERS_SHOWS_STATE_CHANGE, shows, uid });
//       });
//   };
// }

export default {
  getUser,
  clearData,
  getUserShows,
  getUserFollowing,
  getUsersData,
  getUsersFollowingShows,
};
