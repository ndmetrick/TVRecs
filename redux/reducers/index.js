import { combineReducers } from 'redux';
import userReducer from './user';
import usersReducer from './users';
import singleShowReducer from './singleShow';

const Reducers = combineReducers({
  userState: userReducer,
  usersState: usersReducer,
  singleShowState: singleShowReducer,
});

export default Reducers;
