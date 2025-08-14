import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Use localStorage as the default storage
import dashboardNavReducer from "./slices/dashboardNavSlice";
import userReducer from "./slices/userSlice";

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // Only persist the `user` slice
};

// Combine reducers
const rootReducer = combineReducers({
  dashboardNav: dashboardNavReducer, // Non-persistent slice
  user: userReducer, // Persistent slice
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for redux-persist
    }),
});

// Create a persistor for the store
export const persistor = persistStore(store);

// Export types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;