import { GET_ALL_OTHER_USERS, GET_ALL_TAGS } from '../constants';

const initialState = {
  usersInfo: [],
  allTags: [],
};

export default function usersReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ALL_OTHER_USERS:
      return {
        ...state,
        usersInfo: action.users,
      };
    case GET_ALL_TAGS:
      return {
        ...state,
        allTags: action.tags,
      };
    default:
      return state;
  }
}
