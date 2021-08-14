import { combineReducers } from 'redux';
import userReducer from './user';
import usersReducer from './users';

const Reducers = combineReducers({
  userState: userReducer,
  usersState: usersReducer,
});

export default Reducers;
