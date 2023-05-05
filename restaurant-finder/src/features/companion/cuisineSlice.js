import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCuisines = createAsyncThunk(
  "cuisines/fetchCuisines",
  async () => {
    const response = await axios.get("/api/cuisines");
    return response.data;
  }
);

const cuisinesSlice = createSlice({
  name: "cuisines",
  initialState: {
    data: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCuisines.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCuisines.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchCuisines.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default cuisinesSlice.reducer;

// Selectors
export const selectAllCuisines = (state) => state.cuisines.data;
export const selectCuisinesStatus = (state) => state.cuisines.status;
export const selectCuisinesError = (state) => state.cuisines.error;
