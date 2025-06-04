const PaymentSuccess = () => {
  return (
 
     <div className=" flex justify-content-center align-items-center p-4">
     <div className="flex flex-col justify-content-center align-items-center p-4 text-center bg-white rounded shadow-md max-w-md w-full mx-auto ">
       <h1 className="text-center my-6 text-2xl text-green-500 font-bold">
        Payment Successful
      </h1>
      <p className="text-center">
        Thank you for your payment! Your order has been completed
        successfully.
      </p>
      <button
        onClick={() => window.location.href = "https://maloncho.foodpos.io"}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
      >
        Back to Home
      </button>
     </div>
    </div>
  );
};

export default PaymentSuccess;
