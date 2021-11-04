import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './client/redux/reducers';
import thunk from 'redux-thunk';
import App from './App';

const store = createStore(rootReducer, applyMiddleware(thunk));

const index = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default index;
