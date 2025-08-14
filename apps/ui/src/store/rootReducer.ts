import { combineReducers } from 'redux';
import userReducer from './slices/userSlice';
import dashboardNavReducer from './slices/dashboardNavSlice';

const appReducer = combineReducers({
  user: userReducer,
  dashboardNav: dashboardNavReducer,
  // Add other reducers here
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'LOGOUT') {
    state = undefined; // Reset Redux state
  }
  return appReducer(state, action);
};

export default rootReducer;