import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../Home/Home";
import PaymentSuccess from "../components/PaymentSuccess";
import NotFound from "../components/Notfound";
import PayLaterSuccess from "../components/PayLaterSuccess";

const router = createBrowserRouter([
  {
    path: "/",
    Component: () => <RootLayout />,
    errorElement: <NotFound /> ,
    children: [
      {
        index: true,
        path: "/",
        Component: () => <Home />,
      },
      {
        path: "/success",
        Component: () => <PaymentSuccess />,
      },
      {
        path: "/order-success",
        Component: () => <PayLaterSuccess />,
      }
    ],
  },
]);

export default router;
