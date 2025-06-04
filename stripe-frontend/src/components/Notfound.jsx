// NotFound.tsx
import React from "react";

const NotFound = () => {
  return (
    <div className=" flex justify-content-center align-items-center p-4">
     <div className="flex flex-col justify-content-center align-items-center text-center bg-white rounded shadow-md max-w-md w-full mx-auto p-4">
         <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg mt-2">Page Not Found</p>
      <button
        onClick={() => (window.location.href = "https://maloncho.foodpos.io")}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
      >
        Back to Home
      </button>
     </div>
    </div>
  );
};

export default NotFound;
