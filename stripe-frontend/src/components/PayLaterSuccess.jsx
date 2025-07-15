import { CheckCircle } from 'lucide-react';
const PayLaterSuccess = ({ redirectUrl = "https://malonchotandoori.com" }) => {
  const handleBackToHome = () => {
    window.location.href = redirectUrl;
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-gray-50">
      <div className="flex flex-col justify-center items-center p-6 sm:p-8 bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto border border-gray-100">
        <div className="mb-6 sm:mb-8">
          <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-600" />
        </div>
        <h2 className="text-center mb-4 text-2xl sm:text-3xl font-bold text-gray-900">
          Order Submitted Successfully!
        </h2>
        <p className="text-center text-gray-600 mb-6 sm:mb-8">
          Thank you for your order. The payment can pay at a later time.
        </p>
        <button
          onClick={handleBackToHome}
          className="w-full bg-emerald-600 text-white py-2 sm:py-3 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:bg-gray-400"
          aria-label="Return to Home"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PayLaterSuccess;
