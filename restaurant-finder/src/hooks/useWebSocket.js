import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setConnection,
  closeConnection,
  setStatus,
  addMessage,
} from "../features/companion/websocketSlice";

const useWebSocket = (path = "/") => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.websocket.status);
  const messages = useSelector((state) => state.websocket.messages);

  useEffect(() => {
    if (status === "disconnected") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const domain = window.location.host;
      const url = `${protocol}//${domain}${path}`;

      const ws = new WebSocket(url);

      ws.onopen = () => {
        dispatch(setConnection(ws));
        dispatch(setStatus("connected"));
      };

      ws.onmessage = (message) => {
        dispatch(addMessage(message.data));
      };

      ws.onclose = () => {
        dispatch(setStatus("disconnected"));
        dispatch(closeConnection());
      };

      ws.onerror = () => {
        dispatch(setStatus("error"));
        dispatch(closeConnection());
      };
    }
  }, [status, dispatch, path]);

  useEffect(() => {
    return () => {
      dispatch(setStatus("disconnected"));
      dispatch(closeConnection());
    };
  }, [dispatch]);

  return { status, messages };
};

export default useWebSocket;
