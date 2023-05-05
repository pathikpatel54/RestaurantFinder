import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import companionReducer from "../features/companion/companionSlice";
import websocketReducer from "../features/companion/websocketSlice";
import cuisineReducer from "../features/companion/cuisineSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companion: companionReducer,
    websocket: websocketReducer,
    cuisines: cuisineReducer,
  },
});
