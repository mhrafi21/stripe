import { RouterProvider } from "react-router";
import router from "./Routes/router";
import { ToastContainer } from "react-toastify";
function App() {
  return (
    <div>
      <ToastContainer />
      <RouterProvider router={router}></RouterProvider>
    </div>
  );
}

export default App;
