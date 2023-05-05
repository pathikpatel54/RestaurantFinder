// src/favoritesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  favorites: [],
  status: "idle",
  error: null,
};

export const saveFavorite = createAsyncThunk(
  "favorites/saveFavorite",
  async (favorite, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/favorites", favorite);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  "favorites/getFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/favorites");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveFavorite.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveFavorite.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.favorites.push(action.payload?.restaurant);
      })
      .addCase(saveFavorite.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchFavorites.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.favorites = action.payload?.map((response) => {
          return response?.restaurant;
        });
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default favoritesSlice.reducer;

export const selectFavorites = (state) => state.favorites.favorites;
export const selectStatus = (state) => state.favorites.status;
export const selectError = (state) => state.favorites.error;
