import {
  GET_CURRENT_USER,
  CLEAR_DATA,
  ADD_SHOW,
  DELETE_SHOW,
  FOLLOW,
  UNFOLLOW,
  GET_CURRENT_USER_SHOWS,
  GET_USER_FOLLOWING,
  GET_FOLLOWING_RECS,
  GET_TO_WATCH,
  SWITCH_SHOW,
} from '../constants';

const initialState = {
  userInfo: null,
  userShows: [],
  following: [],
  recShows: [],
  showList: [],
  tags: [],
  toWatch: [],
  watchList: [],
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case GET_CURRENT_USER:
      return {
        ...state,
        userInfo: action.currentUser,
      };
    case GET_CURRENT_USER_SHOWS:
      return {
        ...state,
        userShows: action.userShows,
        showList: action.userShows.map((userShow) => userShow.show.name),
      };
    case GET_TO_WATCH:
      return {
        ...state,
        toWatch: action.toWatch,
        watchList: action.toWatch.map((userShow) => userShow.show.name),
      };
    case GET_USER_FOLLOWING:
      return {
        ...state,
        following: action.following,
      };
    case ADD_SHOW:
      return action.toWatch === false
        ? {
            ...state,
            userShows: [...state.userShows, action.userShow],
            showList: [...state.showList, action.userShow.show.name],
          }
        : {
            ...state,
            toWatch: [...state.toWatch, action.userShow],
            watchList: [...state.watchList, action.userShow.show.name],
          };
    case DELETE_SHOW:
      return action.userShow.toWatch === false
        ? {
            ...state,
            userShows: state.userShows.filter(
              (userShow) => userShow.show.id !== action.userShow.show.id
            ),
            showList: state.showList.filter(
              (showName) => showName !== action.userShow.show.name
            ),
          }
        : {
            ...state,
            toWatch: state.toWatch.filter(
              (toWatch) => toWatch.show.id !== action.userShow.show.id
            ),
            watchList: state.watchList.filter(
              (showName) => showName !== action.userShow.show.name
            ),
          };
    case SWITCH_SHOW:
      return {
        ...state,
        userShows: [...state.userShows, action.userShow],
        showList: [...state.showList, action.userShow.show.name],
        toWatch: state.toWatch.filter(
          (userShow) => userShow.show.id !== action.userShow.show.id
        ),
        watchList: [
          ...state.watchList.filter(
            (showName) => showName !== action.userShow.show.name
          ),
        ],
      };
    case FOLLOW:
      return {
        ...state,
        following: [...state.following, action.following],
      };
    case UNFOLLOW:
      return {
        ...state,
        following: state.following.filter(
          (followed) => followed.id !== action.unfollowed.id
        ),
        recShows: state.recShows.filter(
          (userShow) => userShow.user.id !== action.unfollowed.id
        ),
      };
    case GET_FOLLOWING_RECS:
      return {
        ...state,
        recShows: action.recs,
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
