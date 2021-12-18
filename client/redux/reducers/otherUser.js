import {
  GET_OTHER_USER_SHOWS,
  GET_OTHER_USER,
  GET_OTHER_USER_FOLLOWING,
  CLEAR_OTHER_USER,
  GET_OTHER_USER_TAGS,
} from '../constants';

const initialState = {
  userInfo: null,
  userShows: [],
  following: [],
  // showList: [],
  userTags: [],
};

export default function otherUserReducer(state = initialState, action) {
  switch (action.type) {
    case GET_OTHER_USER:
      return {
        ...state,
        userInfo: action.user,
      };
    case GET_OTHER_USER_SHOWS:
      return {
        ...state,
        userShows: action.userShows,
        //   showList: action.userShows.map((userShow) => userShow.show.name),
      };
    case GET_OTHER_USER_FOLLOWING:
      return {
        ...state,
        following: action.following,
      };
    case GET_OTHER_USER_TAGS:
      return {
        ...state,
        userTags: action.tags,
      };
    case CLEAR_OTHER_USER:
      return {
        initialState,
      };
    default:
      return state;
  }
}
