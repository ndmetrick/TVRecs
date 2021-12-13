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
  GET_USER_TAGS,
  CHANGE_USER_TAGS,
  CHANGE_SHOW_TAGS,
  LOGGING_OUT,
  CHANGE_COUNTRY,
} from '../constants';

const initialState = {
  userInfo: null,
  userShows: [],
  following: [],
  recShows: [],
  showList: [],
  userTags: [],
  toWatch: [],
  watchList: [],
  seen: [],
  seenList: [],
  loggingOut: false,
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
      return action.showType === 'rec'
        ? {
            ...state,
            userShows: [...state.userShows, action.userShow],
            showList: [...state.showList, action.userShow.show.name],
          }
        : action.showType === 'watch'
        ? {
            ...state,
            toWatch: [...state.toWatch, action.userShow],
            watchList: [...state.watchList, action.userShow.show.name],
          }
        : {
            ...state,
            seen: [...state.seen, action.userShow],
            seenList: [...state.seenList, action.userShow.show.name],
          };
    case DELETE_SHOW:
      return action.userShow.type === 'rec'
        ? {
            ...state,
            userShows: state.userShows.filter(
              (userShow) => userShow.show.id !== action.userShow.show.id
            ),
            showList: state.showList.filter(
              (showName) => showName !== action.userShow.show.name
            ),
          }
        : action.userShow.type === 'watch'
        ? {
            ...state,
            toWatch: state.toWatch.filter(
              (toWatch) => toWatch.show.id !== action.userShow.show.id
            ),
            watchList: state.watchList.filter(
              (showName) => showName !== action.userShow.show.name
            ),
          }
        : {
            ...state,
            seen: state.userShows.filter(
              (userShow) => userShow.show.id !== action.userShow.show.id
            ),
            seenList: state.seenList.filter(
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
    case GET_USER_TAGS:
      return {
        ...state,
        userTags: action.tags,
      };
    case CHANGE_USER_TAGS:
      return {
        ...state,
        userTags: action.tags,
      };
    case CHANGE_SHOW_TAGS:
      return action.userShow.type === 'rec'
        ? {
            ...state,
            userShows: [
              ...state.userShows.filter(
                (userShow) => userShow.id !== action.userShow.id
              ),
              action.userShow,
            ],
          }
        : {
            ...state,
            toWatch: [
              ...state.toWatch.filter(
                (toWatch) => toWatch.id !== action.userShow.id
              ),
              action.userShow,
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
    case LOGGING_OUT:
      return { ...initialState, loggingOut: true };
    case CLEAR_DATA:
      return initialState;
    default:
      return state;
  }
}
