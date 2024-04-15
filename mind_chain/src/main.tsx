import React from "react";
import ReactDOM from "react-dom/client";
import Login from "./pages/Login.tsx";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import MyRouter from "./router/MyRouter.tsx";

import "./index.css";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <MyRouter />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);