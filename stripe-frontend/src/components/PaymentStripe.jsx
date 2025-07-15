import { useEffect, useState, useMemo } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import CheckoutForm from "./CheckoutForm";
import { useSearchParams } from "react-router";   // ← ✅ use the DOM build
import { ref, get } from "firebase/database";
import { database } from "../firebase/firebaseConfig";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentStripe = () => {
  const [searchParams] = useSearchParams();
  const orderId = useMemo(() => searchParams.get("orderId"), [searchParams]);
  const token   = useMemo(() => searchParams.get("token"),   [searchParams]);

  const [orderNetAmount, setOrderNetAmount] = useState(null);   // number
  const [stripeData,      setStripeData]    = useState(null);   // { acct, fee }
  const [clientSecret,    setClientSecret]  = useState("");     // string

  /* ────────────────────────── 1. FETCH ORDER AMOUNT ────────────────────────── */
  useEffect(() => {
    if (!orderId || !token) return;

    const abort = new AbortController();

    (async () => {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/orderMaster/findById`,
          {},
          {
            params  : { orderId },
            headers : {
              "Content-Type": "application/json",
              Authorization : `Bearer ${token}`,
            },
            signal: abort.signal,
          }
        );

        const amount = Number(data?.obj?.neetAmount);
        if (!isNaN(amount) && amount > 0) setOrderNetAmount(amount);
      } catch (err) {
        if (err.name !== "CanceledError")
          console.error("Fetch order amount error:", err.message || err);
      }
    })();

    return () => abort.abort();
  }, [orderId, token]);

  /* ─────────────────────────── 2. FETCH STRIPE DATA ────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const snap = await get(ref(database, "foodpos/maloncho/stripe"));
        if (cancelled) return;

        if (snap.exists()) {
          const { acct, fee } = snap.val() ?? {};
          if (acct && fee) setStripeData({ acct, fee: Number(fee) });
        } else {
          console.warn("No Stripe data found in Firebase");
        }
      } catch (error) {
        console.error("Error fetching Stripe data:", error);
      }
    })();

    return () => { cancelled = true };
  }, []);

  /* ─────────────────── 3. CREATE PAYMENT‑INTENT WHEN READY ─────────────────── */
  useEffect(() => {
    if (!orderNetAmount || !stripeData?.acct || !stripeData?.fee) return;

    const payload = {
      amount: (orderNetAmount + stripeData.fee) * 100, // £10.00 → 1000
      fee   : stripeData.fee,
      acct  : stripeData.acct,
    };

    const abort = new AbortController();

    (async () => {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/payment/create-payment-intent`,
          payload,
          { signal: abort.signal }
        );
        if (data?.clientSecret) setClientSecret(data.clientSecret);
      } catch (err) {
        if (err.name !== "CanceledError")
          console.error(
            "Create payment‑intent error:",
            err.response?.data || err.message || err
          );
      }
    })();

    return () => abort.abort();
  }, [orderNetAmount, stripeData]);

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  const appearance = { theme: "stripe" };

  return (
    <>
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance }}
          /* ❶ The key forces a fresh mount when clientSecret changes.
             ❷ This resets internal WebKit pop‑up locks on iOS/Safari. */
          key={clientSecret}
        >
          <CheckoutForm stripeData={stripeData} />
        </Elements>
      )}
    </>
  );
};

export default PaymentStripe;
