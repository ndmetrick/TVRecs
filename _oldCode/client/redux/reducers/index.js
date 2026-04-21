import { combineReducers } from 'redux';
import userReducer from './user';
import usersReducer from './users';
import otherUserReducer from './otherUser';

const Reducers = combineReducers({
  currentUser: userReducer,
  allOtherUsers: usersReducer,
  otherUser: otherUserReducer,
});

export default Reducers;
