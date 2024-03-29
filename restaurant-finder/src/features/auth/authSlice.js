import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  user: {},
  status: "idle",
  error: "",
};

export const postLogin = createAsyncThunk("auth/postLogin", async (user) => {
  const response = await axios.post("/api/login", user);
  return response.data;
});

export const postSignUp = createAsyncThunk("auth/postSignUp", async (user) => {
  const response = await axios.post("/api/signup", user);
  return response.data;
});

export const fetchAuth = createAsyncThunk("auth/fetchAuth", async () => {
  const response = await axios.get("/api/user");
  return response.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAuth.pending, (state) => {
        state.status = "pending";
        state.error = "";
      })
      .addCase(fetchAuth.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.user = action.payload;
        state.error = "";
      })
      .addCase(fetchAuth.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message;
      })
      .addCase(postLogin.pending, (state) => {
        state.status = "pending";
        state.error = "";
      })
      .addCase(postLogin.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.user = action.payload;
        state.error = "";
      })
      .addCase(postLogin.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message;
      })
      .addCase(postSignUp.pending, (state) => {
        state.status = "pending";
        state.error = "";
      })
      .addCase(postSignUp.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.user = action.payload;
        state.error = "";
      })
      .addCase(postSignUp.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message;
      });
  },
});

export const selectAllAuth = (state) => state.auth.user;
export const getAuthStatus = (state) => state.auth.status;
export const getAuthError = (state) => state.auth.error;

export default authSlice.reducer;
