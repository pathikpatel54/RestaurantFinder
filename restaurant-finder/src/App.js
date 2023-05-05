import { BackgroundImage, MantineProvider, Overlay } from "@mantine/core";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./component/Home";
import HeaderMegaMenu from "./component/Header";
import Login from "./component/Login";
import SignUp from "./component/Signup";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuth, selectAllAuth } from "./features/auth/authSlice";
import Landing from "./component/Landing";
import Preferences from "./component/Preferences";
import AddressInput from "./component/Test";
import { fetchFavorites } from "./features/favorites/favoriteSlice";
import Favorites from "./component/Favorites";
import { Notifications } from "@mantine/notifications";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAuth());
    dispatch(fetchFavorites());
  }, []);
  const user = useSelector(selectAllAuth);

  return (
    <MantineProvider
      theme={{
        colorScheme: "dark",
      }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Notifications />

      <div className="background">
        <BrowserRouter>
          <HeaderMegaMenu />
          <Routes>
            <Route path="/" element={user.username ? <Landing /> : <Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </BrowserRouter>
      </div>
    </MantineProvider>
  );
}

export default App;
