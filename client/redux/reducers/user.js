import {
  GET_CURRENT_USER,
  USER_SHOWS_STATE_CHANGE,
  USER_FOLLOWING_STATE_CHANGE,
  CLEAR_DATA,
  GET_TAGS,
} from '../constants';

const initialState = {
  currentUser: null,
  shows: [],
  following: [],
  showList: [],
  tags: [],
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case GET_CURRENT_USER:
      // how to get the shows and following here / should we do it before here?
      return { ...state, currentUser: action.currentUser };
    case USER_SHOWS_STATE_CHANGE:
      return {
        ...state,
        shows: action.shows,
        showList: action.shows.map((show) => show.showName),
      };
    case USER_FOLLOWING_STATE_CHANGE:
      return {
        ...state,
        following: action.following,
      };
    case GET_TAGS:
      return {
        ...state,
        tags: action.tags,
      };
    case CLEAR_DATA:
      return initialState;
    default:
      return state;
  }
}
