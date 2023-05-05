import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  companion: {},
  status: "idle",
  error: "",
};

export const addCompanion = createAsyncThunk(
  "companion/addCompanion",
  async (companion) => {
    const response = await axios.post("/api/companion", companion);
    return response.data;
  }
);

export const fetchCompanion = createAsyncThunk(
  "companion/fetchCompanion",
  async () => {
    const response = await axios.get(`/api/companion`);
    return response.data;
  }
);

const companionSlice = createSlice({
  name: "companion",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCompanion.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchCompanion.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.companion = action.payload;
      })
      .addCase(fetchCompanion.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message;
      })
      .addCase(addCompanion.pending, (state) => {
        state.status = "pending";
      })
      .addCase(addCompanion.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.companion = action.payload;
      })
      .addCase(addCompanion.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message;
      });
  },
});

export const selectAllCompanion = (state) => state.companion.companion;
export const getCompanionStatus = (state) => state.companion.status;
export const getCompanionError = (state) => state.companion.error;

export default companionSlice.reducer;
