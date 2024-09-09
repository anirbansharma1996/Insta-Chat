import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    {/* <AgoraRTCProvider client={client}> */}
      <RouterProvider router={router}>
        <App />
      </RouterProvider>
    {/* </AgoraRTCProvider> */}
  </Provider>
);
