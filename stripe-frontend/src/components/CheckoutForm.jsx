import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router";
import { ref, set, update } from "firebase/database";
import { useState } from "react";
import { database } from "../firebase/firebaseConfig";
import { useEffect } from "react";
import { toast } from "react-toastify";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [orderAmount, setOrderAmount] = useState(0);
  const navigate = useNavigate();
  const nAmount = orderAmount.toFixed(2); // Default to 0.00 if not provided
  const netAmount = Number(nAmount);
  const orderId = searchParams.get("orderId") || "no-order-id";
  const userId = searchParams.get("userId") || "no-user-id";
  const token = searchParams.get("token") || "no-token";

  const [ipAddress, setIPAddress] = useState("");
  const [deviceID, setDeviceID] = useState("");

  // back event
  const handleBack = () => {
    navigate(-1);
  };

  // fetch order amount;
  useEffect(() => {
    axios
      .post(
        ` ${
          import.meta.env.VITE_BASE_URL
        }/api/orderMaster/findById?orderId=${orderId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => setOrderAmount(res?.data?.obj?.neetAmount))
      .catch((err) => console.log(err.message));
  }, [orderId, token]);

  // IP address and device id;
  useEffect(() => {
    // Fetch IP address
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => setIPAddress(data.ip))
      .catch((error) => console.log(error));

    // Generate device ID
    const userAgent = window.navigator.userAgent;
    const vendor = window.navigator.vendor || "";
    const language = window.navigator.language || "";
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const randomString =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const deviceID = `${userAgent}-${vendor}-${language}-${screenResolution}-${randomString}`;
    setDeviceID(deviceID);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      metadata: {
        orderId: orderId,
        userId: userId,
      },
      redirect: "if_required",
      confirmParams: {
        return_url: `https://pay.foodpos.io/success?orderId=${orderId}&userId=${userId}&token=${token}`,
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message || "Payment failed");
      toast.error(error.message);
    }

    // data set after payment DONE;
    try {
      await set(
        ref(database, `foodpos/maloncho/stripe/user/${userId}/${orderId}`),
        {
          netAmount: netAmount,
          ipAddress: ipAddress,
          deviceID: deviceID,
          orderId: orderId,
          payment_status: "DONE",
          payment_submit: false,
          paymenttext: "paymentIntent",
          userId: userId,
        }
      );
    } catch (error) {
      console.error("Error writing to Firebase:", error);
    }

    if (paymentIntent?.status === "succeeded") {
      // Handle successful payment here, e.g., update order status, notify user, etc.
      const updatePaymentInfoWithId = {
        orderId: Number(orderId),
        status: "SETTLED",
        isActive: 1,
        totalPayment: paymentIntent?.amount / 100 || 0.0,
        note: JSON.stringify(paymentIntent) || "no payment intent",
        remarks: "web pay",
        paymentDetails: {
          orderAmount: paymentIntent?.amount / 100 || 0.0,
          paymentType: paymentIntent?.payment_method_types[0] || "stripe",
          cardPayment: paymentIntent?.amount / 100 || 0.0,
          totalPayment: paymentIntent?.amount / 100 || 0.0,
        },
      };

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/orderMaster/paymentUpdate`,
        updatePaymentInfoWithId,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Payment Succeeded!");
      // update payment_submit true after payment info is successfully added.

      try {
        await update(
          ref(database, `foodpos/maloncho/stripe/user/${userId}/${orderId}`),
          {
            payment_submit: true,
          }
        );
      } catch (error) {
        console.error("Error writing to Firebase:", error);
      }
      navigate(`/success?orderId=${orderId}&userId=${userId}&token=${token}`);
    }
    setLoading(false);
  };

  // pay later event
  const handlePayLater = async () => {
    const updatePaymentInfoWithId = {
      orderId: Number(orderId),
      status: "PAYLATER",
      isActive: 1,
      totalPayment: netAmount || 0.0,
      note: "",
      remarks: "paylater",
      paymentDetails: {
        orderAmount: netAmount || 0.0,
        paymentType: "",
        cardPayment: 0.0,
        totalPayment: 0.0,
      },
    };

    await axios.put(
      `${import.meta.env.VITE_BASE_URL}/api/orderMaster/paymentUpdate`,
      updatePaymentInfoWithId,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    window.location.href = "https://maloncho.foodpos.io/profile";
  };

  return (
    <div>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-5">
          <button
            className="flex items-center gap-2 cursor-pointer font-semibold"
            onClick={handleBack}
          >
            <svg
              enableBackground="new 0 0 24 24"
              height="18px"
              version="1.1"
              viewBox="0 0 32 32"
              width="18px"
              xmlSpace="preserve"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <path
                clipRule="evenodd"
                d="M31.106,15H3.278l8.325-8.293  c0.391-0.391,0.391-1.024,0-1.414c-0.391-0.391-1.024-0.391-1.414,0l-9.9,9.899c-0.385,0.385-0.385,1.029,0,1.414l9.9,9.9  c0.391,0.391,1.024,0.391,1.414,0c0.391-0.391,0.391-1.024,0-1.414L3.278,17h27.828c0.552,0,1-0.448,1-1  C32.106,15.448,31.658,15,31.106,15z"
                fill="#121313"
                fillRule="evenodd"
                id="Arrow_Back"
              />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
            </svg>
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div></div>
            <p className="mb-2 ">
              {" "}
              <span className="text-blue-500">
                Order Total: <strong>£{nAmount}</strong> +
              </span>{" "}
              <span className="text-blue-500">
                Platform Fee: <strong>£5</strong>
              </span>
            </p>

            <p className=" text-2xl">
              <span>Payable amount:</span>{" "}
              <strong>£{Number(netAmount).toFixed(2)}</strong>
            </p>
          </div>
          <div className="">
            <div className="">
              <div className="mt-3">
                <form onSubmit={handleSubmit}>
                  <PaymentElement />
                  <button
                    disabled={loading || !stripe}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                  >
                    {loading ? " Processing…" : " Pay In Card"}
                  </button>
                </form>
              </div>
              <div>
                <button
                  onClick={handlePayLater}
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                >
                  Pay In Cash
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
