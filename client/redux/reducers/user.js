import {
  GET_CURRENT_USER,
  CLEAR_DATA,
  ADD_SHOW,
  DELETE_SHOW,
  FOLLOW,
  UNFOLLOW,
  GET_USER_SHOWS,
  GET_USER_FOLLOWING,
} from '../constants';

const initialState = {
  currentUser: null,
  userShows: [],
  following: [],
  showList: [],
  tags: [],
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case GET_CURRENT_USER:
      return {
        ...state,
        currentUser: action.currentUser,
      };
    case GET_USER_SHOWS:
      return {
        ...state,
        userShows: action.userShows,
        showList: action.userShows.map((userShow) => userShow.show.showName),
      };
    case GET_USER_FOLLOWING:
      return {
        ...state,
        following: action.following,
      };
    case ADD_SHOW:
      return {
        ...state,
        userShows: [...state.userShows, action.userShow],
        showList: [...state.showList, action.userShow.show.showName],
      };
    case DELETE_SHOW:
      return {
        ...state,
        userShows: state.userShows.filter(
          (userShow) => userShow.show.id !== action.userShow.show.id
        ),
        showList: state.showList.filter(
          (showName) => showName !== action.userShow.show.showName
        ),
      };
    case FOLLOW:
      return {
        ...state,
        following: [...state.following, action.followed],
      };
    case UNFOLLOW:
      return {
        ...state,
        following: state.following.filter(
          (followed) => followed.id !== action.followed.id
        ),
      };
    // case GET_TAGS:
    //   return {
    //     ...state,
    //     tags: action.tags,
    //   };
    case CLEAR_DATA:
      return initialState;
    default:
      return state;
  }
}
