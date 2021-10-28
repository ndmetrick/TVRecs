import {
  USERS_DATA_STATE_CHANGE,
  USERS_SHOWS_STATE_CHANGE,
  CLEAR_DATA,
} from '../constants';

const initialState = {
  users: [],
  recShows: [],
  usersFollowingLoaded: 0,
};

export default function usersReducer(state = initialState, action) {
  switch (action.type) {
    case USERS_DATA_STATE_CHANGE:
      return {
        ...state,
        users: [...state.users, action.user],
      };
    case USERS_SHOWS_STATE_CHANGE:
      return {
        ...state,
        usersFollowingLoaded: state.usersFollowingLoaded + 1,
        // users: state.users.map(user => uid === action.uid ? { ...user, shows: action.shows } : user),
        recShows: [...state.recShows, ...action.shows],
      };
    case CLEAR_DATA:
      return initialState;
    default:
      return state;
  }
}
