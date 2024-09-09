import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Register from "../pages/Register";
import CheckEmail from "../pages/CheckEmail";
import CheckPassword from "../pages/CheckPassword";
import Home from "../pages/Home";
import Message from "../components/Message";
import AuthLayouts from "../layout/AuthLayouts";
import ForgotPassword from "../pages/ForgotPassword";
import Features from "../pages/Features";
import { LiveVideo } from "../components/code/video/LiveVideo";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "via/:channelName",
        element: (
          <AuthLayouts>
            <LiveVideo />
          </AuthLayouts>
        ),
      },
      {
        path: "register",
        element: (
          <AuthLayouts>
            <Register />
          </AuthLayouts>
        ),
      },
      {
        path: "features",
        element: <Features />,
      },
      {
        path: "email",
        element: (
          <AuthLayouts>
            <CheckEmail />
          </AuthLayouts>
        ),
      },
      {
        path: "password",
        element: (
          <AuthLayouts>
            <CheckPassword />
          </AuthLayouts>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <AuthLayouts>
            <ForgotPassword />
          </AuthLayouts>
        ),
      },
      
      {
        path: "",
        element: <Home />,
        children: [
          {
            path: ":userId",
            element: <Message />,
          },
        ],
      },
    ],
  },
]);

export default router;
