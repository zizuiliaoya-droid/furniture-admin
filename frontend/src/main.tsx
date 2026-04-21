import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { bauhausTheme } from "./styles/theme";
import App from "./App";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider theme={bauhausTheme} locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
