import {
  GET_ALL_OTHER_USERS,
  GET_FOLLOWING_REC_SHOWS,
  CLEAR_DATA,
} from '../constants';

const initialState = {
  usersInfo: [],
};

export default function usersReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ALL_OTHER_USERS:
      return {
        ...state,
        usersInfo: action.users,
      };
    default:
      return state;
  }
}
