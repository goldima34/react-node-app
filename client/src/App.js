import React, { useContext, useEffect, useState } from "react";
import { Context } from "./index";
import { observer } from "mobx-react-lite";
import NavBar from "./components/NavBar";
import { AppRouter } from "./components/AppRouter";
import Shop from "./pages/Shop";
import "./styles/index.module.css";

const App = () => {
  const { userStore } = useContext(Context);

  useEffect(() => {
    async function fetchData() {
      if (localStorage.getItem("token")) {
        await userStore.checkAuth();
      }
    }
    fetchData();
  }, []);
  console.log(userStore.isAuth);
  return (
    <div>
      <NavBar />
      <AppRouter />
    </div>
  );
};

export default observer(App);
