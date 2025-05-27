import React from "react";
import { useNavigate } from "react-router";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className=" max-w-md mx-auto mt-10 p-4">
      <h1 className="text-center my-6 text-2xl text-green-500 font-bold">
        Payment Successful
      </h1>
      <p className="text-center">
        Thank you for your payment! Your transaction has been completed
        successfully.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
      >
        Back to Home
      </button>
    </div>
  );
};

export default PaymentSuccess;
