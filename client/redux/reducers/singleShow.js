import { USER_SHOW_STATE_CHANGE, USERS_SHOW_STATE_CHANGE } from '../constants';

const initialState = {};

export default function singleShowReducer(state = initialState, action) {
  switch (action.type) {
    case USER_SHOW_STATE_CHANGE:
      console.log('3HELLOLLO');
      console.log('reducer', action.show);
      return action.show;
    case USERS_SHOW_STATE_CHANGE:
      console.log('3HELLOLLO');
      console.log('reducer', action.show);
      return action.show;
    default:
      return state;
  }
}
