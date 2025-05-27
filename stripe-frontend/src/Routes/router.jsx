import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../Home/Home";
import PaymentSuccess from "../components/PaymentSuccess";

const router = createBrowserRouter([{
    path: "/",
   Component: () => <RootLayout />,
   errorElement: <div>Error loading page</div>,
    children: [
        {
            index: true,
            path: '/',
            Component: () => <Home />,
        },
        {
            path: "/success",
            Component: () => <PaymentSuccess />
        }
    ]
}])

export default router;