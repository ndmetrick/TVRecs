import {
  USER_STATE_CHANGE,
  USER_SHOWS_STATE_CHANGE,
  USER_FOLLOWING_STATE_CHANGE,
  CLEAR_DATA,
} from '../constants';

const initialState = {
  currentUser: null,
  tvShows: [],
  following: [],
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case USER_STATE_CHANGE:
      return { ...state, currentUser: action.currentUser };
    case USER_SHOWS_STATE_CHANGE:
      return {
        ...state,
        shows: action.shows,
      };

    case USER_FOLLOWING_STATE_CHANGE:
      return {
        ...state,
        following: action.following,
      };
    case CLEAR_DATA:
      return initialState;
    default:
      return state;
  }
}
