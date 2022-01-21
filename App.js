import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './client/redux/reducers'
import thunk from 'redux-thunk'
import Start from './Start'

const store = createStore(rootReducer, applyMiddleware(thunk))

const App = () => {
  return (
    <Provider store={store}>
      <Start />
    </Provider>
  )
}

export default App
