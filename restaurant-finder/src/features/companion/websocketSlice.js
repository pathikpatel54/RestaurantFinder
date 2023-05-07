import { createSlice } from "@reduxjs/toolkit";

let ws = null; // Store the WebSocket reference outside the Redux store

const websocketSlice = createSlice({
  name: "websocket",
  initialState: {
    status: "disconnected",
    messages: [],
  },
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
});

export const { setStatus, addMessage } = websocketSlice.actions;

export const setConnection = (connection) => (dispatch) => {
  ws = connection;
  dispatch(setStatus("connected"));
};

export const closeConnection = () => (dispatch) => {
  if (ws) {
    ws.close();
    ws = null;
    dispatch(setStatus("disconnected"));
  }
};

export const sendMessage = async (message) => {
  while (ws === null) {
    console.log(ws);
    // Wait for the WebSocket connection to be established
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log(ws);
  ws.send(JSON.stringify(message));
};

export default websocketSlice.reducer;
