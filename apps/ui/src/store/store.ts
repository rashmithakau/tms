import { configureStore, combineReducers } from "@reduxjs/toolkit";
import dashboardNavReducer from './slices/dashboardNavSlice'; 
import empMenuNavReducer from './slices/empMenuNavSclice'; 

const appReducer = combineReducers({
    dashboardNav: dashboardNavReducer,
    empMenuNav: empMenuNavReducer,
});


const rootReducer = (state: any, action: any) => {
    if (action.type === "LOGOUT") {
        state = undefined;
    }
    return appReducer(state, action);
};

const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;